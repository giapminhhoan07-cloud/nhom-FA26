export const CURRENT_USER_KEY = "studysphere_current_user";
const LEGACY_CURRENT_USER_KEYS = ["studysphere_session", "studysphere_user_session"];

export function getUserDataKey(user, name) {
  const userId = user?.id || user?.email;
  return userId ? `studysphere_user_${encodeURIComponent(String(userId))}_${name}` : "";
}

function parseStoredValue(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function readUserData(user, name, fallback, { storage = globalThis.localStorage, legacyKey = "" } = {}) {
  const scopedKey = getUserDataKey(user, name);
  if (!scopedKey || !storage) return fallback;

  const scopedValue = parseStoredValue(storage, scopedKey, undefined);
  if (scopedValue !== undefined) return scopedValue;

  if (!legacyKey) return fallback;
  const ownerKey = `studysphere_legacy_owner_${legacyKey}`;
  if (storage.getItem(ownerKey)) return fallback;

  const legacyValue = parseStoredValue(storage, legacyKey, fallback);
  if (legacyValue !== fallback) {
    storage.setItem(scopedKey, JSON.stringify(legacyValue));
    storage.setItem(ownerKey, String(user.id || user.email));
    return legacyValue;
  }

  storage.setItem(ownerKey, String(user.id || user.email));
  return fallback;
}

export function writeUserData(user, name, value, storage = globalThis.localStorage) {
  const scopedKey = getUserDataKey(user, name);
  if (!scopedKey || !storage) return false;
  storage.setItem(scopedKey, JSON.stringify(value));
  return true;
}

export function readUserCollection(user, name, legacyKey, storage = globalThis.localStorage) {
  const value = readUserData(user, name, [], { storage, legacyKey });
  return Array.isArray(value) ? value : [];
}

export function writeUserCollection(user, name, values, storage = globalThis.localStorage) {
  return writeUserData(user, name, Array.isArray(values) ? values : [], storage);
}

export function getCurrentUser(storage = globalThis.localStorage) {
  if (!storage) return null;
  for (const key of [CURRENT_USER_KEY, ...LEGACY_CURRENT_USER_KEYS]) {
    try {
      const user = JSON.parse(storage.getItem(key) || "null");
      if (user && typeof user === "object") {
        if (key !== CURRENT_USER_KEY) setCurrentUser(user, storage);
        return user;
      }
    } catch {
      // Continue checking legacy session keys.
    }
  }
  return null;
}

export function setCurrentUser(user, storage = globalThis.localStorage) {
  if (!storage) return false;
  if (!user || typeof user !== "object") {
    clearCurrentUser(storage);
    return true;
  }

  storage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  LEGACY_CURRENT_USER_KEYS.forEach((key) => storage.removeItem(key));
  return true;
}

export function clearCurrentUser(storage = globalThis.localStorage) {
  if (!storage) return false;
  [CURRENT_USER_KEY, ...LEGACY_CURRENT_USER_KEYS].forEach((key) => storage.removeItem(key));
  return true;
}