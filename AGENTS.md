# Agents

A piano app that shows scales and chords on a keyboard. The music theory lives
in `packages/piano-lib`; the Vue app in `packages/piano-vue` only draws it.

## Conventions

- **Theory in the library.** Anything about notes, chords or voicings is a
  plain, tested function in `piano-lib`, exported from `src/index.ts`. Vue
  components and `usePiano` only hold state and call the library; `getBoard`
  is the one call that turns a selection into what is drawn.
- **Key indexes.** A key is an integer: 0 is the leftmost C of the keyboard,
  and the pitch class is `index mod 12` (0 = C … 11 = B). The keyboard has 49
  keys, C to C.
- **Spelling.** Note and chord names are ASCII (`'Eb'`, `'F#m'`) in the
  library and only become ♭/♯ through `formatNoteName` when displayed. Notes
  are spelled by letter, so a key gets the name its scale calls for.
- **Tests sit next to the code** (`chords.ts` → `chords.test.ts`) and the
  library keeps the coverage thresholds in `vitest.config.ts`.
- `npm run check` is what CI runs; it has to pass before pushing.

## Designs

- `docs/progression.md`: Progression mode, which voices a chord sequence for
  the least left-hand movement. Read it before touching chords, voicings or
  the mode switch.
