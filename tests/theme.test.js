import test from 'node:test';
import assert from 'node:assert/strict';
import { THEME_KEY, resolveTheme, toggleTheme, loadTheme, saveTheme } from '../src/theme.js';

function fakeStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, v),
  };
}
const throwing = {
  getItem() { throw new Error('denied'); },
  setItem() { throw new Error('denied'); },
};

test('key', () => assert.equal(THEME_KEY, 'orbit-theme'));

test('stored value overrides system', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
});

test('null or invalid falls back to prefersDark', () => {
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme(null, false), 'light');
  assert.equal(resolveTheme('blue', true), 'dark');
  assert.equal(resolveTheme('', false), 'light');
  assert.equal(resolveTheme(undefined, true), 'dark');
});

test('toggleTheme flips', () => {
  assert.equal(toggleTheme('light'), 'dark');
  assert.equal(toggleTheme('dark'), 'light');
});

test('load/save with fake storage', () => {
  const s = fakeStorage();
  assert.equal(loadTheme(s), null);
  saveTheme(s, 'dark');
  assert.equal(loadTheme(s), 'dark');
  assert.equal(s.getItem(THEME_KEY), 'dark');
});

test('null storage', () => {
  assert.equal(loadTheme(null), null);
  assert.doesNotThrow(() => saveTheme(null, 'dark'));
});

test('throwing storage', () => {
  assert.equal(loadTheme(throwing), null);
  assert.doesNotThrow(() => saveTheme(throwing, 'dark'));
});
