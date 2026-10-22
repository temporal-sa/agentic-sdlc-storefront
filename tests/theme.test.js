import test from 'node:test';
import assert from 'node:assert';
import { THEME_STORAGE_KEY, resolveTheme, nextTheme, readStoredTheme, saveTheme } from '../src/theme.js';

test('follows system setting when nothing saved', () => {
  assert.strictEqual(resolveTheme(null, true), 'dark');
  assert.strictEqual(resolveTheme(null, false), 'light');
  assert.strictEqual(resolveTheme(undefined, true), 'dark');
});

test('saved value overrides system', () => {
  assert.strictEqual(resolveTheme('light', true), 'light');
  assert.strictEqual(resolveTheme('dark', false), 'dark');
});

test('invalid saved values fall back to system', () => {
  assert.strictEqual(resolveTheme('blue', true), 'dark');
  assert.strictEqual(resolveTheme('', false), 'light');
  assert.strictEqual(resolveTheme('DARK', false), 'light');
});

test('nextTheme toggles', () => {
  assert.strictEqual(nextTheme('light'), 'dark');
  assert.strictEqual(nextTheme('dark'), 'light');
});

test('read/save with fake storage', () => {
  const data = {};
  const storage = {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = v; },
  };
  assert.strictEqual(readStoredTheme(storage), null);
  saveTheme(storage, 'dark');
  assert.strictEqual(data[THEME_STORAGE_KEY], 'dark');
  assert.strictEqual(readStoredTheme(storage), 'dark');
});

test('throwing or missing storage is tolerated', () => {
  const bad = {
    getItem() { throw new Error('no'); },
    setItem() { throw new Error('no'); },
  };
  assert.strictEqual(readStoredTheme(bad), null);
  assert.doesNotThrow(() => saveTheme(bad, 'dark'));
  assert.strictEqual(readStoredTheme(undefined), null);
  assert.doesNotThrow(() => saveTheme(undefined, 'dark'));
});
