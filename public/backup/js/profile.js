import { apiClient } from "./apiClient.js";
import { BADGE_DEFINITIONS, getLevelFromXp } from "./gamification.js";
import { getCurrentUser, readUserCollection, writeUserCollection } from "./userData.js";

const profileForm = document.querySelector("#profile-form");
const PROFILE_CURRENT_USER_KEYS = ["studysphere_current_user", "studysphere_session", "studysphere_user_session"];
const user = getCurrentUser();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function readGamification(userId) {
  try {
    return JSON.parse(localStorage.getItem(`studysphere_gamification_${encodeURIComponent(userId)}`) || "{}") || {};
  } catch {
    return {};
  }
}

function renderLearningChart(history) {
  const chart = document.querySelector("#learning-progress-chart");
  const attempts = [...history]
    .filter((item) => Number.isFinite(Number(item.score)) && Number(item.score) >= 0 && Number(item.score) <= 10)
    .sort((first, second) => new Date(first.submittedAt || first.submitted_at || 0) - new Date(second.submittedAt || second.submitted_at || 0))
    .slice(-10);

  if (!attempts.length) {
    chart.innerHTML = '<div class="learning-chart-empty"><strong>Chưa có dữ liệu điểm</strong><span>Hoàn thành bài thi đầu tiên để bắt đầu theo dõi tiến bộ.</span></div>';
    return;
  }

  const width = 680;
  const height = 230;
  const left = 42;
  const right = 16;
  const top = 15;
  const bottom = 38;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const points = attempts.map((attempt, index) => ({
    x: attempts.length === 1 ? left + plotWidth / 2 : left + index * plotWidth / (attempts.length - 1),
    y: top + plotHeight * (1 - Number(attempt.score) / 10),
    score: Number(attempt.score),
    date: new Date(attempt.submittedAt || attempt.submitted_at || 0),
  }));
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const grid = [0, 5, 10].map((score) => {
    const y = top + plotHeight * (1 - score / 10);
    return `<line class="learning-chart-grid" x1="${left}" y1="${y}" x2="${width - right}" y2="${y}"></line><text class="learning-chart-axis" x="${left - 10}" y="${y + 4}" text-anchor="end">${score}</text>`;
  }).join("");
  const markers = points.map((point) => {
    const date = Number.isNaN(point.date.getTime()) ? "Ngày chưa rõ" : point.date.toLocaleDateString("vi-VN");
    return `<circle class="learning-chart-point" cx="${point.x}" cy="${point.y}" r="5"><title>${date}: ${point.score}/10</title></circle>`;
  }).join("");
  const labels = points.filter((_, index) => attempts.length <= 5 || index === 0 || index === points.length - 1 || index % 2 === 0).map((point) => {
    const label = Number.isNaN(point.date.getTime()) ? "—" : point.date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    return `<text class="learning-chart-axis" x="${point.x}" y="${height - 10}" text-anchor="middle">${label}</text>`;
  }).join("");
  chart.innerHTML = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Biểu đồ điểm số qua ${attempts.length} lần làm bài">${grid}<polyline class="learning-chart-line" points="${line}"></polyline>${markers}${labels}</svg>${attempts.length < 2 ? '<p class="learning-chart-empty">Cần thêm một kết quả để thấy xu hướng điểm số.</p>' : ""}`;
}

function renderLearningDashboard(history, gamification, earnedBadges) {
  const stats = document.querySelector("#learning-stats");
  const scores = history.map((item) => Number(item.score)).filter((score) => Number.isFinite(score) && score >= 0 && score <= 10);
  const average = scores.length ? (scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(1) : "—";
  const xp = Math.max(0, Number(gamification.xp ?? user.xp) || 0);
  const level = getLevelFromXp(xp);
  const streak = Math.max(0, Number(gamification.streak ?? user.streak) || 0);
  const statItems = [
    ["Đề đã hoàn thành", history.length, "Kết quả đã nộp"],
    ["Điểm trung bình", average, scores.length ? "Trên thang điểm 10" : "Chưa có kết quả"],
    ["Kinh nghiệm · cấp độ", `${xp} XP`, `Cấp ${level}`],
    ["Chuỗi ngày học", streak, streak ? "Ngày liên tiếp" : "Bắt đầu từ hôm nay"],
  ];
  stats.innerHTML = statItems.map(([label, value, note]) => `<article class="learning-stat"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");

  renderLearningChart(history);
  const badgeList = document.querySelector("#learning-badges");
  const earned = new Set(earnedBadges);
  badgeList.innerHTML = BADGE_DEFINITIONS.map((badge) => `
    <article class="learning-badge ${earned.has(badge.id) ? "is-earned" : "is-locked"}">
      <span class="learning-badge-icon" aria-hidden="true">${earned.has(badge.id) ? "✓" : "◇"}</span>
      <span><strong>${escapeHtml(badge.name)}</strong><small>${escapeHtml(badge.description)}</small></span>
    </article>
  `).join("");

  const recentList = document.querySelector("#learning-recent-list");
  const recent = [...history].sort((first, second) => new Date(second.submittedAt || second.submitted_at || 0) - new Date(first.submittedAt || first.submitted_at || 0)).slice(0, 5);
  recentList.innerHTML = recent.length ? recent.map((attempt) => {
    const attemptId = attempt.attemptId || attempt.id;
    const submittedAt = new Date(attempt.submittedAt || attempt.submitted_at || 0);
    const date = Number.isNaN(submittedAt.getTime()) ? "Ngày chưa rõ" : submittedAt.toLocaleDateString("vi-VN");
    return `<a class="learning-recent-item" href="result.html?attempt=${encodeURIComponent(attemptId)}"><span><strong>${escapeHtml(attempt.examTitle || attempt.exam_title || "Bài làm")}</strong><small>${date}</small></span><span class="learning-recent-score">${Number(attempt.score || 0).toFixed(1)}</span></a>`;
  }).join("") : '<div class="learning-recent-empty"><strong>Chưa có bài thi gần đây</strong><span>Hoàn thành một đề để lưu kết quả tại đây.</span></div>';
}

async function loadLearningDashboard(currentUser) {
  const apiStatus = document.querySelector("#learning-api-status");
  let history = readUserCollection(currentUser, "history", "studysphere_history");
  const userId = String(currentUser.id || currentUser.email || "");
  if (currentUser.id && !String(currentUser.id).startsWith("local-")) {
    try {
      const [remoteHistory, remoteBadges] = await Promise.all([
        apiClient.list("attempts", { userId }),
        apiClient.list("userAchievements", { userId }),
      ]);
      const merged = new Map([...history, ...remoteHistory]
        .filter((attempt) => String(attempt.userId || userId) === userId)
        .map((attempt) => [String(attempt.attemptId || attempt.id), attempt]));
      history = [...merged.values()];
      writeUserCollection(currentUser, "history", history);
      const gamification = readGamification(userId);
      const badges = [...new Set([...(gamification.badges || []), ...remoteBadges.map((item) => item.achievementId)])];
      renderLearningDashboard(history, gamification, badges);
      apiStatus.textContent = `Đã đồng bộ dữ liệu học tập của ${currentUser.name || currentUser.email}.`;
      return;
    } catch (error) {
      apiStatus.textContent = `${error.message} Đang hiển thị dữ liệu đã lưu trên thiết bị.`;
    }
  }
  renderLearningDashboard(history, readGamification(userId), readGamification(userId).badges || []);
}

if (user) loadLearningDashboard(user);
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

  profileForm.addEventListener("submit", async (event) => {
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
    let apiSynced = true;
    if (user.id && !String(user.id).startsWith("local-")) {
      try {
        await apiClient.update("users", user.id, { name: nextName });
      } catch {
        apiSynced = false;
      }
    }
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
    message.textContent = apiSynced ? "Đã lưu thay đổi hồ sơ." : "Đã lưu trên thiết bị, nhưng chưa đồng bộ được với JSON-server.";
    message.classList.toggle("success", apiSynced);
  });
}