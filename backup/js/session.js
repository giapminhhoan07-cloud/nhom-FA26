const CURRENT_USER_KEYS = ["studysphere_current_user", "studysphere_session", "studysphere_user_session"];
const readStoredUser = () => {
  for (const key of CURRENT_USER_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw || raw === "null" || raw === "undefined") continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Ignore malformed session values.
    }
  }
  return null;
};
const currentUser = readStoredUser();

const isBackupPage = window.location.pathname.includes("/backup/pages/");
const getAuthPath = () => isBackupPage ? "auth.html" : "/backup/pages/auth.html";

const isHomeRoute = () => {
  const pathname = window.location.pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const homePaths = ["/", "/index.html", "/backup", "/backup/index.html", "/public", "/public/index.html", "/public/backup", "/public/backup/index.html"];
  return homePaths.includes(pathname) || pathname.endsWith("/backup") || pathname.endsWith("/public/backup");
};

if (currentUser && currentUser.role === "admin" && isHomeRoute()) {
  window.location.replace("/backup/pages/admin-dashboard.html");
  return;
}

const protectedRoutes = [
  "/profile.html",
  "/history.html",
  "/favorites.html",
  "/admin.html",
  "/admin-dashboard.html",
  "/admin-users.html",
  "/admin-feedback.html",
];
const isProtectedRoute = protectedRoutes.some((page) => window.location.pathname.endsWith(page));
if (!currentUser && isProtectedRoute) {
  const returnTarget = window.location.pathname.endsWith("/admin.html")
    ? "admin"
    : window.location.pathname.endsWith("/admin-dashboard.html")
      ? "admin-dashboard"
      : window.location.pathname.endsWith("/admin-users.html")
        ? "admin-users"
        : window.location.pathname.endsWith("/admin-feedback.html")
          ? "admin-feedback"
          : "home";
  window.location.replace(`${getAuthPath()}?return=${returnTarget}`);
}

function renderAccount() {
  const header = document.querySelector(".header-inner");
  if (!header) return;

  header.querySelector(".header-action")?.remove();

  if (!currentUser) {
    const loginLink = document.createElement("a");
    loginLink.className = "header-action session-login";
    loginLink.href = getAuthPath();
    loginLink.innerHTML = 'Đăng nhập <span aria-hidden="true">↗</span>';
    header.append(loginLink);
    return;
  }

  if (currentUser.role === "admin") {
    const mainNav = header.querySelector(".main-nav");
    if (mainNav) {
      mainNav.innerHTML = `
        <a class="active" href="${getPagePath("admin.html")}#overview">Tổng quan</a>
        <a href="${getPagePath("admin.html")}#exam-management">Quản lý đề thi</a>
        <a href="${getPagePath("admin-users.html")}">Quản lý người dùng</a>
      `;
    }
  }

  const account = document.createElement("div");
  account.className = "account-menu";
  account.innerHTML = `
    <button class="account-trigger" type="button" aria-expanded="false" aria-controls="account-panel">
      <span class="account-avatar" aria-hidden="true">${(currentUser.name || "U").charAt(0).toUpperCase()}</span>
      <span class="account-name"></span>
      <span aria-hidden="true">⌄</span>
    </button>
    <div class="account-panel" id="account-panel" hidden>
      <strong class="account-full-name"></strong>
      <span class="account-email"></span>
      <span class="account-role"></span>
      <div class="account-links">
        ${currentUser.role === "admin"
          ? `<a href="${getPagePath("admin.html")}">Quản lý đề thi</a><a href="${getPagePath("admin-users.html")}">Quản lý người dùng</a>`
          : `<a href="${getPagePath("profile.html")}">Trang cá nhân</a><a href="${getPagePath("history.html")}">Lịch sử làm bài</a><a href="${getPagePath("favorites.html")}">Đề đã lưu</a>`}
      </div>
      <button class="account-logout" type="button">Đăng xuất</button>
    </div>
  `;

  account.querySelector(".account-name").textContent = currentUser.name || "Tài khoản";
  account.querySelector(".account-full-name").textContent = currentUser.name || "Tài khoản";
  account.querySelector(".account-email").textContent = currentUser.email || "";
  account.querySelector(".account-role").textContent = currentUser.role === "admin" ? "Quản trị viên" : "Người dùng";
  header.append(account);

  const trigger = account.querySelector(".account-trigger");
  const panel = account.querySelector(".account-panel");
  trigger.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
  });
  account.querySelector(".account-logout").addEventListener("click", async () => {
    CURRENT_USER_KEYS.forEach((key) => localStorage.removeItem(key));
    try {
      await fetch(getPagePath("../api/auth.php"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    } catch {
      // Redirect even when the PHP server is unavailable.
    }
    window.location.href = getAuthPath();
  });
  document.addEventListener("click", (event) => {
    if (!account.contains(event.target)) {
      panel.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
    }
  });
}

function getPagePath(page) {
  return isBackupPage ? page : `/backup/pages/${page}`;
}

if (currentUser) renderAccount();
