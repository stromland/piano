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

  it('keeps the chord controls out of the way in scale mode', async () => {
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

  describe('in progression mode', () => {
    const add = async (root: string, chord: string) => {
      await button(root).trigger('click');
      // The chord types are named after the root, so 'F' is a type as well.
      await app
        .findAll('.qualities button')
        .find((it) => it.text() === chord)
        ?.trigger('click');
      await button(`Add ${chord}`).trigger('click');
    };
    const steps = () =>
      app.findAll('.steps .pick').map((it) =>
        it
          .findAll('span')
          .map((part) => part.text())
          .join(' '),
      );

    beforeEach(async () => {
      await button('Progression').trigger('click');
    });

    it('swaps the root and scale controls for the progression', () => {
      expect(app.text()).not.toContain('Root note');
      expect(app.text()).toContain('Add chord');
      expect(title()).toBe('No chords yet');
      expect(pressedKeys()).toEqual([]);
    });

    it('voices the chords for the least movement', async () => {
      await add('A', 'Am');
      await add('F', 'F');
      await add('C', 'C');
      await add('G', 'G7');

      expect(steps()).toEqual([
        '1 Am 2nd inversion Start',
        '2 F Root position +1',
        '3 C 1st inversion +3',
        '4 G7 3rd inversion +4',
      ]);
      expect(title()).toBe('G7');
      expect(pressedKeys()).toEqual(['F', 'G', 'B', 'D']);
      expect(labels('.key.root')).toEqual(['G']);
      expect(app.text()).toContain('Step 4 of 4 · 8 semitones in total');
      expect(app.text()).toContain('3rd inversion · +4 semitones from C');
    });

    it('steps through the progression', async () => {
      await add('A', 'Am');
      await add('F', 'F');

      await button('Previous').trigger('click');
      expect(title()).toBe('Am');
      expect(pressedKeys()).toEqual(['E', 'A', 'C']);

      await button('Next').trigger('click');
      expect(title()).toBe('F');

      await app.findAll('.steps .pick')[0]?.trigger('click');
      expect(title()).toBe('Am');
    });

    it('spells flat roots and seventh chords', async () => {
      await add('A♭', 'A♭m7♭5');
      expect(title()).toBe('A♭m7♭5');
    });

    it('removes a chord and keeps showing the same one', async () => {
      await add('A', 'Am');
      await add('F', 'F');
      await add('C', 'C');

      await app.get('[aria-label="Remove Am"]').trigger('click');
      expect(steps().map((it) => it.split(' ')[1])).toEqual(['F', 'C']);
      expect(title()).toBe('C');

      await app.get('[aria-label="Remove C"]').trigger('click');
      expect(title()).toBe('F');

      await app.get('[aria-label="Remove F"]').trigger('click');
      expect(title()).toBe('No chords yet');
    });
  });
});
