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
const isAdmin = currentUser && (currentUser.role === "admin" || currentUser.is_admin === true || currentUser.isAdmin === true || Number(currentUser.is_admin) === 1);

const isHomeRoute = () => {
  const pathname = window.location.pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const homePaths = ["/", "/index.html", "/backup", "/backup/index.html", "/public", "/public/index.html", "/public/backup", "/public/backup/index.html"];
  return homePaths.includes(pathname) || pathname.endsWith("/backup") || pathname.endsWith("/public/backup");
};

if (isAdmin && isHomeRoute()) {
  window.location.replace("/backup/pages/admin-dashboard.html");
}

const isBackupPage = window.location.pathname.includes("/backup/pages/");
const currentPath = window.location.pathname;
const getAuthPath = () => isBackupPage ? "auth.html" : "/backup/pages/auth.html";
const protectedRoutes = [
  "/profile.html",
  "/history.html",
  "/favorites.html",
  "/admin.html",
  "/admin-dashboard.html",
  "/admin-users.html",
  "/admin-feedback.html",
];
const isProtectedRoute = protectedRoutes.some((page) => currentPath.endsWith(page));
if (!currentUser && isProtectedRoute) {
  const returnTarget = currentPath.endsWith("/admin.html")
    ? "admin"
    : currentPath.endsWith("/admin-dashboard.html")
      ? "admin-dashboard"
      : currentPath.endsWith("/admin-users.html")
        ? "admin-users"
        : currentPath.endsWith("/admin-feedback.html")
          ? "admin-feedback"
          : "home";
  window.location.replace(`${getAuthPath()}?return=${returnTarget}`);
}

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

function enhancePracticeNavigation() {
  document.querySelectorAll(".main-nav a[href]").forEach((link) => {
    if (link.textContent.trim() !== "Bài kiểm tra") return;
    const destination = new URL(link.href);
    const testPath = destination.pathname.replace(/\/+$/, "");
    if (!testPath.endsWith("/tests") && !testPath.endsWith("/tests/index.html")) return;
    destination.pathname = testPath.endsWith("/tests") ? `${testPath}/index.html` : testPath;

    const isActive = link.classList.contains("active");
    const currentMode = window.location.pathname.endsWith("/tests/scope.html") ? "scope" : "exam";
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
      const optionUrl = new URL(destination);
      optionUrl.pathname = optionUrl.pathname.replace(/index\.html$/, mode === "scope" ? "scope.html" : "index.html");
      optionUrl.search = "";
      optionUrl.hash = "";
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
  if (!isAdmin) {
    import("./notifications.js")
      .then(({ renderNotificationBell }) => renderNotificationBell(currentUser))
      .catch((error) => console.error("Không thể tải chuông thông báo.", error));
  }

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
syncSidebarState();
enhancePracticeNavigation();
renderAccount();
if (!isAdminRoute) {
  import("./study-ai.js")
    .catch((error) => console.error("Không thể tải Study AI.", error));
}
