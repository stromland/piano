import { type VueWrapper, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';

import App from './App.vue';

describe('App', () => {
  let app: VueWrapper;

  const chordType = (name: string) => {
    const match = app
      .findAll('button')
      .find((it) => it.attributes('aria-label')?.endsWith(`, ${name}`));
    if (!match) throw new Error(`No chord type called "${name}"`);
    return match;
  };
  const root = (name: string) => {
    const match = app.findAll('.notes button').find((it) => it.text() === name);
    if (!match) throw new Error(`No root called "${name}"`);
    return match;
  };
  const buttons = (role: string) =>
    app.findAll(`.button.${role}`).map((it) => it.text());
  const pressedKeys = () =>
    app.findAll('.key.pressed > span').map((it) => it.text());

  beforeEach(() => {
    app = mount(App);
  });

  it('starts on G7, with the G bass, the G7 button and D to alternate', () => {
    expect(app.get('h1').text()).toBe('G7');
    expect(app.text()).toContain('G bass + G7 button');
    expect(buttons('bass')).toEqual(['G 1']);
    expect(buttons('chord')).toEqual(['G7 2·4']);
    expect(buttons('alternate')).toEqual(['D 3']);
    expect(pressedKeys()).toEqual(['G', 'B', 'D', 'F']);
  });

  it('shows a combined chord', async () => {
    await root('C').trigger('click');
    await chordType('Major 7th').trigger('click');
    expect(app.get('h1').text()).toBe('Cmaj7');
    expect(app.text()).toContain('C bass + Em button');
    expect(pressedKeys()).toEqual(['C', 'E', 'G', 'B']);
  });

  it('groups the chord types by how the left hand plays them', () => {
    const group = (title: string) =>
      app
        .get(`[aria-label="${title}"]`)
        .findAll('.label')
        .map((it) => it.text());
    expect(group('One button')).toEqual([
      'Major',
      'Minor',
      'Dominant 7th',
      'Diminished 7th',
    ]);
    expect(group('Combined')).toEqual(
      expect.arrayContaining(['Major 7th', 'Minor 7th', 'Diminished']),
    );
    expect(group('Right hand only')).toEqual(
      expect.arrayContaining(['Augmented', 'Sus2', 'Sus4']),
    );
  });

  it('leaves a chord without a button to the right hand', async () => {
    await chordType('Sus4').trigger('click');
    expect(app.text()).toContain('No button: play it with the right hand');
    expect(buttons('bass')).toEqual([]);
    expect(app.text()).not.toContain('Alternating bass');
  });
});
