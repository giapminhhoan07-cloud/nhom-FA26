import { exams as seedExams } from "../data/exams.js";

const readJson = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const escapeHtml = (value) => String(value ?? "").replace(/[&<>\"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

const getCustomExams = () => {
  const custom = readJson("studysphere_custom_exams", []);
  return Array.isArray(custom) ? custom : [];
};

const getExamCatalog = () => {
  const merged = [...seedExams, ...getCustomExams()];
  const seen = new Map();
  merged.forEach((exam) => {
    if (exam && exam.id) seen.set(exam.id, exam);
  });
  return Array.from(seen.values());
};

const getFeedback = () => {
  const feedback = readJson("studysphere_feedback", []);
  return Array.isArray(feedback) ? feedback : [];
};

const getUsers = () => {
  const users = readJson("studysphere_users", []);
  return Array.isArray(users) ? users : [];
};

const getAttempts = () => {
  const attempts = readJson("studysphere_history", []);
  return Array.isArray(attempts) ? attempts : [];
};

const formatDate = (value) => {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa rõ";
  return date.toLocaleDateString("vi-VN");
};

const getPastDates = (count) => {
  const dates = [];
  const date = new Date();
  for (let index = count - 1; index >= 0; index -= 1) {
    const item = new Date(date);
    item.setDate(date.getDate() - index);
    dates.push(item);
  }
  return dates;
};

function renderStats() {
  const totalExams = getExamCatalog().length;
  const totalUsers = new Set(getUsers().map((user) => user.id || user.email)).size;
  const attempts = getAttempts();
  const feedback = getFeedback();
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayAttempts = attempts.filter((item) => {
    const submittedAt = item.submitted_at || item.submittedAt;
    if (!submittedAt) return false;
    const when = new Date(submittedAt);
    return !Number.isNaN(when.getTime()) && when >= startOfDay;
  }).length;
  const newFeedback = feedback.filter((item) => (item.status || "new") !== "processed").length;
  const stats = [
    { label: "Tổng số đề thi", value: totalExams, note: "Đề trong hệ thống" },
    { label: "Tổng số người dùng", value: totalUsers, note: "Tài khoản đã đăng ký" },
    { label: "Lượt thi", value: todayAttempts, note: "Trong ngày hôm nay" },
    { label: "Phản hồi người dùng", value: newFeedback, note: "Chưa xử lý" },
  ];

  const statGrid = document.querySelector("#admin-stat-grid");
  statGrid.innerHTML = stats.map(({ label, value, note }) => `
    <article class="admin-stat">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${note}</small>
    </article>
  `).join("");
}

function renderChart() {
  const chart = document.querySelector("#admin-activity-chart");
  const history = getAttempts();
  const users = getUsers();
  const days = getPastDates(7);

  if (!history.length && !users.length) {
    chart.innerHTML = '<div class="admin-empty">Chưa có dữ liệu lịch sử để hiển thị biểu đồ. Người dùng và lượt làm bài sẽ xuất hiện ở đây khi có dữ liệu thực tế.</div>';
    return;
  }

  const attemptsByDay = new Map(days.map((day) => [day.toISOString().slice(0, 10), 0]));
  const usersByDay = new Map(days.map((day) => [day.toISOString().slice(0, 10), 0]));

  history.forEach((item) => {
    const submittedAt = item.submitted_at || item.submittedAt;
    if (!submittedAt) return;
    const dateKey = new Date(submittedAt).toISOString().slice(0, 10);
    if (attemptsByDay.has(dateKey)) {
      attemptsByDay.set(dateKey, (attemptsByDay.get(dateKey) || 0) + 1);
    }
  });

  users.forEach((user) => {
    const createdAt = user.createdAt || user.created_at || user.created_at || user.registeredAt;
    if (!createdAt) return;
    const key = new Date(createdAt).toISOString().slice(0, 10);
    if (usersByDay.has(key)) {
      usersByDay.set(key, (usersByDay.get(key) || 0) + 1);
    }
  });

  const maxValue = Math.max(1, ...Array.from(attemptsByDay.values()), ...Array.from(usersByDay.values()));

  chart.innerHTML = `
    <div class="chart-legend">
      <span><i class="legend-dot attempts"></i> Lượt làm bài</span>
      <span><i class="legend-dot users"></i> Người dùng mới</span>
    </div>
    <div class="chart-bars" aria-label="Biểu đồ hoạt động 7 ngày gần nhất">
      ${days.map((day) => {
        const label = day.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        const attemptValue = attemptsByDay.get(day.toISOString().slice(0, 10)) || 0;
        const userValue = usersByDay.get(day.toISOString().slice(0, 10)) || 0;
        return `
          <div class="chart-column">
            <div class="chart-stack">
              <span class="chart-attempts" style="height: ${(attemptValue / maxValue) * 100}%"></span>
              <span class="chart-users" style="height: ${(userValue / maxValue) * 100}%"></span>
            </div>
            <small>${label}</small>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderFeaturedTable() {
  const table = document.querySelector("#admin-featured-table");
  const featured = getExamCatalog().filter((exam) => exam.featured).slice(0, 5);

  if (!featured.length) {
    table.innerHTML = '<tbody><tr><td colspan="5" class="admin-empty-cell">Chưa có đề thi nào được gắn là nổi bật.</td></tr></tbody>';
    return;
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th>Tên đề thi</th>
        <th>Môn</th>
        <th>Loại</th>
        <th>Lượt làm</th>
        <th>Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      ${featured.map((exam) => `
        <tr>
          <td>${escapeHtml(exam.title)}</td>
          <td>${escapeHtml(exam.subjectName || exam.subjectId)}</td>
          <td>${escapeHtml(exam.typeName || exam.type || "Đề thi")}</td>
          <td>${Number(exam.attemptCount || 0)}</td>
          <td><span class="admin-badge success">Nổi bật</span></td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

function renderRecentFeedback() {
  const table = document.querySelector("#admin-feedback-table");
  const feedback = [...getFeedback()].sort((first, second) => new Date(second.submittedAt || 0) - new Date(first.submittedAt || 0)).slice(0, 5);

  if (!feedback.length) {
    table.innerHTML = '<tbody><tr><td colspan="5" class="admin-empty-cell">Chưa có phản hồi nào được ghi nhận.</td></tr></tbody>';
    return;
  }

  table.innerHTML = `
    <thead>
      <tr>
        <th>Người gửi</th>
        <th>Loại</th>
        <th>Phản hồi</th>
        <th>Thời gian</th>
        <th>Trạng thái</th>
      </tr>
    </thead>
    <tbody>
      ${feedback.map((item) => {
        const status = item.status || "new";
        const statusLabel = status === "processed" ? "Đã xử lý" : status === "processing" ? "Đang xử lý" : "Mới";
        const statusClass = status === "processed" ? "success" : status === "processing" ? "warning" : "neutral";
        return `
          <tr>
            <td>${escapeHtml(item.userName || "Người dùng")}</td>
            <td>${escapeHtml(item.type || "Góp ý")}</td>
            <td>${escapeHtml((item.comment || "").slice(0, 45) + ((item.comment || "").length > 45 ? "..." : ""))}</td>
            <td>${escapeHtml(formatDate(item.submittedAt))}</td>
            <td><span class="admin-badge ${statusClass}">${statusLabel}</span></td>
          </tr>
        `;
      }).join("")}
    </tbody>
  `;
}

renderStats();
renderChart();
renderFeaturedTable();
renderRecentFeedback();
