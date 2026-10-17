import test from "node:test";
import assert from "node:assert/strict";

test("creates one shared notification per unique remote recipient", async () => {
  const previousApiUrl = Object.getOwnPropertyDescriptor(globalThis, "STUDYSPHERE_API_URL");
  const previousFetch = Object.getOwnPropertyDescriptor(globalThis, "fetch");
  const requests = [];
  Object.defineProperty(globalThis, "STUDYSPHERE_API_URL", {
    configurable: true,
    value: "https://studysphere.example",
  });
  Object.defineProperty(globalThis, "fetch", {
    configurable: true,
    value: async (url, options) => {
      requests.push({ url, options, body: JSON.parse(options.body) });
      return { ok: true, status: 201, json: async () => ({}) };
    },
  });

  try {
    const { createRemoteNotifications } = await import("../public/backup/js/notifications.js?remote-test");
    const count = await createRemoteNotifications(
      [
        { id: "user-1", email: "STUDENT@example.com" },
        { id: "user-1", email: "student@example.com" },
      ],
      { type: "new-exam", title: "Đề mới", message: "Đề Toán", link: "/exam" },
    );

    assert.equal(count, 1);
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, "https://studysphere.example/notifications");
    assert.equal(requests[0].options.method, "POST");
    assert.equal(requests[0].body.recipientUserId, "user-1");
    assert.equal(requests[0].body.recipientEmail, "student@example.com");
    assert.equal(requests[0].body.read, false);
  } finally {
    if (previousApiUrl) Object.defineProperty(globalThis, "STUDYSPHERE_API_URL", previousApiUrl);
    else delete globalThis.STUDYSPHERE_API_URL;
    if (previousFetch) Object.defineProperty(globalThis, "fetch", previousFetch);
    else delete globalThis.fetch;
  }
});
