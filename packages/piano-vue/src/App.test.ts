import { type VueWrapper, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

import App from './App.vue';

describe('App', () => {
  let app: VueWrapper;

  const button = (name: string) => {
    const match = app.findAll('button').find((it) => it.text() === name);
    if (!match) throw new Error(`No button called "${name}"`);
    return match;
  };
  const title = () => app.get('h1').text();
  // A white key contains the black key next to it, so read only its own label.
  const labels = (keys: string) =>
    app.findAll(`${keys} > span`).map((it) => it.text());
  const pressedKeys = () => labels('.key.pressed');
  const pressedButtons = () =>
    app.findAll('button[aria-pressed="true"]').map((it) => it.text());

  beforeEach(() => {
    app = mount(App);
  });

  it('starts by showing the C major scale', () => {
    expect(title()).toBe('C major');
    expect(pressedKeys()).toEqual(['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']);
    expect(pressedButtons()).toEqual(['Scale', 'C', 'Major']);
  });

  it('highlights the root of the scale', () => {
    expect(labels('.key.root')).toEqual(['C', 'C']);
  });

  it('spells the notes to suit the selected scale', async () => {
    await button('E♭').trigger('click');
    expect(title()).toBe('E♭ major');
    expect(pressedKeys()).toEqual(['E♭', 'F', 'G', 'A♭', 'B♭', 'C', 'D', 'E♭']);

    await button('Minor').trigger('click');
    expect(app.findAll('button').map((it) => it.text())).toContain('C♯');
  });

  it('keeps the chord controls out of the way in the scale view', async () => {
    expect(app.text()).not.toContain('Root position');

    await button('Chord').trigger('click');
    expect(app.text()).toContain('Root position');
  });

  it('shows the selected chord and its inversion', async () => {
    await button('Chord').trigger('click');
    expect(title()).toBe('C');
    expect(pressedKeys()).toEqual(['C', 'E', 'G']);

    await button('Dm').trigger('click');
    await button('1st inversion').trigger('click');
    expect(title()).toBe('Dm');
    expect(pressedKeys()).toEqual(['F', 'A', 'D']);
    expect(labels('.key.root')).toEqual(['D']);
  });

  it('goes back to the first chord when the scale changes', async () => {
    await button('Chord').trigger('click');
    await button('Am').trigger('click');
    expect(title()).toBe('Am');

    // 'A' is the root note button, so this moves to A major.
    await button('A').trigger('click');
    expect(title()).toBe('A');

    await button('Bm').trigger('click');
    await button('Minor').trigger('click');
    expect(title()).toBe('Am');
  });

  it('describes the keyboard for screen readers', async () => {
    await button('Chord').trigger('click');
    expect(app.get('[role="img"]').attributes('aria-label')).toBe(
      'Piano keyboard showing C, Root position: C E G',
    );
  });
});
