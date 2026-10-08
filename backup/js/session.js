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

if (!currentUser && !window.location.pathname.endsWith("/auth.html") && !window.location.pathname.endsWith("/backup/pages/auth.html") && !window.location.pathname.endsWith("/backup/auth.html")) {
  const returnTarget = window.location.pathname.endsWith("/index.html") || window.location.pathname === "/" ? "home" : window.location.pathname.split("/").pop().replace(/\.html$/, "") || "home";
  window.location.replace(`${getAuthPath()}?return=${returnTarget}`);
}

const isHomeRoute = () => {
  const pathname = window.location.pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const homePaths = ["/", "/index.html", "/backup", "/backup/index.html", "/public", "/public/index.html", "/public/backup", "/public/backup/index.html"];
  return homePaths.includes(pathname) || pathname.endsWith("/backup") || pathname.endsWith("/public/backup");
};

if (currentUser && currentUser.role === "admin" && isHomeRoute()) {
  window.location.replace("/backup/pages/admin-dashboard.html");
}

const isAdminRoute = [
  "/admin.html",
  "/admin-dashboard.html",
  "/admin-users.html",
  "/admin-feedback.html",
].some((page) => window.location.pathname.endsWith(page));
if (isAdminRoute && (!currentUser || !currentUser.role || currentUser.role !== "admin")) {
  const returnTarget = window.location.pathname.endsWith("/admin-users.html")
    ? "admin-users"
    : window.location.pathname.endsWith("/admin-feedback.html")
      ? "admin-feedback"
      : window.location.pathname.endsWith("/admin-dashboard.html")
        ? "admin-dashboard"
        : "admin";
  window.location.replace(`${getAuthPath()}?return=${returnTarget}`);
}

const protectedRoutes = [
  "/profile.html",
  "/history.html",
  "/favorites.html",
];
const isProtectedRoute = protectedRoutes.some((page) => window.location.pathname.endsWith(page));
if (!currentUser && isProtectedRoute) {
  const returnTarget = "home";
  window.location.replace(`${getAuthPath()}?return=${returnTarget}`);
}

function enhancePracticeNavigation() {
  document.querySelectorAll(".main-nav a[href]").forEach((link) => {
    if (link.textContent.trim() !== "Bài kiểm tra") return;
    const destination = new URL(link.href);
    if (!destination.pathname.endsWith("/tests/index.html")) return;

    const isActive = link.classList.contains("active");
    const currentMode = new URLSearchParams(window.location.search).get("mode") === "scope" ? "scope" : "exam";
    const dropdown = document.createElement("div");
    dropdown.className = "nav-dropdown";
    const trigger = document.createElement("button");
    trigger.className = `nav-dropdown-trigger${isActive ? " active" : ""}`;
    trigger.type = "button";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", "practice-nav-menu");
    trigger.textContent = "Ôn Luyện";
    const indicator = document.createElement("span");
    indicator.className = "nav-dropdown-indicator";
    indicator.setAttribute("aria-hidden", "true");
    indicator.textContent = "⌄";
    trigger.append(indicator);

    const menu = document.createElement("div");
    menu.className = "nav-dropdown-menu";
    menu.id = "practice-nav-menu";
    [
      { mode: "scope", label: "Ôn theo phạm vi" },
      { mode: "exam", label: "Luyện đề thi" },
    ].forEach(({ mode, label }) => {
      const optionUrl = new URL(link.href);
      optionUrl.searchParams.set("mode", mode);
      const option = document.createElement("a");
      option.href = optionUrl.href;
      option.textContent = label;
      if (isActive && mode === currentMode) {
        option.classList.add("active");
        option.setAttribute("aria-current", "page");
      }
      menu.append(option);
    });

    const setOpen = (isOpen) => {
      dropdown.classList.toggle("open", isOpen);
      trigger.setAttribute("aria-expanded", String(isOpen));
    };
    dropdown.addEventListener("mouseenter", () => setOpen(true));
    dropdown.addEventListener("mouseleave", () => setOpen(false));
    dropdown.addEventListener("focusin", () => setOpen(true));
    dropdown.addEventListener("focusout", (event) => {
      if (!dropdown.contains(event.relatedTarget)) setOpen(false);
    });
    trigger.addEventListener("click", () => setOpen(!dropdown.classList.contains("open")));
    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.focus();
    });
    dropdown.append(trigger, menu);
    link.replaceWith(dropdown);
  });
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

function addContactNavigationLink() {
  const mainNav = document.querySelector(".main-nav");
  if (!mainNav || mainNav.querySelector('a[href$="contact.html"]')) return;

  const link = document.createElement("a");
  link.href = getPagePath("contact.html");
  link.textContent = "Liên hệ";
  if (window.location.pathname.endsWith("/contact.html")) {
    link.classList.add("active");
    link.setAttribute("aria-current", "page");
  }
  mainNav.append(link);
}

function showAuthSuccessNotice() {
  const noticeKey = "studysphere_auth_success_notice";
  const noticeType = sessionStorage.getItem(noticeKey);
  if (noticeType !== "login" && noticeType !== "register") return;
  sessionStorage.removeItem(noticeKey);

  const notice = document.createElement("div");
  notice.className = "site-notice";
  notice.setAttribute("role", "status");
  notice.setAttribute("aria-live", "polite");
  const message = document.createElement("p");
  message.textContent = noticeType === "register"
    ? "Đăng ký thành công! Chào mừng bạn đến với StudySphere."
    : "Đăng nhập thành công! Chào mừng bạn trở lại.";
  const dismiss = document.createElement("button");
  dismiss.type = "button";
  dismiss.className = "site-notice-dismiss";
  dismiss.setAttribute("aria-label", "Đóng thông báo");
  dismiss.textContent = "×";
  dismiss.addEventListener("click", () => notice.remove());
  notice.append(message, dismiss);
  document.body.append(notice);
  window.setTimeout(() => notice.remove(), 3000);
}

addContactNavigationLink();
showAuthSuccessNotice();
if (currentUser) renderAccount();
enhancePracticeNavigation();
