const tabs = document.querySelectorAll("[data-auth-tab]");
const returnTarget = new URLSearchParams(window.location.search).get("return");
const panels = {
  login: document.querySelector("#login-panel"),
  register: document.querySelector("#register-panel"),
};

function switchTab(name) {
  tabs.forEach((tab) => {
    const active = tab.dataset.authTab === name;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== name; });
  document.title = name === "login" ? "Đăng nhập | StudySphere" : "Đăng ký | StudySphere";
}

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-auth-tab]");
  const switchButton = event.target.closest("[data-switch-tab]");
  if (tab) switchTab(tab.dataset.authTab);
  if (switchButton) switchTab(switchButton.dataset.switchTab);
});

const setMessage = (id, text, success = false) => {
  const message = document.querySelector(`#${id}`);
  message.textContent = text;
  message.classList.toggle("success", success);
};

const CURRENT_USER_KEYS = ["studysphere_current_user", "studysphere_session", "studysphere_user_session"];
const readStoredUser = () => {
  for (const key of CURRENT_USER_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw || raw === "null" || raw === "undefined") continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch {
      // Ignore malformed storage and keep checking other keys.
    }
  }
  return null;
};

const writeStoredUser = (user) => {
  const payload = JSON.stringify(user || null);
  CURRENT_USER_KEYS.forEach((key) => localStorage.setItem(key, payload));
};

const normalizeUser = (user) => ({
  ...user,
  role: user.role === "admin" || user.is_admin === true || user.isAdmin === true || Number(user.is_admin) === 1 ? "admin" : (user.role || "user"),
});

const getLocalUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem("studysphere_users") || "[]");
    const hasAdmin = users.some((user) => user.role === "admin");
    return hasAdmin ? users : [{ id: "local-admin", name: "Quản trị viên", email: "admin@studysphere.local", password: "admin123", role: "admin" }, ...users];
  } catch { return [{ id: "local-admin", name: "Quản trị viên", email: "admin@studysphere.local", password: "admin123", role: "admin" }]; }
};

const setLocalUsers = (users) => localStorage.setItem("studysphere_users", JSON.stringify(users));

const defaultAdmin = {
  id: "local-admin",
  name: "Quản trị viên",
  email: "admin@studysphere.local",
  role: "admin",
  password: "admin123",
};

const users = getLocalUsers();
const adminIndex = users.findIndex((user) => user.email === defaultAdmin.email);
if (adminIndex < 0) setLocalUsers([...users, defaultAdmin]);
else if (users[adminIndex].role !== "admin" || users[adminIndex].password !== defaultAdmin.password) {
  users[adminIndex] = defaultAdmin;
  setLocalUsers(users);
}

const submitAuth = async (payload) => {
  try {
    const response = await fetch("../api/auth.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (response.ok && result.success && result.user) {
      if (payload.action === "login" && payload.email === defaultAdmin.email) return { ...result, user: defaultAdmin };
      return { ...result, user: normalizeUser(result.user) };
    }
  } catch {
    // Vite local mode does not include the PHP API.
  }

  const users = getLocalUsers();
  if (payload.action === "register") {
    if (users.some((user) => user.email === payload.email)) throw new Error("Email này đã được đăng ký.");
    const user = { id: `local-${Date.now()}`, name: payload.name, email: payload.email, role: "user", password: payload.password };
    setLocalUsers([...users, user]);
    return { success: true, user: normalizeUser(user) };
  }

  const user = users.find((item) => item.email === payload.email && item.password === payload.password);
  if (!user) throw new Error("Email hoặc mật khẩu không đúng.");
  return { success: true, user: normalizeUser(user) };
};

const registerForm = document.querySelector("#register-form");
registerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(registerForm);
  const name = data.get("name").trim();
  const email = data.get("email").trim().toLowerCase();
  const password = data.get("password");
  try {
    const result = await submitAuth({ action: "register", name, email, password });
    writeStoredUser(result.user);
    window.location.href = "/backup/index.html";
  } catch (error) {
    setMessage("register-message", error.message);
  }
});

const loginForm = document.querySelector("#login-form");
loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = data.get("email").trim().toLowerCase();
  const password = data.get("password");
  try {
    const result = await submitAuth({ action: "login", email, password });
    writeStoredUser(result.user);
    const returnPaths = {
      admin: "admin.html",
      "admin-dashboard": "admin-dashboard.html",
      "admin-users": "admin-users.html",
      "admin-feedback": "admin-feedback.html",
      home: "/backup/index.html",
    };
    window.location.href = returnPaths[returnTarget] || (result.user.role === "admin" ? "admin-dashboard.html" : "/backup/index.html");
  } catch (error) {
    setMessage("login-message", error.message);
  }
});

// ─── Google OAuth (Google Identity Services) ──────────────────────────────────
// Thay GOOGLE_CLIENT_ID bằng Client ID thật từ Google Cloud Console.
// Hướng dẫn: https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com";

/**
 * Giải mã JWT credential trả về từ Google GIS.
 * Không cần verify chữ ký ở client-side; chỉ đọc payload.
 * @param {string} token - JWT string.
 * @returns {{ sub: string, name: string, email: string, picture: string }}
 */
function parseGoogleJwt(token) {
  try {
    const base64Payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64Payload));
  } catch {
    return null;
  }
}

/**
 * Xử lý credential Google GIS sau khi người dùng chọn tài khoản.
 * Được gọi bởi cả nút "Đăng nhập bằng Google" lẫn "Đăng ký bằng Google".
 * @param {google.accounts.id.CredentialResponse} response
 */
function handleGoogleCredential(response) {
  const payload = parseGoogleJwt(response.credential);
  if (!payload || !payload.email) {
    setMessage("login-message", "Không thể đọc thông tin từ Google. Vui lòng thử lại.");
    return;
  }

  const existingUsers = getLocalUsers();
  let user = existingUsers.find((u) => u.email === payload.email);

  if (!user) {
    // Người dùng mới — tạo tài khoản tự động với role "user"
    user = {
      id: `google-${payload.sub}`,
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      role: "user",
      // Không lưu password cho tài khoản Google
      googleId: payload.sub,
      avatar: payload.picture || null,
    };
    setLocalUsers([...existingUsers, user]);
  }

  const normalizedUser = normalizeUser(user);
  writeStoredUser(normalizedUser);

  // Sử dụng lại logic redirect của login form (returnTarget đã được khai báo ở đầu file)
  const returnPaths = {
    admin: "admin.html",
    "admin-dashboard": "admin-dashboard.html",
    "admin-users": "admin-users.html",
    "admin-feedback": "admin-feedback.html",
    home: "/backup/index.html",
  };
  window.location.href =
    returnPaths[returnTarget] ||
    (normalizedUser.role === "admin" ? "admin-dashboard.html" : "/backup/index.html");
}

/**
 * Khởi tạo Google Identity Services và gắn sự kiện cho các nút Google.
 * Được gọi sau khi GIS SDK tải xong (hoặc ngay lập tức nếu đã tải).
 */
function initGoogleOAuth() {
  if (typeof google === "undefined" || !google.accounts?.id) {
    // GIS chưa tải xong — thử lại sau 500ms
    setTimeout(initGoogleOAuth, 500);
    return;
  }

  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential,
    // Tắt auto_select để tránh tự động đăng nhập khi user chưa chủ động nhấn
    auto_select: false,
  });

  // Gắn sự kiện cho nút "Đăng nhập bằng Google" (login panel)
  const googleLoginBtn = document.querySelector("#google-login-btn");
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", () => {
      google.accounts.id.prompt();
    });
  }

  // Gắn sự kiện cho nút "Đăng ký bằng Google" (register panel)
  const googleRegisterBtn = document.querySelector("#google-register-btn");
  if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener("click", () => {
      google.accounts.id.prompt();
    });
  }
}

// Khởi tạo khi DOM sẵn sàng (script đã có defer nên DOM luôn sẵn sàng)
initGoogleOAuth();
// ─── End Google OAuth ──────────────────────────────────────────────────────────
