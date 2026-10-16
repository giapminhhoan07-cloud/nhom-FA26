import { apiClient } from "./apiClient.js";
import { getCurrentUser } from "./userData.js";
import { buildLeaderboard } from "./leaderboard.js";

const status = document.querySelector("#leaderboard-status");
const entries = document.querySelector("#leaderboard-list");
const podium = document.querySelector("#leaderboard-podium");
const yourRank = document.querySelector("#leaderboard-your-rank");
const count = document.querySelector("#leaderboard-count");
const periodButtons = document.querySelectorAll("[data-ranking-period]");
const currentUser = getCurrentUser();
let users = [];
let attempts = [];
let selectedPeriod = "week";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function renderLeaderboard() {
  const ranking = buildLeaderboard(users, attempts, selectedPeriod);
  const currentUserId = String(currentUser?.id || currentUser?.email || "");
  const isSharedUser = users.some((user) => String(user.id || user.email || "") === currentUserId);
  const currentRank = ranking.findIndex((entry) => entry.id === currentUserId);

  count.textContent = `${ranking.length} học sinh`;
  yourRank.textContent = currentRank >= 0
    ? `Bạn đang ở hạng ${currentRank + 1} với ${ranking[currentRank].xp} XP.`
    : currentUser?.role === "admin"
      ? "Bảng xếp hạng này dành cho học sinh."
      : currentUser && !isSharedUser
        ? "Tài khoản của bạn chưa được đồng bộ với dữ liệu dùng chung nên chưa thể xếp hạng."
        : currentUser
      ? "Hoàn thành một bài luyện tập để góp mặt trên bảng xếp hạng."
      : "Đăng nhập và hoàn thành bài luyện tập để theo dõi thứ hạng của bạn.";

  if (!ranking.length) {
    podium.innerHTML = "";
    entries.innerHTML = `<div class="leaderboard-empty"><strong>Chưa có thứ hạng để hiển thị</strong><p>${selectedPeriod === "week" ? "Hãy bắt đầu luyện tập trong 7 ngày qua để cùng bạn bè tạo nên bảng xếp hạng." : "Hoàn thành bài luyện tập để ghi dấu XP đầu tiên."}</p><a class="button button-primary" href="../tests/index.html">Bắt đầu luyện tập <span aria-hidden="true">→</span></a></div>`;
    return;
  }

  const medals = ["🥇", "🥈", "🥉"];
  podium.innerHTML = ranking.slice(0, 3).map((entry, index) => ({ entry, rank: index + 1 }))
    .map(({ entry, rank }) => `
    <article class="leaderboard-podium-card is-rank-${rank}${entry.id === currentUserId ? " is-you" : ""}">
      <span class="leaderboard-medal" aria-hidden="true">${medals[rank - 1]}</span>
      <span class="leaderboard-avatar" aria-hidden="true">${escapeHtml(entry.name.trim().charAt(0).toLocaleUpperCase("vi") || "H")}</span>
      <strong class="leaderboard-podium-name">${escapeHtml(entry.id === currentUserId ? "Bạn" : entry.name)}</strong>
      <span class="leaderboard-podium-points">${entry.xp} XP</span>
      <small>Cấp ${entry.level}</small>
    </article>
  `).join("");

  entries.innerHTML = ranking.slice(3, 10).map((entry, index) => `
    <article class="leaderboard-row${entry.id === currentUserId ? " is-you" : ""}">
      <span class="leaderboard-position">${index + 4}</span>
      <span class="leaderboard-avatar" aria-hidden="true">${escapeHtml(entry.name.trim().charAt(0).toLocaleUpperCase("vi") || "H")}</span>
      <span class="leaderboard-student"><strong>${escapeHtml(entry.id === currentUserId ? "Bạn" : entry.name)}</strong><small>Cấp ${entry.level}</small></span>
      <strong class="leaderboard-row-points">${entry.xp} <small>XP</small></strong>
    </article>
  `).join("");
}

periodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    selectedPeriod = button.dataset.rankingPeriod;
    periodButtons.forEach((item) => {
      const selected = item === button;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    renderLeaderboard();
  });
});

async function loadLeaderboard() {
  try {
    const [remoteUsers, remoteAttempts] = await Promise.all([
      apiClient.list("users"),
      apiClient.list("attempts"),
    ]);
    users = Array.isArray(remoteUsers) ? remoteUsers : [];
    attempts = Array.isArray(remoteAttempts) ? remoteAttempts : [];
    status.textContent = "XP được cộng khi hoàn thành bài luyện tập. Tuần này tính trong 7 ngày gần nhất.";
    renderLeaderboard();
  } catch (error) {
    status.textContent = `${error.message} Bảng xếp hạng cần kết nối dữ liệu dùng chung và không thể tải khi ngoại tuyến.`;
    count.textContent = "Chưa tải được";
    podium.innerHTML = "";
    entries.innerHTML = "";
    yourRank.textContent = "";
  }
}

loadLeaderboard();
