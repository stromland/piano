# Progression mode

A third mode next to Scale and Chord. The player enters a sequence of chords;
the app picks the voicing of each one so the left hand moves as little as
possible from chord to chord, then lets them step through the result on the
keyboard.

## Chords

- Any root, independent of a scale. The twelve roots have fixed names:
  C, Db, D, Eb, E, F, F#, G, Ab, A, Bb, B. The notes inside a chord are spelled
  from its root: Ab → Ab C Eb.
- Qualities: the existing triads (major, minor, dim, aug) plus the seventh
  chords 7, maj7, m7, m7b5 and dim7.
- Close voicings only, every note present: a triad has three inversions, a
  seventh chord four. No notes dropped or spread out.

## Voicing

- Left hand alone, no separate bass note.
- Every note of every voicing lies within key indexes 12–31 of the 49-key
  keyboard (the C starting the second octave up to the G in the third).
- **Movement** between two voicings is the sum of semitones each finger
  travels. Every note of the larger chord is paired with one note of the
  smaller, every note of the smaller gets at least one partner, and the
  pairing with the least travel wins. With equal note counts each finger moves
  to one key; when the count changes (triad ↔ seventh chord) one note splits
  into two or two merge into one. Common tones cost 0.
- The voicings of the whole sequence are chosen together, the first chord
  included, to minimise the total movement. The sequence is open: the move
  from the last chord back to the first does not count.
- Ties go to the solution whose voicings sit closest to the middle of the
  range (summed over the chords, by each voicing's average key).

The code is `packages/piano-lib/src/progression.ts`; `getBoard` voices the
progression and presses the selected step.

## Interface

- Root note and scale controls are hidden in this mode.
- Chords are added with chips: pick a root, then a quality (named after the
  root: G, Gm … Gdim7), press Add. The new chord becomes the selected step.
- Each step is a row with its number, name, inversion and the semitones from
  the previous chord, and a × to remove it.
- The added chords are the steps. Tapping one shows its voicing on the
  keyboard; previous/next buttons step through them. Each step shows its
  inversion and the semitones moved from the previous chord; the total is
  shown at the top.

## Out of scope for now

Looping progressions, text input, reordering by dragging, saving or sharing
the progression, seventh chords in Chord mode, and showing the previous chord
on the keyboard.
