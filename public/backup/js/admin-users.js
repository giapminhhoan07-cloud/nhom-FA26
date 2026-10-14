import { apiClient } from "./apiClient.js";

const readJson = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
};

const currentUser = readJson("studysphere_current_user", null);
const isAdmin = currentUser && (currentUser.role === "admin" || currentUser.is_admin === true || currentUser.isAdmin === true || Number(currentUser.is_admin) === 1);

if (!isAdmin) {
  window.location.replace("auth.html?return=admin-users");
} else {
  const usersList = document.querySelector("#admin-users-list");
  const userCount = document.querySelector("#admin-user-count");
  const searchInput = document.querySelector("#admin-users-search");
  const emptyState = document.querySelector("#admin-users-empty");
  const message = document.querySelector("#admin-users-message");
  const statusKey = "studysphere_user_status";
  const metadataKey = "studysphere_user_metadata";
  let apiUsers = [];

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function getUsers() {
    const localUsers = readJson("studysphere_users", []);
    const merged = new Map((Array.isArray(localUsers) ? localUsers : []).map((user) => [String(user.id || user.email), user]));
    apiUsers.forEach((user) => merged.set(String(user.id || user.email), user));
    return [...merged.values()];
  }

  function formatDate(value) {
    if (!value) return "Chưa có dữ liệu";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Chưa có dữ liệu" : date.toLocaleDateString("vi-VN");
  }

  function renderUsers() {
    const users = getUsers();
    const statuses = readJson(statusKey, {});
    const metadata = readJson(metadataKey, {});
    const query = searchInput.value.trim().toLocaleLowerCase("vi");
    const filtered = users.filter((user) => `${user.name || ""} ${user.email || ""}`.toLocaleLowerCase("vi").includes(query));

    userCount.textContent = `${filtered.length} người dùng`;
    emptyState.hidden = filtered.length > 0;
    usersList.innerHTML = filtered.map((user, index) => {
      const key = user.id || user.email;
      const isUserAdmin = user.role === "admin" || user.is_admin === true || user.isAdmin === true || Number(user.is_admin) === 1;
      const role = isUserAdmin ? "admin" : "student";
      const status = statuses[key] || user.status || "active";
      const isSelf = (currentUser.id && user.id === currentUser.id) || (currentUser.email && user.email === currentUser.email);
      const canToggleStatus = role !== "admin" && !isSelf;
      const action = canToggleStatus
        ? `<button class="admin-user-toggle ${status === "locked" ? "is-unlock" : "is-lock"}" type="button" data-user-key="${escapeHtml(key)}" data-next-status="${status === "locked" ? "active" : "locked"}">${status === "locked" ? "Mở khóa" : "Khóa tài khoản"}</button>`
        : `<span class="admin-user-protected">${isSelf ? "Tài khoản hiện tại" : "Tài khoản quản trị"}</span>`;

      return `<tr><td data-label="STT">${index + 1}</td><td data-label="Họ tên">${escapeHtml(user.name || "Chưa cập nhật")}</td><td data-label="Email">${escapeHtml(user.email || "")}</td><td data-label="Vai trò"><span class="admin-role-badge">${role === "admin" ? "Admin" : "Student"}</span></td><td data-label="Trạng thái"><span class="admin-user-status ${status === "locked" ? "is-locked" : "is-active"}">${status === "locked" ? "Đã khóa" : "Đang hoạt động"}</span></td><td data-label="Ngày đăng ký">${formatDate(metadata[key]?.createdAt || user.createdAt || user.created_at)}</td><td data-label="Thao tác">${action}</td></tr>`;
    }).join("");
  }

  usersList.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-user-key]");
    if (!button) return;

    const statuses = readJson(statusKey, {});
    statuses[button.dataset.userKey] = button.dataset.nextStatus;
    localStorage.setItem(statusKey, JSON.stringify(statuses));
    const targetUser = getUsers().find((user) => String(user.id || user.email) === button.dataset.userKey);
    let synced = true;
    if (targetUser?.id && !String(targetUser.id).startsWith("local-")) {
      try {
        await apiClient.update("users", targetUser.id, { status: button.dataset.nextStatus });
      } catch {
        synced = false;
      }
    }
    message.textContent = button.dataset.nextStatus === "locked"
      ? synced ? "Đã khóa tài khoản." : "Đã lưu trạng thái khóa trên thiết bị; JSON-server chưa đồng bộ."
      : synced ? "Đã mở khóa tài khoản." : "Đã lưu trạng thái mở khóa trên thiết bị; JSON-server chưa đồng bộ.";
    message.classList.add("success");
    renderUsers();
  });

  searchInput.addEventListener("input", renderUsers);
  async function loadUsers() {
    try {
      const records = await apiClient.list("users");
      apiUsers = Array.isArray(records) ? records : [];
      message.textContent = `Đã tải ${apiUsers.length} tài khoản từ JSON-server.`;
      message.classList.add("success");
    } catch (error) {
      message.textContent = `${error.message} Đang hiển thị tài khoản lưu trên thiết bị.`;
      message.classList.remove("success");
    }
    renderUsers();
  }
  loadUsers();
}