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
  const chordType = (name: string) => {
    const match = app
      .findAll('button')
      .find((it) => it.attributes('aria-label')?.endsWith(`, ${name}`));
    if (!match) throw new Error(`No chord type called "${name}"`);
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
    expect(app.findAll('.note .degree').map((it) => it.text())).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
    ]);
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

  it('offers the scales in groups', async () => {
    const groups = app
      .findAll('[role="group"][aria-label]')
      .map((it) => it.attributes('aria-label'));
    expect(groups).toEqual(
      expect.arrayContaining(['Major and minor', 'Modes', 'Pentatonic']),
    );

    await button('D').trigger('click');
    await button('Dorian').trigger('click');
    expect(title()).toBe('D Dorian');
    expect(pressedKeys()).toEqual(['D', 'E', 'F', 'G', 'A', 'B', 'C', 'D']);
  });

  it('keeps the chord controls out of the way in the scale view', async () => {
    expect(app.text()).not.toContain('Root position');

    await button('Chord').trigger('click');
    expect(app.text()).toContain('Root position');
  });

  it('shows the chord of the selected type on the root note', async () => {
    await button('Chord').trigger('click');
    expect(title()).toBe('C');
    expect(pressedKeys()).toEqual(['C', 'E', 'G']);

    await button('D').trigger('click');
    await chordType('Minor 7th').trigger('click');
    await button('1st').trigger('click');
    expect(title()).toBe('Dm7');
    expect(pressedKeys()).toEqual(['F', 'A', 'C', 'D']);
    expect(labels('.key.root')).toEqual(['D']);
  });

  it('spells the root the way the chord type calls for', async () => {
    await button('Chord').trigger('click');
    expect(button('D♭').exists()).toBe(true);

    await chordType('Minor').trigger('click');
    await button('C♯').trigger('click');
    expect(title()).toBe('C♯m');
  });

  it('keeps the root note when the view changes', async () => {
    await button('A').trigger('click');
    await button('Chord').trigger('click');
    expect(title()).toBe('A');

    await button('Scale').trigger('click');
    expect(title()).toBe('A major');
  });

  it('offers a third inversion only for seventh chords', async () => {
    await button('Chord').trigger('click');
    await chordType('Dominant 7th').trigger('click');
    await button('3rd').trigger('click');
    expect(pressedKeys()).toEqual(['B♭', 'C', 'E', 'G']);

    await chordType('Major').trigger('click');
    expect(app.text()).not.toContain('3rd');
    expect(pressedKeys()).toEqual(['G', 'C', 'E']);
  });

  it('describes the keyboard for screen readers', async () => {
    await button('Chord').trigger('click');
    expect(app.get('[role="img"]').attributes('aria-label')).toBe(
      'Piano keyboard showing C, Root position: C E G',
    );
  });
});
