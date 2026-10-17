import test from "node:test";
import assert from "node:assert/strict";

import { clearCurrentUser, getCurrentUser, setCurrentUser } from "../public/backup/js/userData.js";

function createStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  };
}

test("uses the canonical session when legacy session keys conflict", () => {
  const canonicalUser = { id: "canonical-user", email: "canonical@example.com" };
  const storage = createStorage({
    studysphere_current_user: JSON.stringify(canonicalUser),
    studysphere_session: JSON.stringify({ id: "stale-user" }),
  });

  assert.deepEqual(getCurrentUser(storage), canonicalUser);
});

test("migrates an existing legacy session to the canonical key", () => {
  const legacyUser = { id: "legacy-user", email: "legacy@example.com" };
  const storage = createStorage({ studysphere_session: JSON.stringify(legacyUser) });

  assert.deepEqual(getCurrentUser(storage), legacyUser);
  assert.equal(storage.getItem("studysphere_current_user"), JSON.stringify(legacyUser));
  assert.equal(storage.getItem("studysphere_session"), null);
});

test("writes and clears a single canonical session", () => {
  const storage = createStorage({ studysphere_user_session: JSON.stringify({ id: "stale-user" }) });
  const user = { id: "current-user", email: "current@example.com" };

  assert.equal(setCurrentUser(user, storage), true);
  assert.equal(storage.getItem("studysphere_current_user"), JSON.stringify(user));
  assert.equal(storage.getItem("studysphere_user_session"), null);
  assert.equal(clearCurrentUser(storage), true);
  assert.equal(getCurrentUser(storage), null);
});
