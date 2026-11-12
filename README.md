![Logo](https://raw.githubusercontent.com/stromland/piano/main/images/piano-logo.png)

<h2 align="center">View scales and chords</h2>
<p align="center">
  <a href="https://github.com/stromland/piano/actions/workflows/deploy-github-pages.yml">
    <img alt="Github actions" src="https://github.com/stromland/piano/actions/workflows/deploy-github-pages.yml/badge.svg">
  </a>
  <a href="https://github.com/stromland/piano/actions/workflows/build-workspaces.yml">
    <img alt="Github actions" src="https://github.com/stromland/piano/actions/workflows/build-workspaces.yml/badge.svg">
  </a>
</p>

<h1 align="center">
  <a href="https://stromland.github.io/piano/">
    Demo
  </a>
</h1>

A reference for the keys of a scale or a chord, and for the chords that belong
together in a key. Pick a root note, then:

- **Scale** shows one of eleven scales: major and minor, the modes and the
  pentatonic scales.
- **Chord** shows any triad, sus chord or seventh chord, in every inversion.
- **Key** shows the chords of a major or minor key with roman numerals and
  their function, including the V and vii° minor keys borrow from harmonic
  minor.

**Explain** tells you what you are looking at, how it is built and where it is
used, and lets you hear it on a recorded grand piano, moved an octave down or
up if you like. Notes are spelled the way the key calls for: E♭
major has flats, E major has sharps. The address bar keeps the selection, so a
page can be bookmarked or shared.

The app can be installed to the home screen or desktop, and works offline once
it has been opened.

**Settings**, behind the gear, shows the version the app was built from, links
to the source code and lists the license of everything that comes with the
app. The version comes from the git tags (`git describe --tags`), and the
licenses of the bundled packages from Vite's `build.license`, so both are only
complete in a build.

The words the app uses are defined in [GLOSSARY.md](GLOSSARY.md).

The piano sound is the
[Salamander Grand Piano](packages/piano-vue/public/samples/README.md) by
Alexander Holm. The recordings are licensed under
[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), not under the MIT
license of the rest of the repository.

## Packages

| Package                           | What it is                                                                        |
| --------------------------------- | --------------------------------------------------------------------------------- |
| [`piano-lib`](packages/piano-lib) | The music theory – scales, chords, keys and keyboard layout – as plain functions. |
| [`piano-vue`](packages/piano-vue) | The web app, built with Vue and Vite.                                             |

## Development

Requires Node.js 22.13 or newer.

```sh
npm install
npm run dev
```

The app uses the source of `piano-lib` directly, so changes to the library
show up right away and nothing has to be built first.

| Command             | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Starts the app at http://localhost:5173/piano/       |
| `npm test`          | Runs the tests of both packages                      |
| `npm run lint`      | Lints everything with ESLint                         |
| `npm run format`    | Formats everything with Prettier                     |
| `npm run typecheck` | Type-checks both packages                            |
| `npm run build`     | Builds the library and the app                       |
| `npm run preview`   | Serves the built app at http://localhost:5050/piano/ |
| `npm run check`     | Everything CI runs                                   |

## Releasing

```sh
scripts/release.sh minor
git push && git push origin v0.8.0
```

The script bumps the version of every package, commits and tags. Pushing the
tag deploys the app to GitHub Pages.
