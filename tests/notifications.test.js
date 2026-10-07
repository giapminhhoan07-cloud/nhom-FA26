import test from "node:test";
import assert from "node:assert/strict";

import {
  createNotifications,
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "../public/backup/js/notifications.js";

function withLocalStorage(callback) {
  const previousDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const values = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
    },
  });

  try {
    return callback();
  } finally {
    if (previousDescriptor) Object.defineProperty(globalThis, "localStorage", previousDescriptor);
    else delete globalThis.localStorage;
  }
}

test("creates notifications for each unique recipient and returns newest first", () => {
  withLocalStorage(() => {
    const count = createNotifications(
      [{ email: "STUDENT@example.com" }, { email: "student@example.com" }, { email: "other@example.com" }],
      { type: "new-exam", title: "Đề mới", message: "Đề Toán", link: "/exam" },
    );

    assert.equal(count, 2);
    const firstStudentNotifications = getNotificationsForUser({ email: "student@example.com" });
    assert.equal(firstStudentNotifications.length, 1);
    assert.equal(firstStudentNotifications[0].title, "Đề mới");
    assert.equal(firstStudentNotifications[0].read, false);
    assert.equal(getNotificationsForUser({ email: "other@example.com" }).length, 1);
    assert.equal(getNotificationsForUser({ email: "unrelated@example.com" }).length, 0);
  });
});

test("marks only the selected user's notification as read", () => {
  withLocalStorage(() => {
    createNotifications(
      [{ email: "student@example.com" }, { email: "other@example.com" }],
      { type: "admin-reply", title: "Đã trả lời", message: "Nội dung trả lời" },
    );
    const studentNotification = getNotificationsForUser({ email: "student@example.com" })[0];

    assert.equal(markNotificationRead(studentNotification.id, { email: "other@example.com" }), false);
    assert.equal(markNotificationRead(studentNotification.id, { email: "student@example.com" }), true);
    assert.equal(getNotificationsForUser({ email: "student@example.com" })[0].read, true);
    assert.equal(getNotificationsForUser({ email: "other@example.com" })[0].read, false);
  });
});

test("marks all notifications for one user as read", () => {
  withLocalStorage(() => {
    createNotifications(
      [{ id: "student-1", email: "student@example.com" }, { id: "student-2", email: "other@example.com" }],
      { type: "new-exam", title: "Đề mới", message: "Đề mới vừa đăng" },
    );

    assert.equal(markAllNotificationsRead({ id: "student-1", email: "student@example.com" }), true);
    assert.equal(getNotificationsForUser({ id: "student-1", email: "student@example.com" })[0].read, true);
    assert.equal(getNotificationsForUser({ id: "student-2", email: "other@example.com" })[0].read, false);
  });
});
