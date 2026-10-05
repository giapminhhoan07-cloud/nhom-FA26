import test from "node:test";
import assert from "node:assert/strict";

import { resetLocalPassword } from "../public/backup/js/passwordRecovery.js";

test("changes only the matching local account password without mutating stored input", () => {
  const users = [
    { email: "one@example.com", password: "old-pass", role: "user" },
    { email: "two@example.com", password: "other-pass", role: "user" },
  ];

  const { updatedUsers, user } = resetLocalPassword(users, " ONE@example.com ", "new-pass");

  assert.equal(user.password, "new-pass");
  assert.equal(updatedUsers[1].password, "other-pass");
  assert.equal(users[0].password, "old-pass");
});

test("rejects an email that is not stored in this browser", () => {
  assert.throws(
    () => resetLocalPassword([], "missing@example.com", "new-pass"),
    /Không tìm thấy tài khoản/,
  );
});

test("does not allow resetting the seeded local administrator", () => {
  assert.throws(
    () => resetLocalPassword([{ email: "admin@example.com", role: "admin" }], "admin@example.com", "new-pass"),
    /tài khoản quản trị/,
  );
});
