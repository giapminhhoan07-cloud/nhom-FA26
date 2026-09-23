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

const submitAuth = async (payload) => {
  const response = await fetch("../api/auth.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Không thể xử lý yêu cầu.");
  return result;
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
  try {
    const result = await submitAuth({ action: "login", email, password });
    localStorage.setItem("studysphere_current_user", JSON.stringify(result.user));
    window.location.href = returnTarget === "admin" ? "admin.html" : "../index.html";
  } catch (error) {
    setMessage("login-message", error.message);
  }
});
