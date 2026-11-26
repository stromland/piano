# Share the music theory between the apps

The accordion app is a new package, `accordion-vue`, next to `piano-vue` in
the same repository, and both get their music theory from one library.
`piano-lib` is renamed `music-theory`: notes, scales, chords, keys, spelling,
the staff and the piano keyboard stay in it, because the treble of a piano
accordion is a piano keyboard. `board.ts`, which builds the piano app's views,
moves into `piano-vue`, and the accordion app gets its own. A scale, a chord or
a key is then the same thing in both apps, spelled the same way, and a fix to
the theory reaches both.

## Considered options

- **An instrument switch inside the piano app.** One app to deploy, but every
  view, the URL and the Explain panel would have to know about two instruments.
- **A separate repository.** Keeps the apps apart, but the theory would be
  copied or published and versioned between them.

## Consequences

The library is not published to npm, so the rename only touches this
repository: the workspaces, the path aliases, the README and the CI step that
imports it.
