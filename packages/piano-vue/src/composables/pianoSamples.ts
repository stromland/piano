/**
 * Recordings of a grand piano, one for every third key of the keyboard. A key
 * without its own recording plays the nearest one a little faster or slower,
 * which is at most one key away and sounds just like the real thing.
 */

/** The keys that have a recording: every third key, from the first to the last. */
export const SAMPLED_KEYS = Array.from({ length: 17 }, (_, i) => i * 3);

const LAST_SAMPLED_KEY = SAMPLED_KEYS.at(-1) ?? 0;

/** File names use s for sharp, since # cannot be part of a URL path. */
const SAMPLE_NAMES = new Map([
  [0, 'C'],
  [3, 'Ds'],
  [6, 'Fs'],
  [9, 'A'],
]);

/** Octave of the keyboard's first key, the C an octave below middle C. */
const FIRST_OCTAVE = 3;

/** Where the recording of a sampled key is served from. */
export function sampleUrl(sampledKey: number, base = '/'): string {
  const name = SAMPLE_NAMES.get(sampledKey % 12);
  if (name === undefined) {
    throw new Error(`Key ${sampledKey} has no recording`);
  }
  const octave = FIRST_OCTAVE + Math.floor(sampledKey / 12);
  return `${base}samples/${name}${octave}.mp3`;
}

/** The recording to play for a key, and how much to speed it up or slow it down. */
export function nearestSample(keyIndex: number): {
  sampledKey: number;
  playbackRate: number;
} {
  const sampledKey = Math.min(
    Math.max(Math.round(keyIndex / 3) * 3, 0),
    LAST_SAMPLED_KEY,
  );
  return { sampledKey, playbackRate: 2 ** ((keyIndex - sampledKey) / 12) };
}
