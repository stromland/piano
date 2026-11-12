import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';

import { frequencyOf, useSound } from './useSound';

interface Started {
  kind: 'oscillator' | 'recording';
  at: number;
  frequency?: number;
  recording?: string;
  playbackRate?: number;
}

const started: Started[] = [];
const damped: number[] = [];

class FakeParam {
  constructor(private readonly owner?: FakeGain) {}
  setValueAtTime() {}
  linearRampToValueAtTime() {}
  exponentialRampToValueAtTime() {}
  setTargetAtTime(_: number, at: number) {
    if (this.owner?.isDamper) damped.push(at);
  }
}

class FakeNode {
  connect<T>(node: T) {
    return node;
  }
}

class FakeGain extends FakeNode {
  /** A gain made without options is a damper. */
  isDamper: boolean;
  gain = new FakeParam(this);
  constructor(_: unknown, options?: object) {
    super();
    this.isDamper = options === undefined;
  }
}

class FakeOscillator extends FakeNode {
  frequency: number;
  constructor(_: unknown, options: { frequency: number }) {
    super();
    this.frequency = options.frequency;
  }
  start(at: number) {
    started.push({ kind: 'oscillator', at, frequency: this.frequency });
  }
  stop() {}
}

class FakeBufferSource extends FakeNode {
  constructor(
    _: unknown,
    private readonly options: { buffer: string; playbackRate: number },
  ) {
    super();
  }
  start(at: number) {
    started.push({
      kind: 'recording',
      at,
      recording: this.options.buffer,
      playbackRate: this.options.playbackRate,
    });
  }
  stop() {}
}

class FakeAudioContext {
  currentTime = 0;
  state = 'running';
  destination = new FakeNode();
  resume = vi.fn(async () => {});
  close = vi.fn(async () => {});
  /** The "decoded" recording is the URL it was fetched from. */
  decodeAudioData = vi.fn(async (file: ArrayBuffer) =>
    new TextDecoder().decode(file),
  );
}

function stubWebAudio() {
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('OscillatorNode', FakeOscillator);
  vi.stubGlobal('AudioBufferSourceNode', FakeBufferSource);
  vi.stubGlobal('GainNode', FakeGain);
  vi.stubGlobal('DynamicsCompressorNode', FakeNode);
}

const fetchRecording = vi.fn(async (url: string) => ({
  ok: true,
  url,
  arrayBuffer: async () => new TextEncoder().encode(url).buffer,
}));

function mountSound() {
  const sound: { play?: ReturnType<typeof useSound>['play'] } = {};
  const wrapper = mount(
    defineComponent({
      setup() {
        sound.play = useSound().play;
        return () => null;
      },
    }),
  );
  const play: ReturnType<typeof useSound>['play'] = async (keys, style) =>
    sound.play?.(keys, style);
  return { wrapper, play };
}

beforeEach(() => {
  fetchRecording.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  started.length = 0;
  damped.length = 0;
});

describe('frequencyOf', () => {
  it('tunes the A above middle C to 440 Hz', () => {
    expect(frequencyOf(21)).toBe(440);
    expect(frequencyOf(9)).toBe(220);
  });
});

describe('useSound', () => {
  it('does nothing without Web Audio', async () => {
    const { play } = mountSound();
    await expect(play([0, 4, 7], 'together')).resolves.toBeUndefined();
  });

  it('plays the recordings of a grand piano', async () => {
    stubWebAudio();
    vi.stubGlobal('fetch', fetchRecording);
    const { play, wrapper } = mountSound();
    // The recordings are downloaded before anything is played.
    expect(fetchRecording).toHaveBeenCalledTimes(17);

    // C, E and G: E has no recording of its own, so D♯ is played faster.
    await play([12, 16, 19], 'together');
    expect(started.map(({ kind }) => kind)).toEqual(Array(3).fill('recording'));
    expect(started.map((it) => it.recording)).toEqual([
      '/samples/C4.mp3',
      '/samples/Ds4.mp3',
      '/samples/Fs4.mp3',
    ]);
    expect(started[1]?.playbackRate).toBeCloseTo(2 ** (1 / 12));
    expect(started[2]?.playbackRate).toBeCloseTo(2 ** (1 / 12));
    const times = started.map((it) => it.at);
    expect(Math.max(...times) - Math.min(...times)).toBeLessThan(0.1);
    // Nothing was sounding yet, so nothing was silenced.
    expect(damped).toEqual([]);

    wrapper.unmount();
  });

  it('plays a scale one key at a time, up and down', async () => {
    stubWebAudio();
    vi.stubGlobal('fetch', fetchRecording);
    const { play, wrapper } = mountSound();

    await play([0, 2, 4], 'upAndDown');
    expect(started).toHaveLength(5);
    const times = started.map((it) => it.at);
    expect(Math.max(...times) - Math.min(...times)).toBeCloseTo(1.2);

    wrapper.unmount();
  });

  it('silences the keys still sounding when new ones are played', async () => {
    stubWebAudio();
    vi.stubGlobal('fetch', fetchRecording);
    const { play, wrapper } = mountSound();

    await play([0, 4, 7], 'together');
    await play([2, 5, 9], 'together');
    expect(damped).toHaveLength(3);

    wrapper.unmount();
  });

  it('plays a synth when the recordings cannot be downloaded', async () => {
    stubWebAudio();
    const offline = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });
    vi.stubGlobal('fetch', offline);
    const { play, wrapper } = mountSound();
    await flushPromises();

    await play([9, 21], 'together');
    expect(started.map((it) => it.kind)).toEqual(['oscillator', 'oscillator']);
    expect(started.map((it) => it.frequency)).toEqual([220, 440]);

    // Back online, the recordings are tried again.
    offline.mockImplementation(fetchRecording as never);
    started.length = 0;
    await play([9], 'together');
    expect(started.map((it) => it.kind)).toEqual(['recording']);

    wrapper.unmount();
  });

  it('does not wait long for slow recordings', async () => {
    vi.useFakeTimers();
    stubWebAudio();
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    );
    const { play, wrapper } = mountSound();

    const playing = play([0], 'together');
    await vi.advanceTimersByTimeAsync(500);
    await playing;
    expect(started.map((it) => it.kind)).toEqual(['oscillator']);

    wrapper.unmount();
  });
});
