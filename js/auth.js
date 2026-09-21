const tabs = document.querySelectorAll("[data-auth-tab]");
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

const getUsers = () => {
  try { return JSON.parse(localStorage.getItem("studysphere_users") || "[]"); } catch { return []; }
};
const setMessage = (id, text, success = false) => {
  const message = document.querySelector(`#${id}`);
  message.textContent = text;
  message.classList.toggle("success", success);
};

const registerForm = document.querySelector("#register-form");
registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(registerForm);
  const name = data.get("name").trim();
  const email = data.get("email").trim().toLowerCase();
  const password = data.get("password");
  const users = getUsers();

  if (users.some((user) => user.email === email)) {
    setMessage("register-message", "Email này đã được đăng ký.");
    return;
  }
  users.push({ name, email, password });
  localStorage.setItem("studysphere_users", JSON.stringify(users));
  localStorage.setItem("studysphere_current_user", JSON.stringify({ name, email }));
  window.location.href = "../index.html";
});

const loginForm = document.querySelector("#login-form");
loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(loginForm);
  const email = data.get("email").trim().toLowerCase();
  const password = data.get("password");
  const user = getUsers().find((item) => item.email === email && item.password === password);

  if (!user) {
    setMessage("login-message", "Email hoặc mật khẩu chưa chính xác.");
    return;
  }
  localStorage.setItem("studysphere_current_user", JSON.stringify({ name: user.name, email: user.email }));
  window.location.href = "../index.html";
});
