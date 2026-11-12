<script setup lang="ts">
import { computed } from 'vue';

import {
  BASS_LINES,
  type Clef,
  type Staff,
  TREBLE_LINES,
  formatNoteName,
} from '@stromland/piano-lib';

import { GLYPHS, type Glyph } from '../notation/bravura';

const props = defineProps<{
  staff: Staff;
  /** What the notes are, such as `'D major'`, for screen readers. */
  title: string;
}>();

/*
 * Everything is measured in staff spaces of 10 units; positions on the staff
 * are half a space apart. The drawing is 400 units wide and as tall as the
 * notes need at the highest octave they can move to, so middle C stays put
 * when they move.
 */
const SPACE = 10;
const STEP = SPACE / 2;
const WIDTH = 400;
const LEFT = 8;
const RIGHT = WIDTH - LEFT;
/** Extra room between the staves, below middle C. */
const GAP = 20;
/** Glyph units to drawing units: a staff space is 250 units in the font. */
const SCALE = SPACE / 250;
const CLEF_X = 14;
const KEY_SIGNATURE_X = 48;
const KEY_SIGNATURE_STEP = 11;
const CHORD_X = 226;
const HEAD = GLYPHS.noteheadWhole.width * SCALE;
const LEDGER = HEAD / 2 + 4;

const ACCIDENTALS: Record<number, Glyph> = {
  [-2]: GLYPHS.doubleFlat,
  [-1]: GLYPHS.flat,
  0: GLYPHS.natural,
  1: GLYPHS.sharp,
  2: GLYPHS.doubleSharp,
};

interface Placed {
  glyph: Glyph;
  x: number;
  y: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

const drawing = computed(() => {
  const { staff } = props;
  const middleC = STEP * Math.max(staff.top, 13) + 14;
  const yOf = (position: number, clef: Clef) =>
    middleC - STEP * position + (clef === 'bass' ? GAP : 0);
  const top = yOf(10, 'treble');
  const bottom = yOf(-10, 'bass');

  const lines = [
    ...TREBLE_LINES.map((position) => yOf(position, 'treble')),
    ...BASS_LINES.map((position) => yOf(position, 'bass')),
  ].map((y) => `M${LEFT} ${y}H${RIGHT}`);
  lines.push(`M${LEFT} ${top}V${bottom}`);

  const glyphs: Placed[] = [
    { glyph: GLYPHS.gClef, x: CLEF_X, y: yOf(4, 'treble') },
    { glyph: GLYPHS.fClef, x: CLEF_X, y: yOf(-4, 'bass') },
  ];
  staff.keySignature.forEach((mark, index) => {
    const x = KEY_SIGNATURE_X + index * KEY_SIGNATURE_STEP;
    const glyph = ACCIDENTALS[mark.accidental] ?? GLYPHS.sharp;
    glyphs.push({ glyph, x, y: yOf(mark.treble, 'treble') });
    glyphs.push({ glyph, x, y: yOf(mark.bass, 'bass') });
  });

  const start =
    KEY_SIGNATURE_X + staff.keySignature.length * KEY_SIGNATURE_STEP + 10;
  const slot = (RIGHT - start) / Math.max(1, staff.notes.length);
  const centres = staff.notes.map((note, index) =>
    staff.chord
      ? CHORD_X + (note.shifted ? HEAD - 1 : 0)
      : start + slot * (index + 0.5) + 5,
  );

  // In a chord, each column of accidentals starts where the one to its right
  // ends, as wide as its widest accidental.
  const columnWidths: number[] = [];
  for (const note of staff.notes) {
    const glyph = ACCIDENTALS[note.accidental ?? NaN];
    if (glyph) {
      columnWidths[note.accidentalColumn] = Math.max(
        columnWidths[note.accidentalColumn] ?? 0,
        glyph.width * SCALE,
      );
    }
  }

  staff.notes.forEach((note, index) => {
    const centre = centres[index] ?? 0;
    const y = yOf(note.position, note.clef);
    for (const position of note.ledgerLines) {
      const ledger = yOf(position, note.clef);
      lines.push(
        `M${round(centre - LEDGER)} ${ledger}H${round(centre + LEDGER)}`,
      );
    }
    glyphs.push({ glyph: GLYPHS.noteheadWhole, x: centre - HEAD / 2, y });
    const glyph = ACCIDENTALS[note.accidental ?? NaN];
    if (!glyph) return;
    let right = (staff.chord ? CHORD_X : centre) - HEAD / 2 - 3;
    for (let column = 0; column < note.accidentalColumn; column++) {
      right -= (columnWidths[column] ?? 0) + 4;
    }
    glyphs.push({ glyph, x: right - glyph.width * SCALE, y });
  });

  return {
    viewBox: `0 0 ${WIDTH} ${bottom + 14}`,
    lines: lines.join(''),
    glyphs: glyphs.map(({ glyph, x, y }) => ({
      path: glyph.path,
      transform: `translate(${round(x)} ${round(y)}) scale(${SCALE})`,
    })),
  };
});

const label = computed(() => {
  const { keySignature, notes } = props.staff;
  const count = keySignature.length;
  const kind = keySignature[0]?.accidental === 1 ? 'sharp' : 'flat';
  const signature = count
    ? ` with ${count} ${kind}${count > 1 ? 's' : ''}`
    : '';
  const names = notes.map((note) => formatNoteName(note.name));
  const bass = [
    ...new Set(
      notes
        .filter((note) => note.clef === 'bass')
        .map((note) => formatNoteName(note.name)),
    ),
  ];
  const onBass = bass.length
    ? `, ${bass.length > 1 ? `${bass.slice(0, -1).join(', ')} and ${bass.at(-1)}` : bass[0]} on the bass staff`
    : '';
  return `Grand staff${signature} showing ${props.title}: ${names.join(' ')}${onBass}`;
});
</script>

<template>
  <div class="paper">
    <svg
      class="staff"
      role="img"
      :aria-label="label"
      :viewBox="drawing.viewBox"
    >
      <path class="lines" :d="drawing.lines" />
      <path
        v-for="(glyph, index) in drawing.glyphs"
        :key="index"
        class="glyph"
        :d="glyph.path"
        :transform="glyph.transform"
      />
    </svg>
  </div>
</template>

<style scoped>
.paper {
  padding: 6px 8px;
  border-radius: 10px;
  background: var(--key-white);
}

.staff {
  display: block;
  width: 100%;
  max-width: 480px;
  height: auto;
  margin: 0 auto;
}

.lines {
  fill: none;
  stroke: var(--key-white-ink);
  stroke-width: 1;
}

.glyph {
  fill: var(--key-black);
}
</style>
