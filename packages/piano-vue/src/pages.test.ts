import { type VueWrapper, flushPromises, mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import App from './App.vue';
import { readPage } from './composables/usePage';

const BUNDLED = [
  {
    name: '@vue/shared',
    version: '3.5.45',
    identifier: 'MIT',
    text: 'The MIT License (MIT)\n\nCopyright (c) 2018-present, Yuxi (Evan) You\n',
  },
];

let app: VueWrapper | undefined;

const page = () => new URLSearchParams(window.location.search).get('page');
/** The app mounted by `open`. */
const mounted = () => {
  if (!app) throw new Error('Open the app first');
  return app;
};
const heading = () => mounted().get('h1').text();
const button = (name: string) => {
  const match = mounted()
    .findAll('button')
    .find((it) => (it.attributes('aria-label') ?? it.text()) === name);
  if (!match) throw new Error(`No button called "${name}"`);
  return match;
};
/** Waits for the browser to step back in the history. */
async function popState() {
  await new Promise((resolve) =>
    window.addEventListener('popstate', resolve, { once: true }),
  );
  await flushPromises();
}

function open(query: string) {
  window.history.replaceState(null, '', `/${query}`);
  app = mount(App, { attachTo: document.body });
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({ json: async () => BUNDLED })),
  );
});

afterEach(() => {
  app?.unmount();
  app = undefined;
  vi.unstubAllGlobals();
});

describe('readPage', () => {
  it('reads the page from the address, and takes anything else as the main page', () => {
    expect(readPage('?view=scale&page=settings')).toBe('settings');
    expect(readPage('?page=licenses')).toBe('licenses');
    expect(readPage('?page=nowhere')).toBe('main');
    expect(readPage('')).toBe('main');
  });
});

describe('Settings', () => {
  it('opens from the gear, and keeps the selection in the address', async () => {
    open('?view=chord&root=d&chord=minor&inversion=root');
    await button('Settings').trigger('click');

    expect(heading()).toBe('Settings');
    expect(page()).toBe('settings');
    expect(window.location.search).toContain('root=d');
    expect(mounted().find('.keyboard').exists()).toBe(false);
  });

  it('shows the version the app was built from and links to its source', async () => {
    open('?page=settings');

    expect(mounted().text()).toContain(`Version${__APP_VERSION__}`);
    const source = mounted().get(
      'a[href="https://github.com/stromland/piano"]',
    );
    expect(source.text()).toBe('Source code on GitHub');
    expect(source.attributes('target')).toBe('_blank');
  });

  it('goes back to the selection it was opened from', async () => {
    open('?view=chord&root=d&chord=minor&inversion=root');
    await button('Settings').trigger('click');

    const back = popState();
    await button('Back').trigger('click');
    await back;

    expect(page()).toBeNull();
    expect(heading()).toBe('Dm');
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Settings');
  });

  it('moves focus to the heading of the page that opens', async () => {
    open('');
    await button('Settings').trigger('click');
    await flushPromises();

    expect(document.activeElement?.textContent?.trim()).toBe('Settings');
  });
});

describe('Licenses', () => {
  it('opens from Settings and goes back to it', async () => {
    open('?page=settings');
    await button('Licenses').trigger('click');
    expect(heading()).toBe('Licenses');
    expect(page()).toBe('licenses');

    const back = popState();
    await button('Back to Settings').trigger('click');
    await back;
    expect(heading()).toBe('Settings');
  });

  it('goes back up through Settings when the page was opened by a link', async () => {
    open('?view=chord&root=d&chord=minor&inversion=root&page=licenses');

    await button('Back to Settings').trigger('click');
    expect(heading()).toBe('Settings');
    expect(page()).toBe('settings');

    await button('Back').trigger('click');
    expect(heading()).toBe('Dm');
    expect(page()).toBeNull();
  });

  it('lists the app, the piano recordings, the music font and every bundled package', async () => {
    open('?page=licenses');
    await flushPromises();

    expect(
      mounted()
        .findAll('.license .name')
        .map((it) => it.text()),
    ).toEqual(['Piano', 'Salamander Grand Piano', 'Bravura', '@vue/shared']);
    expect(
      mounted()
        .findAll('.license .id')
        .map((it) => it.text()),
    ).toEqual(['MIT', 'CC BY 3.0', 'OFL-1.1', 'MIT']);
    const [piano, , bravura, vue] = mounted().findAll('.license');
    expect(piano?.get('.text').text()).toMatch(/^MIT License\n\nCopyright/);
    // The rest of the repository's LICENSE is about the recordings.
    expect(piano?.get('.text').text()).not.toContain('Salamander');
    expect(bravura?.get('.text').text()).toContain('SIL Open Font License');
    expect(vue?.get('.about').text()).toBe('Version 3.5.45');
    expect(vue?.get('.text').text()).toContain('Yuxi (Evan) You');
    expect(mounted().text()).not.toContain('in a build of the app');
  });

  it('says where the packages are when the list is not built', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        json: async () => {
          throw new SyntaxError('Unexpected token <');
        },
      })),
    );
    open('?page=licenses');
    await flushPromises();

    expect(mounted().findAll('.license')).toHaveLength(3);
    expect(mounted().text()).toContain('in a build of the app');
  });
});
