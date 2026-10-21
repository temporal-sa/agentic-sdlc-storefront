// Pure theme logic. Covered by tests/theme.test.js and has no DOM access.

export const THEME_STORAGE_KEY = 'theme';

export function resolveInitialTheme(storedValue, prefersDark) {
  if (storedValue === 'light' || storedValue === 'dark') return storedValue;
  return prefersDark ? 'dark' : 'light';
}

export function nextTheme(theme) {
  return theme === 'light' ? 'dark' : 'light';
}

export function readStoredTheme(storage) {
  try {
    if (!storage) return null;
    return storage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveTheme(storage, theme) {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore storage errors (private mode, quota, missing storage)
  }
}
