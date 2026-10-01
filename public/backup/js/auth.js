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
  const passwordToggle = event.target.closest("[data-password-toggle]");
  if (tab) switchTab(tab.dataset.authTab);
  if (switchButton) switchTab(switchButton.dataset.switchTab);
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
registerForm.addEventListener("submit", async (event) => {
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
    error.textContent = message;
    error.hidden = !message;
    input.setAttribute("aria-invalid", String(Boolean(message)));
    hasError ||= Boolean(message);
  });
  if (hasError) return;

  try {
    const result = await submitAuth({ action: "register", name, email, password });
    localStorage.setItem("studysphere_current_user", JSON.stringify(result.user));
    window.location.href = "../index.html";
  } catch (error) {
    setMessage("register-message", error.message);
  }
});

const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = data.get("email").trim().toLowerCase();
  const password = data.get("password");
  const passwordInput = loginForm.elements.namedItem("password");
  const passwordError = document.querySelector("#login-password-error");
  const passwordMessage = password ? "" : "Vui lòng nhập mật khẩu.";
  passwordError.textContent = passwordMessage;
  passwordError.hidden = !passwordMessage;
  passwordInput.setAttribute("aria-invalid", String(Boolean(passwordMessage)));
  if (passwordMessage) return;
  try {
    const result = await submitAuth({ action: "login", email, password });
    localStorage.setItem("studysphere_current_user", JSON.stringify(result.user));
  const returnPaths = { admin: "admin.html#overview", "admin-users": "admin-users.html", home: "../index.html" };
  window.location.href = returnPaths[returnTarget] || "../index.html";
  } catch (error) {
    setMessage("login-message", error.message);
  }
});
