const isAdminUser = (user) => Boolean(
  user && (
    user.role === "admin" ||
    user.is_admin === true ||
    user.isAdmin === true ||
    Number(user.is_admin) === 1 ||
    (typeof user.email === "string" && user.email.toLowerCase() === "admin@studysphere.local")
  )
);

const currentUser = (() => {
  try {
    const user = JSON.parse(localStorage.getItem("studysphere_current_user") || "null");
    if (!user) return null;
    const normalized = { ...user, role: isAdminUser(user) ? "admin" : (user.role || "user") };
    normalized.is_admin = isAdminUser(user);
    normalized.isAdmin = normalized.is_admin;
    localStorage.setItem("studysphere_current_user", JSON.stringify(normalized));
    return normalized;
  } catch {
    return null;
  }
})();

const isBackupPage = window.location.pathname.includes("/backup/pages/");
const getAuthPath = () => isBackupPage ? "auth.html" : "/backup/pages/auth.html";

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

  if (isAdminUser(currentUser)) {
    const mainNav = header.querySelector(".main-nav");
    if (mainNav && !mainNav.querySelector('a[href$="admin.html"]')) {
      const adminLink = document.createElement("a");
      adminLink.href = getPagePath("admin.html");
      adminLink.textContent = "Quản trị đề thi";
      adminLink.dataset.adminNav = "true";
      mainNav.append(adminLink);
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
        <a href="${getPagePath("profile.html")}">Trang cá nhân</a>
        ${isAdminUser(currentUser) ? `<a href="${getPagePath("admin.html")}">Quản trị đề thi</a>` : ""}
        <a href="${getPagePath("history.html")}">Lịch sử làm bài</a>
        <a href="${getPagePath("favorites.html")}">Đề đã lưu</a>
      </div>
      <button class="account-logout" type="button">Đăng xuất</button>
    </div>
  `;

  account.querySelector(".account-name").textContent = currentUser.name || "Tài khoản";
  account.querySelector(".account-full-name").textContent = currentUser.name || "Tài khoản";
  account.querySelector(".account-email").textContent = currentUser.email || "";
  account.querySelector(".account-role").textContent = isAdminUser(currentUser) ? "Quản trị viên" : "Người dùng";
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

renderAccount();
