import { onBeforeUnmount } from 'vue';

/** MIDI number of the keyboard's first key: the C an octave below middle C. */
const FIRST_KEY_MIDI = 48;

export type PlayStyle = 'together' | 'oneByOne' | 'upAndDown';

/** The frequency in hertz of a key on the keyboard, tuned to A = 440 Hz. */
export function frequencyOf(keyIndex: number): number {
  return 440 * 2 ** ((keyIndex + FIRST_KEY_MIDI - 69) / 12);
}

/**
 * Plays keys with a plain triangle-wave synth: enough to hear a chord or a
 * scale, without loading any samples.
 */
export function useSound() {
  let context: AudioContext | undefined;

  function play(keys: readonly number[], style: PlayStyle) {
    // Some browsers, and the tests, have no Web Audio.
    if (typeof AudioContext === 'undefined' || keys.length === 0) return;
    const audio = (context ??= new AudioContext());
    void audio.resume();

    const sequence =
      style === 'upAndDown' ? [...keys, ...keys.slice(0, -1).reverse()] : keys;
    const together = style === 'together';
    const length = together ? 1.8 : 0.5;
    const start = audio.currentTime + 0.03;

    sequence.forEach((key, position) => {
      // A slight strum, so a chord sounds played rather than switched on.
      const at = start + position * (together ? 0.02 : 0.3);
      const oscillator = new OscillatorNode(audio, {
        type: 'triangle',
        frequency: frequencyOf(key),
      });
      const gain = new GainNode(audio, { gain: 0 });
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.16, at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, at + length);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(at);
      oscillator.stop(at + length + 0.05);
    });
  }

  onBeforeUnmount(() => {
    void context?.close();
  });

  return { play };
}
