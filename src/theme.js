export const THEME_KEY = 'orbit-theme';

export function resolveTheme(stored, prefersDark) {
  if (stored === 'light' || stored === 'dark') return stored;
  return prefersDark ? 'dark' : 'light';
}

export function toggleTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}

export function loadTheme(storage) {
  if (!storage) return null;
  try {
    const v = storage.getItem(THEME_KEY);
    return v === undefined ? null : v;
  } catch {
    return null;
  }
}

export function saveTheme(storage, theme) {
  if (!storage) return;
  try {
    storage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}
