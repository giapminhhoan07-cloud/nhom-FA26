import { resetLocalPassword } from "./passwordRecovery.js";

const tabs = document.querySelectorAll("[data-auth-tab]");
const returnTarget = new URLSearchParams(window.location.search).get("return");
const authTabs = document.querySelector(".auth-tabs");
const AUTH_NOTICE_KEY = "studysphere_auth_success_notice";
const panels = {
  login: document.querySelector("#login-panel"),
  register: document.querySelector("#register-panel"),
  reset: document.querySelector("#reset-panel"),
};

function showPanel(name) {
  authTabs.hidden = name === "reset";
  tabs.forEach((tab) => {
    const active = tab.dataset.authTab === name;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== name; });
  document.title = name === "register"
    ? "Đăng ký | StudySphere"
    : name === "reset" ? "Đặt lại mật khẩu | StudySphere" : "Đăng nhập | StudySphere";
}

document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-auth-tab]");
  const switchButton = event.target.closest("[data-switch-tab]");
  const resetButton = event.target.closest("[data-show-reset]");
  const passwordToggle = event.target.closest("[data-password-toggle]");
  if (tab) showPanel(tab.dataset.authTab);
  if (switchButton) showPanel(switchButton.dataset.switchTab);
  if (resetButton) {
    const loginEmail = document.querySelector('#login-form [name="email"]').value.trim();
    const resetEmail = document.querySelector('#reset-form [name="email"]');
    resetEmail.value = loginEmail;
    document.querySelector("#reset-form").reset();
    resetEmail.value = loginEmail;
    document.querySelector("#reset-message").textContent = "";
    document.querySelectorAll("#reset-form .form-field-error").forEach((error) => {
      error.textContent = "";
      error.hidden = true;
    });
    showPanel("reset");
    resetEmail.focus();
  }
  if (passwordToggle) {
    const input = document.getElementById(passwordToggle.dataset.passwordToggle);
    if (!input) return;
    const showPassword = input.type === "password";
    input.type = showPassword ? "text" : "password";
    passwordToggle.setAttribute("aria-label", showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu");
    passwordToggle.setAttribute("aria-pressed", String(showPassword));
  }
});

const setMessage = (id, text, success = false) => {
  const message = document.querySelector(`#${id}`);
  message.textContent = text;
  message.classList.toggle("success", success);
};

const CURRENT_USER_KEYS = ["studysphere_current_user", "studysphere_session", "studysphere_user_session"];
const LOCAL_PASSWORD_RESET_EMAILS_KEY = "studysphere_local_password_reset_emails";
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
const hasLocalPasswordReset = (email) => {
  const resetEmails = JSON.parse(localStorage.getItem(LOCAL_PASSWORD_RESET_EMAILS_KEY) || "[]");
  return Array.isArray(resetEmails) && resetEmails.includes(email);
};
const rememberLocalPasswordReset = (email) => {
  const resetEmails = JSON.parse(localStorage.getItem(LOCAL_PASSWORD_RESET_EMAILS_KEY) || "[]");
  if (!Array.isArray(resetEmails)) throw new Error("Không thể đọc trạng thái đặt lại mật khẩu.");
  if (!resetEmails.includes(email)) resetEmails.push(email);
  localStorage.setItem(LOCAL_PASSWORD_RESET_EMAILS_KEY, JSON.stringify(resetEmails));
};
const readLocalMap = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
};
const userStatusKey = "studysphere_user_status";
const userMetadataKey = "studysphere_user_metadata";

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
  if (payload.action === "login" && payload.email !== defaultAdmin.email) {
    const localUser = getLocalUsers().find((user) => user.email === payload.email);
    const userStatuses = readLocalMap(userStatusKey);
    if (localUser && userStatuses[localUser.id || localUser.email] === "locked") {
      throw new Error("Tài khoản này đang bị khóa. Vui lòng liên hệ quản trị viên.");
    }
    if (hasLocalPasswordReset(payload.email)) {
      if (!localUser || localUser.password !== payload.password) throw new Error("Email hoặc mật khẩu không đúng.");
      return { success: true, user: normalizeUser(localUser) };
    }
  }

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
    const userMetadata = readLocalMap(userMetadataKey);
    userMetadata[user.id] = { createdAt: new Date().toISOString() };
    localStorage.setItem(userMetadataKey, JSON.stringify(userMetadata));
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
  const confirmPassword = data.get("confirmPassword");
  const nameInput = registerForm.elements.namedItem("name");
  const emailInput = registerForm.elements.namedItem("email");
  const passwordInput = registerForm.elements.namedItem("password");
  const confirmInput = registerForm.elements.namedItem("confirmPassword");
  const validation = [
    { input: nameInput, errorId: "register-name-error", message: name ? "" : "Vui lòng nhập họ tên." },
    { input: emailInput, errorId: "register-email-error", message: !email ? "Vui lòng nhập email." : emailInput.validity.typeMismatch ? "Vui lòng nhập email hợp lệ." : "" },
    { input: passwordInput, errorId: "register-password-error", message: !password ? "Vui lòng nhập mật khẩu." : password.length < 6 ? "Mật khẩu cần ít nhất 6 ký tự." : "" },
    { input: confirmInput, errorId: "register-confirm-password-error", message: !confirmPassword ? "Vui lòng xác nhận mật khẩu." : confirmPassword !== password ? "Mật khẩu xác nhận không khớp." : "" },
  ];
  let hasError = false;
  validation.forEach(({ input, errorId, message }) => {
    const error = document.querySelector(`#${errorId}`);
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
    input.setAttribute("aria-invalid", String(Boolean(message)));
    hasError ||= Boolean(message);
  });
  if (hasError) return;

  try {
    const result = await submitAuth({ action: "register", name, email, password });
    writeStoredUser(result.user);
    sessionStorage.setItem(AUTH_NOTICE_KEY, "register");
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
  const passwordInput = loginForm.elements.namedItem("password");
  const passwordError = document.querySelector("#login-password-error");
  const passwordMessage = password ? "" : "Vui lòng nhập mật khẩu.";
  if (passwordError) {
    passwordError.textContent = passwordMessage;
    passwordError.hidden = !passwordMessage;
  }
  passwordInput.setAttribute("aria-invalid", String(Boolean(passwordMessage)));
  if (passwordMessage) return;
  try {
    const result = await submitAuth({ action: "login", email, password });
    writeStoredUser(result.user);
    sessionStorage.setItem(AUTH_NOTICE_KEY, "login");
    const returnPaths = {
      admin: "admin-dashboard.html#overview",
      "admin-users": "admin-users.html",
      "admin-dashboard": "admin-dashboard.html#overview",
      "admin-feedback": "admin-feedback.html",
      home: "/backup/index.html",
    };
    const defaultPath = result.user.role === "admin" ? "admin-dashboard.html" : "/backup/index.html";
    window.location.href = returnPaths[returnTarget] || defaultPath;
  } catch (error) {
    setMessage("login-message", error.message);
  }
});

const resetForm = document.querySelector("#reset-form");
resetForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const emailInput = resetForm.elements.namedItem("email");
  const passwordInput = resetForm.elements.namedItem("password");
  const confirmInput = resetForm.elements.namedItem("confirmPassword");
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirmPassword = confirmInput.value;
  const validation = [
    {
      input: emailInput,
      errorId: "reset-email-error",
      message: !email ? "Vui lòng nhập email tài khoản." : emailInput.validity.typeMismatch ? "Email chưa đúng định dạng." : "",
    },
    {
      input: passwordInput,
      errorId: "reset-password-error",
      message: !password ? "Vui lòng nhập mật khẩu mới." : password.length < 6 ? "Mật khẩu cần ít nhất 6 ký tự." : "",
    },
    {
      input: confirmInput,
      errorId: "reset-confirm-password-error",
      message: !confirmPassword ? "Vui lòng xác nhận mật khẩu mới." : confirmPassword !== password ? "Mật khẩu xác nhận không khớp." : "",
    },
  ];
  let firstInvalid = null;
  validation.forEach(({ input, errorId, message }) => {
    const error = document.querySelector(`#${errorId}`);
    error.textContent = message;
    error.hidden = !message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    if (message && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  try {
    const users = getLocalUsers();
    const { updatedUsers } = resetLocalPassword(users, email, password);
    setLocalUsers(updatedUsers);
    rememberLocalPasswordReset(email);

    const currentUser = readStoredUser();
    if (currentUser?.email?.trim().toLowerCase() === email) {
      CURRENT_USER_KEYS.forEach((key) => localStorage.removeItem(key));
    }

    resetForm.reset();
    document.querySelector('#login-form [name="email"]').value = email;
    setMessage("reset-message", "");
    showPanel("login");
    setMessage("login-message", "Mật khẩu đã được đổi trên trình duyệt này. Hãy đăng nhập bằng mật khẩu mới.", true);
    document.querySelector('#login-form [name="password"]').focus();
  } catch (error) {
    setMessage("reset-message", error.message);
  }
});

resetForm?.addEventListener("input", (event) => {
  const input = event.target;
  const errorId = input.getAttribute("aria-describedby");
  if (!errorId) return;
  const error = document.getElementById(errorId);
  if (error) {
    error.textContent = "";
    error.hidden = true;
  }
  input.setAttribute("aria-invalid", "false");
});
