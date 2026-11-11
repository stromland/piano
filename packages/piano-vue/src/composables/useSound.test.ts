import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent } from 'vue';

import { frequencyOf, useSound } from './useSound';

const started: { frequency: number; at: number }[] = [];

class FakeParam {
  setValueAtTime() {}
  linearRampToValueAtTime() {}
  exponentialRampToValueAtTime() {}
}

class FakeNode {
  gain = new FakeParam();
  frequency: number;
  constructor(_: unknown, options: { frequency?: number } = {}) {
    this.frequency = options.frequency ?? 0;
  }
  connect(node: FakeNode) {
    return node;
  }
  start(at: number) {
    started.push({ frequency: this.frequency, at });
  }
  stop() {}
}

class FakeAudioContext {
  currentTime = 0;
  destination = new FakeNode(undefined);
  resume = vi.fn(async () => {});
  close = vi.fn(async () => {});
}

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
  const play: ReturnType<typeof useSound>['play'] = (keys, style) =>
    sound.play?.(keys, style);
  return { wrapper, play };
}

afterEach(() => {
  vi.unstubAllGlobals();
  started.length = 0;
});

describe('frequencyOf', () => {
  it('tunes the A above middle C to 440 Hz', () => {
    expect(frequencyOf(21)).toBe(440);
    expect(frequencyOf(9)).toBe(220);
  });
});

describe('useSound', () => {
  it('does nothing without Web Audio', () => {
    const { play } = mountSound();
    expect(() => play([0, 4, 7], 'together')).not.toThrow();
  });

  it('plays a chord together and a scale one note at a time', () => {
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal('OscillatorNode', FakeNode);
    vi.stubGlobal('GainNode', FakeNode);
    const { play, wrapper } = mountSound();

    play([9, 21], 'together');
    expect(started.map((it) => it.frequency)).toEqual([220, 440]);
    const [first, second] = started.map((it) => it.at);
    expect((second ?? 0) - (first ?? 0)).toBeLessThan(0.1);

    started.length = 0;
    play([0, 2, 4], 'upAndDown');
    expect(started).toHaveLength(5);
    const times = started.map((it) => it.at);
    expect(Math.max(...times) - Math.min(...times)).toBeCloseTo(1.2);

    wrapper.unmount();
  });
});
