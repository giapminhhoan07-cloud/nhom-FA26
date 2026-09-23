const profileForm = document.querySelector("#profile-form");

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("studysphere_current_user") || "null");
  } catch {
    return null;
  }
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
    localStorage.setItem("studysphere_current_user", JSON.stringify({ ...user, name: nextName }));
    document.querySelector("#summary-name").textContent = nextName;
    document.querySelector("#profile-avatar").textContent = nextName.charAt(0).toUpperCase();
    document.querySelector("#summary-avatar").textContent = nextName.charAt(0).toUpperCase();
    message.textContent = "Đã lưu thay đổi hồ sơ.";
    message.classList.add("success");
  });
}