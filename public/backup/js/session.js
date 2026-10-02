const currentUser = (() => {
  try {
    return JSON.parse(localStorage.getItem("studysphere_current_user") || "null");
  } catch {
    return null;
  }
})();
const isAdmin = currentUser && (currentUser.role === "admin" || currentUser.is_admin === true || currentUser.isAdmin === true || Number(currentUser.is_admin) === 1);

const isBackupPage = window.location.pathname.includes("/backup/pages/");
const currentPath = window.location.pathname;
const getAuthPath = () => isBackupPage ? "auth.html" : "/backup/pages/auth.html";
const isAdminRoute = [
  "/admin.html",
  "/admin-dashboard.html",
  "/admin-users.html",
  "/admin-feedback.html",
].some((page) => currentPath.endsWith(page));

if (isAdminRoute && (!currentUser || !isAdmin)) {
  const returnTarget = currentPath.endsWith("/admin-users.html")
    ? "admin-users"
    : currentPath.endsWith("/admin-feedback.html")
      ? "admin-feedback"
      : currentPath.endsWith("/admin-dashboard.html")
        ? "admin-dashboard"
        : "admin";
  window.location.replace(`${getAuthPath()}?return=${returnTarget}`);
}

const menuToggle = document.querySelector(".menu-toggle");
const sharedNav = document.querySelector(".main-nav");
if (menuToggle && sharedNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = sharedNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  sharedNav.addEventListener("click", (event) => {
    if (!event.target.closest("a")) return;
    sharedNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
}

function syncSidebarState() {
  const sidebarLinks = document.querySelectorAll(".admin-sidebar-nav [data-admin-section]");
  if (!sidebarLinks.length) return;

  const pageKey = currentPath.endsWith("/admin-feedback.html")
    ? "feedback"
    : currentPath.endsWith("/admin-users.html")
      ? "users"
      : currentPath.endsWith("/admin.html")
        ? "exams"
        : "overview";

  sidebarLinks.forEach((link) => {
    const isActive = link.dataset.adminSection === pageKey;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

function renderAccount() {
  const header = document.querySelector(".header-inner");
  if (!header) return;

  header.querySelector(".header-action")?.remove();
  const pagePath = window.location.pathname;
  const mainNav = header.querySelector(".main-nav");

  if (!currentUser) {
    const loginLink = document.createElement("a");
    loginLink.className = "header-action session-login";
    loginLink.href = getAuthPath();
    loginLink.innerHTML = 'Đăng nhập <span aria-hidden="true">↗</span>';
    header.append(loginLink);
    return;
  }

  if (isAdmin && mainNav) {
    mainNav.innerHTML = `
      <a data-admin-section="overview" href="${getPagePath("admin-dashboard.html")}">Tổng quan</a>
      <a data-admin-section="exams" href="${getPagePath("admin.html")}">Quản lý đề thi</a>
      <a data-admin-section="users" href="${getPagePath("admin-users.html")}">Quản lý người dùng</a>
      <a data-admin-section="feedback" href="${getPagePath("admin-feedback.html")}">Phản hồi &amp; báo cáo</a>
    `;
    const updateAdminNav = () => {
      const pageKey = pagePath.endsWith("/admin-feedback.html")
        ? "feedback"
        : pagePath.endsWith("/admin-users.html")
          ? "users"
          : pagePath.endsWith("/admin.html")
            ? "exams"
            : "overview";
      mainNav.querySelectorAll("[data-admin-section]").forEach((link) => {
        const isActive = link.dataset.adminSection === pageKey;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    };
    updateAdminNav();
    window.addEventListener("hashchange", updateAdminNav); 
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
        ${isAdmin
          ? `<a href="${getPagePath("admin-dashboard.html")}">Tổng quan</a><a href="${getPagePath("admin.html")}">Quản lý đề thi</a><a href="${getPagePath("admin-users.html")}">Quản lý người dùng</a><a href="${getPagePath("admin-feedback.html")}">Phản hồi &amp; báo cáo</a>`
          : `<a href="${getPagePath("profile.html")}">Trang cá nhân</a>`}
      </div>
      <button class="account-logout" type="button">Đăng xuất</button>
    </div>
  `;

  account.querySelector(".account-name").textContent = currentUser.name || "Tài khoản";
  account.querySelector(".account-full-name").textContent = currentUser.name || "Tài khoản";
  account.querySelector(".account-email").textContent = currentUser.email || "";
  account.querySelector(".account-role").textContent = isAdmin ? "Quản trị viên" : "Người dùng";
  header.append(account);

  const trigger = account.querySelector(".account-trigger");
  const panel = account.querySelector(".account-panel");
  trigger.addEventListener("click", () => {
    const open = panel.hidden;
    panel.hidden = !open;
    trigger.setAttribute("aria-expanded", String(open));
  });
  account.querySelector(".account-logout").addEventListener("click", async () => {
    localStorage.removeItem("studysphere_current_user");
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

syncSidebarState();
renderAccount();
