import { watch } from 'vue';

import {
  CHORD_TYPE_IDS,
  INVERSIONS,
  SCALE_TYPES,
  type Selection,
  TONALITIES,
  VIEWS,
  getChordRootNames,
  getKeyChords,
  getRootNames,
  toPitchClass,
} from '@stromland/piano-lib';

const LETTER_PITCH_CLASSES: Record<string, number> = {
  c: 0,
  d: 2,
  e: 4,
  f: 5,
  g: 7,
  a: 9,
  b: 11,
};

const SIZES = { triads: 'triad', sevenths: 'seventh' } as const;

/** `'harmonicMinor'` → `'harmonic-minor'`. */
const kebab = (id: string) =>
  id.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** `'Eb'` → `'e-flat'`, `'F#'` → `'f-sharp'`. */
const noteSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/#/g, '-sharp')
    .replace(/(?<=.)b/g, '-flat');

/** `'e-flat'` → 3, or `undefined` for anything that is not a note. */
function parseNote(slug: string): number | undefined {
  const match = /^([a-g])((?:-sharp|-flat)*)$/.exec(slug.toLowerCase());
  if (!match) return undefined;
  const [, letter = '', accidentals = ''] = match;
  const sharps = accidentals.split('-sharp').length - 1;
  const flats = accidentals.split('-flat').length - 1;
  return toPitchClass((LETTER_PITCH_CLASSES[letter] ?? 0) + sharps - flats);
}

const find = <T extends string>(options: readonly T[], value: string | null) =>
  options.find((option) => kebab(option) === value);

/** The address bar's query for a selection, with only what its view uses. */
export function toQuery(selection: Selection): string {
  const { view, root } = selection;
  const params = new URLSearchParams({ view });
  if (view === 'scale') {
    params.set('root', noteSlug(getRootNames(selection.scale)[root] ?? ''));
    params.set('scale', kebab(selection.scale));
  }
  if (view === 'chord') {
    const name = getChordRootNames(selection.chordType)[root] ?? '';
    params.set('root', noteSlug(name));
    params.set('chord', kebab(selection.chordType));
  }
  if (view === 'key') {
    params.set('root', noteSlug(getRootNames(selection.tonality)[root] ?? ''));
    params.set('key', selection.tonality);
    params.set('chords', `${selection.chordSize}s`);
    const chords = getKeyChords(root, selection.tonality, selection.chordSize);
    const chord = chords[Math.min(selection.keyChord, chords.length - 1)];
    params.set('chord', chord?.numeral ?? '');
  }
  if (view !== 'scale') params.set('inversion', selection.inversion);
  return `?${params}`;
}

/** Applies what a query says to `selection`, ignoring anything it does not know. */
export function applyQuery(selection: Selection, query: string) {
  const params = new URLSearchParams(query);
  const view = find(VIEWS, params.get('view'));
  if (!view) return;
  selection.view = view;

  const root = parseNote(params.get('root') ?? '');
  if (root !== undefined) selection.root = root;

  const scale = find(SCALE_TYPES, params.get('scale'));
  if (scale) selection.scale = scale;

  const tonality = find(TONALITIES, params.get('key'));
  if (tonality) selection.tonality = tonality;

  const size = SIZES[params.get('chords') as keyof typeof SIZES];
  if (size) selection.chordSize = size;

  const inversion = find(INVERSIONS, params.get('inversion'));
  if (inversion) selection.inversion = inversion;

  const chord = params.get('chord');
  if (view === 'chord') {
    const type = find(CHORD_TYPE_IDS, chord);
    if (type) selection.chordType = type;
  }
  if (view === 'key') {
    const index = getKeyChords(
      selection.root,
      selection.tonality,
      selection.chordSize,
    ).findIndex((keyChord) => keyChord.numeral === chord);
    if (index >= 0) selection.keyChord = index;
  }
}

/**
 * Keeps the selection in the address bar, so a page can be bookmarked,
 * shared or reloaded, and starts from the one it was opened with.
 */
export function useSelectionUrl(selection: Selection) {
  applyQuery(selection, window.location.search);
  watch(
    () => toQuery(selection),
    (selectionQuery) => {
      // The page that is open is in the address too, and kept as it is.
      const page = new URLSearchParams(window.location.search).get('page');
      const query = page ? `${selectionQuery}&page=${page}` : selectionQuery;
      if (query === window.location.search) return;
      window.history.replaceState(window.history.state, '', query);
    },
    { immediate: true },
  );
}
