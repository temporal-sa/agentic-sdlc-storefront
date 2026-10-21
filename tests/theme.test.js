import test from 'node:test';
import assert from 'node:assert';
import {
  THEME_STORAGE_KEY,
  resolveInitialTheme,
  nextTheme,
  readStoredTheme,
  saveTheme,
} from '../src/theme.js';

const throwing = {
  getItem() { throw new Error('denied'); },
  setItem() { throw new Error('denied'); },
};

function fakeStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = v; },
  };
}

test('storage key', () => {
  assert.equal(THEME_STORAGE_KEY, 'theme');
});

test('valid stored values win', () => {
  assert.equal(resolveInitialTheme('light', true), 'light');
  assert.equal(resolveInitialTheme('dark', false), 'dark');
});

test('invalid or null stored values fall back to system preference', () => {
  for (const v of [null, undefined, '', 'blue']) {
    assert.equal(resolveInitialTheme(v, true), 'dark');
    assert.equal(resolveInitialTheme(v, false), 'light');
  }
});

test('nextTheme flips', () => {
  assert.equal(nextTheme('light'), 'dark');
  assert.equal(nextTheme('dark'), 'light');
  assert.equal(nextTheme('junk'), 'light');
});

test('readStoredTheme', () => {
  assert.equal(readStoredTheme(fakeStorage({ theme: 'dark' })), 'dark');
  assert.equal(readStoredTheme(fakeStorage()), null);
  assert.equal(readStoredTheme(null), null);
  assert.equal(readStoredTheme(undefined), null);
  assert.equal(readStoredTheme(throwing), null);
});

test('saveTheme', () => {
  const s = fakeStorage();
  saveTheme(s, 'dark');
  assert.equal(s.data.theme, 'dark');
  assert.doesNotThrow(() => saveTheme(throwing, 'dark'));
  assert.doesNotThrow(() => saveTheme(null, 'dark'));
});
