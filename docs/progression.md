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
  travels. Notes are paired so that every note of both chords has a partner
  and the total is smallest; when the note count changes (triad ↔ seventh
  chord) one note splits into two or two merge into one. Common tones cost 0.
- The voicings of the whole sequence are chosen together, the first chord
  included, to minimise the total movement. The sequence is open: the move
  from the last chord back to the first does not count.
- Ties go to the solution closest to the middle of the range.

## Interface

- Root note and scale controls are hidden in this mode.
- Chords are added with chips: pick a root and a quality, press Add. Each
  added chord is a chip with × to remove it.
- The added chords are the steps. Tapping one shows its voicing on the
  keyboard; previous/next buttons step through them. Each step shows its
  inversion and the semitones moved from the previous chord; the total is
  shown at the top.

## Out of scope for now

Looping progressions, text input, reordering by dragging, saving or sharing
the progression, seventh chords in Chord mode, and showing the previous chord
on the keyboard.
