export const THEME_STORAGE_KEY = "theme";
export const THEMES = ["light", "dark"];

export function isTheme(value) {
  return THEMES.includes(value);
}

export function resolveInitialTheme(storedValue, prefersDark) {
  if (isTheme(storedValue)) return storedValue;
  return prefersDark ? "dark" : "light";
}

export function nextTheme(current) {
  return current === "dark" ? "light" : "dark";
}

export function readStoredTheme(storage) {
  if (!storage) return null;
  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function writeStoredTheme(storage, theme) {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}
