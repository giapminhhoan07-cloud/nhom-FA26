const profileForm = document.querySelector("#profile-form");

const CURRENT_USER_KEYS = ["studysphere_current_user", "studysphere_session", "studysphere_user_session"];
function readUser() {
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
}

const user = readUser();
if (!user) {
  window.location.replace("auth.html");
} else {
  const profileKey = `studysphere_profile_${user.id || user.email}`;
  const storedProfile = JSON.parse(localStorage.getItem(profileKey) || "{}");
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
    CURRENT_USER_KEYS.forEach((key) => localStorage.setItem(key, JSON.stringify(nextUser)));
    document.querySelector("#summary-name").textContent = nextName;
    document.querySelector("#profile-avatar").textContent = nextName.charAt(0).toUpperCase();
    document.querySelector("#summary-avatar").textContent = nextName.charAt(0).toUpperCase();
    message.textContent = "Đã lưu thay đổi hồ sơ.";
    message.classList.add("success");
  });
}