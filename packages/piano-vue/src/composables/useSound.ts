import { onBeforeUnmount, onMounted } from 'vue';

import { SAMPLED_KEYS, nearestSample, sampleUrl } from './pianoSamples';

/** MIDI number of the keyboard's first key: the C an octave below middle C. */
const FIRST_KEY_MIDI = 48;

/** Seconds from one note of a scale to the next. */
const STEP = 0.3;

/** Seconds between the notes of a chord: a slight strum, so it sounds played. */
const STRUM = 0.02;

/** How long a chord, or the last note of a scale, is held before letting go. */
const HOLD = 2.2;

/**
 * How long the first notes wait for the recordings to load. After that they
 * are played on the synth instead, and the recordings are used once they are
 * ready.
 */
const LOAD_TIMEOUT_MS = 500;

export type PlayStyle = 'together' | 'oneByOne' | 'upAndDown';

/** The frequency in hertz of a key on the keyboard, tuned to A = 440 Hz. */
export function frequencyOf(keyIndex: number): number {
  return 440 * 2 ** ((keyIndex + FIRST_KEY_MIDI - 69) / 12);
}

type Recordings = ReadonlyMap<number, AudioBuffer>;

/** One sounding key. */
interface Voice {
  source: AudioScheduledSourceNode;
  /** Silences the key when the next notes are played, like a piano's damper. */
  damper: GainNode;
}

/**
 * Plays keys on a recorded grand piano. Until the recordings have loaded, or
 * if they cannot be loaded, a plain triangle-wave synth plays them instead.
 */
export function useSound() {
  let context: AudioContext | undefined;
  let output: AudioNode | undefined;
  let downloads: Promise<[number, ArrayBuffer][]> | undefined;
  let recordings: Promise<Recordings | undefined> | undefined;
  let voices: Voice[] = [];

  /** Fetches the recordings, each with the key it was recorded on. */
  function download(): Promise<[number, ArrayBuffer][]> {
    downloads ??= Promise.all(
      SAMPLED_KEYS.map(async (key): Promise<[number, ArrayBuffer]> => {
        const response = await fetch(sampleUrl(key, import.meta.env.BASE_URL));
        if (!response.ok) throw new Error(`${response.status} ${response.url}`);
        return [key, await response.arrayBuffer()];
      }),
    );
    return downloads;
  }

  /**
   * The decoded recordings, or undefined if they could not be loaded, for
   * instance when offline before the app was ever opened online. A failed
   * attempt is tried again the next time keys are played.
   */
  function load(audio: AudioContext): Promise<Recordings | undefined> {
    recordings ??= download()
      .then((files) =>
        Promise.all(
          files.map(async ([key, file]): Promise<[number, AudioBuffer]> => [
            key,
            await audio.decodeAudioData(file),
          ]),
        ),
      )
      .then((decoded): Recordings | undefined => new Map(decoded))
      .catch(() => {
        downloads = undefined;
        recordings = undefined;
        return undefined;
      });
    return recordings;
  }

  function outputOf(audio: AudioContext): AudioNode {
    if (!output) {
      // Keeps a chord of many keys from clipping.
      const limiter = new DynamicsCompressorNode(audio, {
        threshold: -10,
        ratio: 8,
      });
      limiter.connect(audio.destination);
      output = limiter;
    }
    return output;
  }

  function sampled(
    audio: AudioContext,
    piano: Recordings,
    key: number,
    at: number,
    hold: number,
    level: number,
  ): Voice {
    const { sampledKey, playbackRate } = nearestSample(key);
    const source = new AudioBufferSourceNode(audio, {
      buffer: piano.get(sampledKey),
      playbackRate,
    });
    const envelope = new GainNode(audio, { gain: level });
    // Letting go of the key.
    envelope.gain.setTargetAtTime(0, at + hold, 0.12);
    const damper = new GainNode(audio);
    source.connect(envelope).connect(damper).connect(outputOf(audio));
    source.start(at);
    source.stop(at + hold + 1);
    return { source, damper };
  }

  function synthesized(
    audio: AudioContext,
    key: number,
    at: number,
    hold: number,
    level: number,
  ): Voice {
    const source = new OscillatorNode(audio, {
      type: 'triangle',
      frequency: frequencyOf(key),
    });
    const envelope = new GainNode(audio, { gain: 0 });
    envelope.gain.setValueAtTime(0, at);
    envelope.gain.linearRampToValueAtTime(level * 0.25, at + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.001, at + hold);
    const damper = new GainNode(audio);
    source.connect(envelope).connect(damper).connect(outputOf(audio));
    source.start(at);
    source.stop(at + hold + 0.05);
    return { source, damper };
  }

  /** Quickly silences the keys that are still sounding, or yet to sound. */
  function releaseAll(audio: AudioContext) {
    const now = audio.currentTime;
    for (const { source, damper } of voices) {
      damper.gain.setTargetAtTime(0, now, 0.03);
      source.stop(now + 0.2);
    }
    voices = [];
  }

  async function play(keys: readonly number[], style: PlayStyle) {
    // Some browsers, and the tests, have no Web Audio.
    if (typeof AudioContext === 'undefined' || keys.length === 0) return;
    const audio = (context ??= new AudioContext());
    void audio.resume();

    const piano = await Promise.race([
      load(audio),
      new Promise<undefined>((resolve) => setTimeout(resolve, LOAD_TIMEOUT_MS)),
    ]);
    if (audio.state === 'closed') return;
    releaseAll(audio);

    const sequence =
      style === 'upAndDown' ? [...keys, ...keys.slice(0, -1).reverse()] : keys;
    const together = style === 'together';
    // Softer keys when several sound at once, so a chord is not louder than a note.
    const level = together ? 1 / Math.sqrt(keys.length) : 0.8;
    const start = audio.currentTime + 0.03;

    voices = sequence.map((key, position) => {
      const at = start + position * (together ? STRUM : STEP);
      const last = position === sequence.length - 1;
      // A scale is played legato: each key is let go as the next one sounds.
      const hold = together || last ? HOLD : STEP * 1.3;
      return piano
        ? sampled(audio, piano, key, at, hold, level)
        : synthesized(audio, key, at, hold, level);
    });
  }

  // Starts downloading early, so the first notes need not wait.
  onMounted(() => {
    if (typeof AudioContext !== 'undefined') download().catch(() => {});
  });

  onBeforeUnmount(() => {
    void context?.close();
  });

  return { play };
}
