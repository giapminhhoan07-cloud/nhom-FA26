import test from "node:test";
import assert from "node:assert/strict";

import { findUserByEmail, normalizeEmail, resolveLoginUser } from "../public/backup/js/authAccounts.js";

test("normalizes email addresses before matching accounts", () => {
  const user = { id: "local-1", email: " Student@Example.com " };

  assert.equal(normalizeEmail(" STUDENT@example.COM "), "student@example.com");
  assert.equal(findUserByEmail([user], "student@example.com"), user);
});

test("uses the remote account as the only credential source when emails conflict", () => {
  const localUser = { id: "local-1", email: "student@example.com", password: "local-password" };
  const remoteUser = { id: "remote-1", email: "STUDENT@example.com", password: "remote-password" };
  const accounts = { localUsers: [localUser], remoteUsers: [remoteUser], email: "student@example.com" };

  assert.equal(resolveLoginUser({ ...accounts, password: "remote-password" }), remoteUser);
  assert.equal(resolveLoginUser({ ...accounts, password: "local-password" }), null);
});

test("falls back to local credentials when no remote account has that email", () => {
  const localUser = { id: "local-1", email: "student@example.com", password: "local-password" };

  assert.equal(resolveLoginUser({
    remoteUsers: [],
    localUsers: [localUser],
    email: "STUDENT@example.com",
    password: "local-password",
  }), localUser);
});
