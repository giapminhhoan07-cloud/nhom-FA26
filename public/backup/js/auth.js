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

const isAdminUser = (user) => Boolean(
  user && (
    user.role === "admin" ||
    user.is_admin === true ||
    user.isAdmin === true ||
    Number(user.is_admin) === 1 ||
    (typeof user.email === "string" && user.email.toLowerCase() === defaultAdmin.email)
  )
);

const normalizeUser = (user = {}) => {
  const normalized = { ...user };
  const adminFlag = isAdminUser(normalized);
  normalized.role = adminFlag ? "admin" : (normalized.role || "user");
  normalized.is_admin = adminFlag || Boolean(normalized.is_admin);
  normalized.isAdmin = normalized.is_admin;
  return normalized;
};

const getLocalUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem("studysphere_users") || "[]");
    const hasAdmin = users.some((user) => user.role === "admin" || user.is_admin === true || user.isAdmin === true || Number(user.is_admin) === 1 || (typeof user.email === "string" && user.email.toLowerCase() === "admin@studysphere.local"));
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
      if (payload.action === "login" && payload.email === defaultAdmin.email) {
        const adminUser = normalizeUser(defaultAdmin);
        return { ...result, user: adminUser };
      }
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
registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = new FormData(registerForm);
  const name = data.get("name").trim();
  const email = data.get("email").trim().toLowerCase();
  const password = data.get("password");
  try {
    const result = await submitAuth({ action: "register", name, email, password });
    const normalizedUser = normalizeUser(result.user);
    localStorage.setItem("studysphere_current_user", JSON.stringify({ ...normalizedUser, is_admin: normalizedUser.role === "admin", isAdmin: normalizedUser.role === "admin" }));
    window.location.href = "/";
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
  try {
    const result = await submitAuth({ action: "login", email, password });
    const normalizedUser = normalizeUser(result.user);
    localStorage.setItem("studysphere_current_user", JSON.stringify({ ...normalizedUser, is_admin: normalizedUser.role === "admin", isAdmin: normalizedUser.role === "admin" }));
    window.location.href = returnTarget === "admin" ? "admin.html" : "/";
  } catch (error) {
    setMessage("login-message", error.message);
  }
});
