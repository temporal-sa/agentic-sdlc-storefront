import test from "node:test";
import assert from "node:assert/strict";
import {
  THEME_STORAGE_KEY,
  THEMES,
  isTheme,
  resolveInitialTheme,
  nextTheme,
  readStoredTheme,
  storeTheme,
} from "../src/theme.js";

const fake = (initial = {}) => {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
  };
};
const throwing = {
  getItem() {
    throw new Error("denied");
  },
  setItem() {
    throw new Error("quota");
  },
};

test("constants", () => {
  assert.equal(THEME_STORAGE_KEY, "orbit-theme");
  assert.deepEqual(THEMES, ["light", "dark"]);
});

test("isTheme", () => {
  assert.ok(isTheme("light"));
  assert.ok(isTheme("dark"));
  assert.ok(!isTheme("blue"));
  assert.ok(!isTheme(null));
  assert.ok(!isTheme(undefined));
});

test("saved value beats system preference", () => {
  assert.equal(resolveInitialTheme("light", true), "light");
  assert.equal(resolveInitialTheme("dark", false), "dark");
});

test("invalid or missing value falls back to preference", () => {
  assert.equal(resolveInitialTheme(null, true), "dark");
  assert.equal(resolveInitialTheme("nope", false), "light");
  assert.equal(resolveInitialTheme(undefined, false), "light");
  assert.equal(resolveInitialTheme("", true), "dark");
});

test("nextTheme toggles", () => {
  assert.equal(nextTheme("dark"), "light");
  assert.equal(nextTheme("light"), "dark");
  assert.equal(nextTheme("garbage"), "dark");
});

test("readStoredTheme", () => {
  assert.equal(readStoredTheme(fake({ [THEME_STORAGE_KEY]: "dark" })), "dark");
  assert.equal(readStoredTheme(fake({ [THEME_STORAGE_KEY]: "x" })), null);
  assert.equal(readStoredTheme(fake()), null);
  assert.equal(readStoredTheme(null), null);
  assert.equal(readStoredTheme(undefined), null);
  assert.equal(readStoredTheme(throwing), null);
});

test("storeTheme", () => {
  const s = fake();
  assert.equal(storeTheme(s, "dark"), true);
  assert.equal(s.data[THEME_STORAGE_KEY], "dark");
  assert.equal(storeTheme(null, "dark"), false);
  assert.equal(storeTheme(undefined, "dark"), false);
  assert.equal(storeTheme(throwing, "dark"), false);
});
