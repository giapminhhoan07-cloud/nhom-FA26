const profileForm = document.querySelector("#profile-form");

const PROFILE_CURRENT_USER_KEYS = ["studysphere_current_user", "studysphere_session", "studysphere_user_session"];
function readUser() {
  for (const key of PROFILE_CURRENT_USER_KEYS) {
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
}

const user = readUser();
if (!user) {
  window.location.replace("auth.html");
} else {
  const profileKey = `studysphere_profile_${user.id || user.email}`;
  let storedProfile = {};
  try {
    storedProfile = JSON.parse(localStorage.getItem(profileKey) || "{}") || {};
  } catch {
    storedProfile = {};
  }
  const name = storedProfile.name || user.name || "Tài khoản";
  const initial = name.charAt(0).toUpperCase();

  document.querySelector("#profile-avatar").textContent = initial;
  document.querySelector("#summary-avatar").textContent = initial;
  document.querySelector("#summary-name").textContent = name;
  document.querySelector("#summary-email").textContent = user.email || "";
  document.querySelector("#profile-name").value = name;
  document.querySelector("#profile-email").value = user.email || "";
  document.querySelector("#profile-goal").value = storedProfile.goal || "daily";
  document.querySelector("#profile-bio").value = storedProfile.bio || "";
  document.querySelector("#profile-reminder").checked = storedProfile.reminder !== false;

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(profileForm);
    const nextName = data.get("name").trim();
    const message = document.querySelector("#profile-message");
    if (!nextName) {
      message.textContent = "Vui lòng nhập tên hiển thị.";
      message.classList.remove("success");
      return;
    }

    const updatedProfile = { name: nextName, goal: data.get("goal"), bio: data.get("bio").trim(), reminder: data.get("reminder") === "on" };
    localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
    const nextUser = { ...user, name: nextName };
    PROFILE_CURRENT_USER_KEYS.forEach((key) => localStorage.setItem(key, JSON.stringify(nextUser)));
    try {
      const users = JSON.parse(localStorage.getItem("studysphere_users") || "[]");
      if (Array.isArray(users)) {
        const updatedUsers = users.map((storedUser) => {
          const matchesId = user.id && storedUser.id === user.id;
          const matchesEmail = user.email && storedUser.email === user.email;
          return matchesId || matchesEmail ? { ...storedUser, name: nextName } : storedUser;
        });
        localStorage.setItem("studysphere_users", JSON.stringify(updatedUsers));
      }
    } catch {
      message.textContent = "Đã lưu hồ sơ, nhưng không thể đồng bộ tên vào danh sách quản trị.";
      message.classList.remove("success");
      return;
    }
    document.querySelector("#summary-name").textContent = nextName;
    document.querySelector("#profile-avatar").textContent = nextName.charAt(0).toUpperCase();
    document.querySelector("#summary-avatar").textContent = nextName.charAt(0).toUpperCase();
    message.textContent = "Đã lưu thay đổi hồ sơ.";
    message.classList.add("success");
  });
}