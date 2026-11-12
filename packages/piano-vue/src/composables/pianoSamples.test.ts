import { describe, expect, it } from 'vitest';

import { SAMPLED_KEYS, nearestSample, sampleUrl } from './pianoSamples';

describe('SAMPLED_KEYS', () => {
  it('covers the keyboard from its first to its last key', () => {
    expect(SAMPLED_KEYS[0]).toBe(0);
    expect(SAMPLED_KEYS.at(-1)).toBe(48);
  });
});

describe('sampleUrl', () => {
  it('names the recording after its note and octave', () => {
    expect(sampleUrl(0)).toBe('/samples/C3.mp3');
    expect(sampleUrl(15, '/piano/')).toBe('/piano/samples/Ds4.mp3');
    expect(sampleUrl(30)).toBe('/samples/Fs5.mp3');
    expect(sampleUrl(45)).toBe('/samples/A6.mp3');
    expect(sampleUrl(48)).toBe('/samples/C7.mp3');
  });

  it('refuses a key that has no recording', () => {
    expect(() => sampleUrl(1)).toThrow();
  });
});

describe('nearestSample', () => {
  it('plays a sampled key as recorded', () => {
    expect(nearestSample(12)).toEqual({ sampledKey: 12, playbackRate: 1 });
  });

  it('bends the nearest recording at most one key', () => {
    for (let key = 0; key <= 48; key++) {
      const { sampledKey, playbackRate } = nearestSample(key);
      expect(SAMPLED_KEYS).toContain(sampledKey);
      expect(Math.abs(key - sampledKey)).toBeLessThanOrEqual(1);
      expect(playbackRate).toBeCloseTo(2 ** ((key - sampledKey) / 12));
    }
  });

  it('stretches the outermost recordings past the keyboard', () => {
    expect(nearestSample(-2).sampledKey).toBe(0);
    expect(nearestSample(50).sampledKey).toBe(48);
  });
});
