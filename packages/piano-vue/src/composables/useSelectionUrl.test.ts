import { describe, expect, it } from 'vitest';

import type { Selection } from '@stromland/piano-lib';

import { applyQuery, toQuery } from './useSelectionUrl';

const selection = (overrides: Partial<Selection> = {}): Selection => ({
  view: 'scale',
  root: 0,
  scale: 'major',
  chordType: 'major',
  tonality: 'major',
  chordSize: 'triad',
  keyChord: 0,
  inversion: 'root',
  octave: 0,
  ...overrides,
});

describe('toQuery', () => {
  it.each<[Partial<Selection>, string]>([
    [{ root: 3 }, '?view=scale&root=e-flat&scale=major'],
    [
      { root: 1, scale: 'harmonicMinor' },
      '?view=scale&root=c-sharp&scale=harmonic-minor',
    ],
    [
      {
        view: 'chord',
        root: 10,
        chordType: 'halfDiminished7',
        inversion: 'first',
      },
      '?view=chord&root=b-flat&chord=half-diminished7&inversion=first',
    ],
    [
      {
        view: 'key',
        root: 2,
        tonality: 'minor',
        chordSize: 'seventh',
        keyChord: 7,
      },
      '?view=key&root=d&key=minor&chords=sevenths&chord=V7&inversion=root',
    ],
  ])('writes %o as %s', (overrides, expected) => {
    expect(decodeURIComponent(toQuery(selection(overrides)))).toBe(expected);
  });
});

describe('applyQuery', () => {
  it('reads back every selection it writes', () => {
    const selections: Partial<Selection>[] = [
      { root: 6, scale: 'lydian' },
      { view: 'chord', root: 1, chordType: 'dominant7', inversion: 'third' },
      {
        view: 'key',
        root: 9,
        tonality: 'minor',
        chordSize: 'triad',
        keyChord: 8,
        inversion: 'second',
      },
    ];
    for (const overrides of selections) {
      const written = selection(overrides);
      const read = selection();
      applyQuery(read, toQuery(written));
      expect(read).toMatchObject(overrides);
    }
  });

  it('reads notes spelled with sharps or flats', () => {
    const read = selection();
    applyQuery(read, '?view=chord&root=d-flat');
    expect(read.root).toBe(1);
    applyQuery(read, '?view=chord&root=b-sharp');
    expect(read.root).toBe(0);
  });

  it('ignores what it does not know', () => {
    const read = selection();
    applyQuery(read, '?view=chord&root=h&chord=nine&inversion=fifth');
    expect(read).toEqual(selection({ view: 'chord' }));

    applyQuery(read, '?root=d');
    expect(read.root).toBe(0);

    applyQuery(read, '');
    expect(read).toEqual(selection({ view: 'chord' }));
  });
});
