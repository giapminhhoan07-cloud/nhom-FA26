export const NOTIFICATIONS_KEY = "studysphere_notifications";

const readNotifications = () => {
  try {
    const notifications = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || "[]");
    return Array.isArray(notifications) ? notifications : [];
  } catch {
    return [];
  }
};

const getUserIdentity = (user) => ({
  email: String(user?.email || "").trim().toLowerCase(),
  id: String(user?.id || "").trim(),
});

const matchesRecipient = (notification, user) => {
  const identity = getUserIdentity(user);
  if (notification.recipientUserId && identity.id) return notification.recipientUserId === identity.id;
  return Boolean(identity.email && notification.recipientEmail === identity.email);
};

const createNotificationId = () => globalThis.crypto?.randomUUID?.()
  || `notification-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export function getNotificationsForUser(user, notifications = readNotifications()) {
  return notifications
    .filter((notification) => matchesRecipient(notification, user))
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
}

export function createNotifications(recipients, details) {
  const uniqueRecipients = new Map();
  recipients.forEach((recipient) => {
    const identity = getUserIdentity(recipient);
    const key = identity.id ? `id:${identity.id}` : `email:${identity.email}`;
    if (identity.id || identity.email) uniqueRecipients.set(key, identity);
  });

  if (!uniqueRecipients.size) return 0;

  const notifications = readNotifications();
  const createdAt = new Date().toISOString();
  const added = Array.from(uniqueRecipients.values(), (recipient) => ({
    id: createNotificationId(),
    recipientEmail: recipient.email,
    recipientUserId: recipient.id,
    type: details.type,
    title: details.title,
    message: details.message,
    link: details.link || "",
    createdAt,
    read: false,
  }));

  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([...added, ...notifications]));
  return added.length;
}

export function markNotificationRead(notificationId, user) {
  const notifications = readNotifications();
  let updated = false;
  const nextNotifications = notifications.map((notification) => {
    if (notification.id !== notificationId || !matchesRecipient(notification, user) || notification.read) {
      return notification;
    }
    updated = true;
    return { ...notification, read: true };
  });

  if (updated) localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(nextNotifications));
  return updated;
}

export function markAllNotificationsRead(user) {
  const notifications = readNotifications();
  let updated = false;
  const nextNotifications = notifications.map((notification) => {
    if (!matchesRecipient(notification, user) || notification.read) return notification;
    updated = true;
    return { ...notification, read: true };
  });

  if (updated) localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(nextNotifications));
  return updated;
}

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleString("vi-VN");
};

const getSafeNotificationLink = (link) => {
  if (!link) return "";
  try {
    const url = new URL(link, window.location.href);
    return url.origin === window.location.origin ? url.href : "";
  } catch {
    return "";
  }
};

export function renderNotificationBell(user) {
  const header = document.querySelector(".header-inner");
  if (!header || !user || header.querySelector(".notification-menu")) return;

  const menu = document.createElement("div");
  menu.className = "notification-menu";
  menu.innerHTML = `
    <button class="notification-trigger" type="button" aria-expanded="false" aria-label="Thông báo" aria-controls="notification-panel">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"></path></svg>
      <span class="notification-count" hidden></span>
    </button>
    <section class="notification-panel" id="notification-panel" aria-label="Thông báo" hidden>
      <div class="notification-heading"><strong>Thông báo</strong><button class="notification-mark-all" type="button">Đánh dấu đã đọc</button></div>
      <div class="notification-list" aria-live="polite"></div>
    </section>
  `;
  const account = header.querySelector(".account-menu");
  header.insertBefore(menu, account || null);

  const trigger = menu.querySelector(".notification-trigger");
  const panel = menu.querySelector(".notification-panel");
  const count = menu.querySelector(".notification-count");
  const list = menu.querySelector(".notification-list");

  const renderList = () => {
    const notifications = getNotificationsForUser(user);
    const unreadCount = notifications.filter((notification) => !notification.read).length;
    count.hidden = unreadCount === 0;
    count.textContent = unreadCount > 99 ? "99+" : String(unreadCount);
    trigger.setAttribute("aria-label", unreadCount ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo");

    list.innerHTML = notifications.length
      ? notifications.map((notification) => `
        <button class="notification-item${notification.read ? "" : " is-unread"}" type="button" data-notification-id="${escapeHtml(notification.id)}" data-notification-link="${escapeHtml(notification.link)}">
          <span class="notification-item-title">${escapeHtml(notification.title)}</span>
          <span class="notification-item-message">${escapeHtml(notification.message)}</span>
          <span class="notification-item-date">${escapeHtml(formatDate(notification.createdAt))}</span>
        </button>
      `).join("")
      : '<p class="notification-empty">Bạn chưa có thông báo nào.</p>';
  };

  renderList();
  trigger.addEventListener("click", () => {
    panel.hidden = !panel.hidden;
    trigger.setAttribute("aria-expanded", String(!panel.hidden));
    if (!panel.hidden) renderList();
  });

  menu.querySelector(".notification-mark-all").addEventListener("click", () => {
    try {
      markAllNotificationsRead(user);
      renderList();
    } catch (error) {
      console.error("Không thể đánh dấu thông báo đã đọc.", error);
    }
  });

  list.addEventListener("click", (event) => {
    const item = event.target.closest(".notification-item");
    if (!item) return;

    try {
      markNotificationRead(item.dataset.notificationId, user);
      renderList();
      const link = getSafeNotificationLink(item.dataset.notificationLink);
      if (link) window.location.href = link;
    } catch (error) {
      console.error("Không thể cập nhật trạng thái thông báo.", error);
    }
  });

  document.addEventListener("click", (event) => {
    if (menu.contains(event.target)) return;
    panel.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  });

  window.addEventListener("storage", (event) => {
    if (event.key === NOTIFICATIONS_KEY) renderList();
  });

  window.addEventListener("focus", renderList);
}
