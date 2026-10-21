import test from "node:test";
import assert from "node:assert/strict";
import {
  THEME_STORAGE_KEY, THEMES, isTheme, resolveInitialTheme,
  nextTheme, readStoredTheme, writeStoredTheme,
} from "../src/theme.js";

const fake = (v) => ({ getItem: (k) => (k === THEME_STORAGE_KEY ? v : null), setItem() {} });
const throwing = { getItem() { throw new Error("x"); }, setItem() { throw new Error("x"); } };

test("constants", () => {
  assert.equal(THEME_STORAGE_KEY, "theme");
  assert.deepEqual(THEMES, ["light", "dark"]);
});

test("isTheme", () => {
  assert.equal(isTheme("light"), true);
  assert.equal(isTheme("dark"), true);
  assert.equal(isTheme("blue"), false);
  assert.equal(isTheme(null), false);
  assert.equal(isTheme(undefined), false);
});

test("resolveInitialTheme", () => {
  assert.equal(resolveInitialTheme("light", true), "light");
  assert.equal(resolveInitialTheme("dark", false), "dark");
  assert.equal(resolveInitialTheme(null, true), "dark");
  assert.equal(resolveInitialTheme("bogus", false), "light");
  assert.equal(resolveInitialTheme(undefined, false), "light");
});

test("nextTheme", () => {
  assert.equal(nextTheme("light"), "dark");
  assert.equal(nextTheme("dark"), "light");
  assert.equal(nextTheme("junk"), "dark");
  assert.equal(nextTheme(undefined), "dark");
});

test("readStoredTheme", () => {
  assert.equal(readStoredTheme(null), null);
  assert.equal(readStoredTheme(undefined), null);
  assert.equal(readStoredTheme(throwing), null);
  assert.equal(readStoredTheme(fake("dark")), "dark");
  assert.equal(readStoredTheme(fake("light")), "light");
  assert.equal(readStoredTheme(fake("nope")), null);
  assert.equal(readStoredTheme(fake(null)), null);
});

test("writeStoredTheme", () => {
  const calls = [];
  const s = { setItem: (k, v) => calls.push([k, v]) };
  assert.equal(writeStoredTheme(s, "dark"), true);
  assert.deepEqual(calls, [["theme", "dark"]]);
  assert.equal(writeStoredTheme(throwing, "dark"), false);
  assert.equal(writeStoredTheme(null, "dark"), false);
});
