export const THEME_STORAGE_KEY = "orbit-theme";
export const THEMES = ["light", "dark"];

export function isTheme(value) {
  return value === "light" || value === "dark";
}

export function resolveInitialTheme(storedValue, prefersDark) {
  if (isTheme(storedValue)) return storedValue;
  return prefersDark === true ? "dark" : "light";
}

export function nextTheme(current) {
  return current === "dark" ? "light" : "dark";
}

export function readStoredTheme(storage) {
  try {
    if (!storage) return null;
    const value = storage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeTheme(storage, theme) {
  try {
    if (!storage) return false;
    storage.setItem(THEME_STORAGE_KEY, theme);
    return true;
  } catch {
    return false;
  }
}
