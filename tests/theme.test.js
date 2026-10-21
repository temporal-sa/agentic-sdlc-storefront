import { test } from "node:test";
import assert from "node:assert/strict";
import { THEME_STORAGE_KEY, resolveTheme, nextTheme, readStoredTheme, saveTheme } from "../src/theme.js";

const throwing = {
  getItem() { throw new Error("denied"); },
  setItem() { throw new Error("denied"); },
};

test("stored value wins over preference", () => {
  assert.equal(resolveTheme("light", true), "light");
  assert.equal(resolveTheme("dark", false), "dark");
});

test("preference used when nothing stored", () => {
  assert.equal(resolveTheme(null, true), "dark");
  assert.equal(resolveTheme(null, false), "light");
});

test("invalid stored values are ignored", () => {
  assert.equal(resolveTheme("blue", true), "dark");
  assert.equal(resolveTheme("", false), "light");
  assert.equal(resolveTheme(undefined, false), "light");
});

test("nextTheme toggles", () => {
  assert.equal(nextTheme("dark"), "light");
  assert.equal(nextTheme("light"), "dark");
  assert.equal(nextTheme("junk"), "dark");
});

test("readStoredTheme and saveTheme use the storage key", () => {
  const data = {};
  const fake = {
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => { data[k] = v; },
  };
  saveTheme(fake, "dark");
  assert.equal(data[THEME_STORAGE_KEY], "dark");
  assert.equal(readStoredTheme(fake), "dark");
});

test("null and throwing storage are handled", () => {
  assert.equal(readStoredTheme(null), null);
  assert.equal(readStoredTheme(undefined), null);
  assert.equal(readStoredTheme(throwing), null);
  assert.doesNotThrow(() => saveTheme(null, "dark"));
  assert.doesNotThrow(() => saveTheme(throwing, "dark"));
});
