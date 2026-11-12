import { onMounted, ref } from 'vue';

import repositoryLicense from '../../../../LICENSE?raw';
import bravuraLicense from '../notation/OFL.txt?raw';

export interface License {
  name: string;
  /** Short name of the license, such as MIT or CC BY 3.0. */
  license: string;
  /** A line under the name: the version, and who made it. */
  about: string;
  text: string;
}

/** One package as Vite's `build.license` lists it in `licenses.json`. */
interface BundledPackage {
  name: string;
  version: string;
  identifier: string;
  text: string;
}

/**
 * The licenses of what is not an npm package, so Vite cannot list it: the app
 * itself, the piano recordings and the music font the staff is drawn with.
 */
export const OWN_LICENSES: readonly License[] = [
  {
    name: 'Piano',
    license: 'MIT',
    about: `Version ${__APP_VERSION__} · Espen Strømland`,
    // The rest of the file says that the recordings are not under it.
    text: repositoryLicense.split('\n---\n')[0]?.trim() ?? '',
  },
  {
    name: 'Salamander Grand Piano',
    license: 'CC BY 3.0',
    about: 'Alexander Holm · shortened to four seconds and mixed down to mono',
    text: [
      'Salamander Grand Piano by Alexander Holm, licensed under the Creative Commons Attribution 3.0 Unported license: https://creativecommons.org/licenses/by/3.0/',
      'The recordings used here have been shortened to four seconds with a fade-out and mixed down to mono.',
    ].join('\n\n'),
  },
  {
    name: 'Bravura',
    license: 'OFL-1.1',
    about:
      'Steinberg Media Technologies · the clefs, notes and accidentals of the staff',
    text: bravuraLicense.trim(),
  },
];

/**
 * Everything that comes with the app, each with its license: the app's own,
 * then every package that is bundled into it. The packages are only known in
 * a build of the app; `complete` is false while they are missing.
 */
export function useLicenses() {
  const licenses = ref<readonly License[]>(OWN_LICENSES);
  const complete = ref<boolean>();

  onMounted(async () => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}licenses.json`);
      const bundled = (await response.json()) as BundledPackage[];
      licenses.value = [
        ...OWN_LICENSES,
        ...bundled.map((item) => ({
          name: item.name,
          license: item.identifier,
          about: `Version ${item.version}`,
          text: item.text.trim(),
        })),
      ];
      complete.value = true;
    } catch {
      // The development server has no licenses.json, and answers with the app.
      complete.value = false;
    }
  });

  return { licenses, complete };
}
