# Draw the staff ourselves

The Explain panel shows the selected notes on a grand staff, and we draw it
with our own SVG instead of a notation library such as VexFlow or abcjs. The
staff only ever holds one scale or one chord, without rhythm, so it needs
little: two clefs, whole noteheads, ledger lines, sharps and flats single and
double, and seconds and accidentals in a chord moved aside so they don't
collide. A library brings a large bundle to an app that is meant to stay small
and work offline, its own look next to the app's, and a text format to
translate the selection into. Where each note goes is music theory, so it
lives in `piano-lib` as plain, tested functions working from the note names
the app already spells; the Vue component only draws what they return.

## Considered options

- **VexFlow.** Engraves well and handles collisions, but is the largest
  dependency the app would have, and is built for scores with rhythm.
- **abcjs.** Smaller, but the selection would have to be written as ABC text
  first, and its look is hard to bring in line with the keyboard.

## Consequences

Should the app one day show rhythm, bars or more than one chord at a time, the
cost of our own engraving grows quickly, and this decision should be looked at
again.
