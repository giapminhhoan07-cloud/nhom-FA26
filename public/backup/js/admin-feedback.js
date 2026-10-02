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

const getFeedback = () => {
  const feedback = readJson("studysphere_feedback", []);
  return Array.isArray(feedback) ? feedback : [];
};

const formatDate = (value) => {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa rõ";
  return date.toLocaleString("vi-VN");
};

const getStatusLabel = (status) => {
  if (status === "processed") return "Đã xử lý";
  if (status === "processing") return "Đang xử lý";
  return "Mới";
};

const getStatusClass = (status) => {
  if (status === "processed") return "success";
  if (status === "processing") return "warning";
  return "neutral";
};

function renderSummary() {
  const feedback = getFeedback();
  const total = feedback.length;
  const newItems = feedback.filter((item) => (item.status || "new") === "new").length;
  const processed = feedback.filter((item) => (item.status || "new") === "processed").length;
  const avgRating = feedback.length ? (feedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) / feedback.length).toFixed(1) : "0.0";

  const cards = [
    { label: "Tổng phản hồi", value: total },
    { label: "Phản hồi mới", value: newItems },
    { label: "Đã xử lý", value: processed },
    { label: "Điểm đánh giá TB", value: `${avgRating}/5` },
  ];

  document.querySelector("#admin-feedback-summary").innerHTML = cards.map(({ label, value }) => `
    <article class="admin-stat">
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${label === "Điểm đánh giá TB" ? "Từ phản hồi thực tế" : "Đã ghi nhận"}</small>
    </article>
  `).join("");
}

function renderList() {
  const table = document.querySelector("#admin-feedback-table");
  const search = document.querySelector("#feedback-search")?.value || "";
  const status = document.querySelector("#feedback-status-filter")?.value || "all";
  const items = getFeedback().filter((item) => {
    const matchesQuery = !search || `${item.userName || ""} ${item.comment || ""} ${item.type || ""}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = status === "all" || (item.status || "new") === status;
    return matchesQuery && matchesStatus;
  });

  if (!items.length) {
    table.innerHTML = '<tbody><tr><td colspan="6" class="admin-empty-cell">Không có phản hồi phù hợp với bộ lọc hiện tại.</td></tr></tbody>';
    return;
  }

  const listItems = [...items].sort((first, second) => new Date(second.submittedAt || 0) - new Date(first.submittedAt || 0));
  table.innerHTML = `
    <thead>
      <tr>
        <th>Người gửi</th>
        <th>Loại</th>
        <th>Nội dung</th>
        <th>Thời gian</th>
        <th>Trạng thái</th>
        <th>Thao tác</th>
      </tr>
    </thead>
    <tbody>
      ${listItems.map((item) => `
        <tr>
          <td>${escapeHtml(item.userName || "Người dùng")}</td>
          <td>${escapeHtml(item.type || "Góp ý")}</td>
          <td>${escapeHtml((item.comment || "").slice(0, 90))}${((item.comment || "").length > 90 ? "..." : "")}</td>
          <td>${escapeHtml(formatDate(item.submittedAt))}</td>
          <td><span class="admin-badge ${getStatusClass(item.status || "new")}">${getStatusLabel(item.status || "new")}</span></td>
          <td>
            <button class="status-toggle" type="button" data-status="${item.status || "new"}" data-id="${escapeHtml(item.attemptId || item.id || "")}">
              ${((item.status || "new") === "processed") ? "Đánh dấu mới" : ((item.status || "new") === "processing") ? "Đánh dấu đã xử lý" : "Đang xử lý"}
            </button>
          </td>
        </tr>
      `).join("")}
    </tbody>
  `;
}

function updateStatus(id, currentStatus) {
  const feedback = getFeedback();
  const nextStatus = currentStatus === "processed" ? "new" : currentStatus === "processing" ? "processed" : "processing";
  const updated = feedback.map((item) => {
    const itemId = item.attemptId || item.id;
    if (String(itemId) === String(id)) {
      return { ...item, status: nextStatus };
    }
    return item;
  });
  localStorage.setItem("studysphere_feedback", JSON.stringify(updated));
  renderSummary();
  renderList();
}

document.querySelector("#feedback-search")?.addEventListener("input", renderList);
document.querySelector("#feedback-status-filter")?.addEventListener("change", renderList);

document.body.addEventListener("click", (event) => {
  const button = event.target.closest(".status-toggle");
  if (!button) return;
  const status = button.dataset.status || "new";
  const id = button.dataset.id;
  updateStatus(id, status);
});

renderSummary();
renderList();
