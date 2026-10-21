export const THEME_STORAGE_KEY = "orbit-theme";

export function resolveTheme(stored, prefersDark) {
  if (stored === "light" || stored === "dark") return stored;
  return prefersDark === true ? "dark" : "light";
}

export function nextTheme(theme) {
  return theme === "dark" ? "light" : "dark";
}

export function readStoredTheme(storage) {
  if (!storage) return null;
  try {
    return storage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveTheme(storage, theme) {
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore storage errors
  }
}
