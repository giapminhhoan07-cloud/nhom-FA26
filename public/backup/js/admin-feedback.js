const readJson = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
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
  if (status === "processed" || status === "resolved") return "Đã xử lý";
  if (status === "processing" || status === "reviewing") return "Đang xử lý";
  return "Mới";
};

const getStatusClass = (status) => {
  if (status === "processed" || status === "resolved") return "success";
  if (status === "processing" || status === "reviewing") return "warning";
  return "neutral";
};

const getStatusAction = (status) => {
  if (status === "processed" || status === "resolved") return "Đánh dấu mới";
  if (status === "processing" || status === "reviewing") return "Đánh dấu đã xử lý";
  return "Đang xử lý";
};

function renderSummary() {
  const feedback = getFeedback();
  const ratedFeedback = feedback.filter((item) => Number(item.rating) > 0);
  const averageRating = ratedFeedback.length
    ? (ratedFeedback.reduce((sum, item) => sum + Number(item.rating), 0) / ratedFeedback.length).toFixed(1)
    : "Chưa có";
  const cards = [
    { label: "Tổng phản hồi", value: feedback.length, note: "Đã ghi nhận trên trình duyệt này" },
    { label: "Phản hồi mới", value: feedback.filter((item) => !item.status || item.status === "new").length, note: "Chưa xử lý" },
    { label: "Đang xử lý", value: feedback.filter((item) => item.status === "processing" || item.status === "reviewing").length, note: "Đang xem xét" },
    { label: "Điểm đánh giá TB", value: ratedFeedback.length ? `${averageRating}/5` : averageRating, note: `Từ ${ratedFeedback.length} đánh giá` },
  ];

  document.querySelector("#feedback-summary").innerHTML = cards.map(({ label, value, note }) => `
    <article class="admin-stat">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(note)}</small>
    </article>
  `).join("");
}

function renderList() {
  const list = document.querySelector("#feedback-list");
  const search = document.querySelector("#feedback-search").value.trim().toLowerCase();
  const status = document.querySelector("#feedback-status-filter").value;
  const rating = document.querySelector("#feedback-rating-filter").value;
  const items = getFeedback().filter((item) => {
    const matchesQuery = !search || `${item.userName || ""} ${item.email || ""} ${item.comment || ""} ${item.type || ""}`.toLowerCase().includes(search);
    const matchesStatus = status === "all" || (item.status || "new") === status;
    const matchesRating = rating === "all" || String(item.rating || "") === rating;
    return matchesQuery && matchesStatus && matchesRating;
  });

  if (!items.length) {
    list.innerHTML = '<p class="admin-empty">Không có phản hồi phù hợp với bộ lọc hiện tại.</p>';
    return;
  }

  const sortedItems = [...items].sort((first, second) => new Date(second.submittedAt || 0) - new Date(first.submittedAt || 0));
  list.innerHTML = sortedItems.map((item) => {
    const itemId = item.id || item.attemptId;
    const currentStatus = item.status || "new";
    const details = [
      item.email ? `<a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a>` : "",
      item.rating ? `${escapeHtml(item.rating)}/5 sao` : "",
      escapeHtml(formatDate(item.submittedAt)),
    ].filter(Boolean).join(" · ");

    return `
      <article class="admin-exam-item">
        <div>
          <span>${escapeHtml(item.type || "Góp ý")}</span>
          <h3>${escapeHtml(item.userName || "Người dùng")}</h3>
          <p>${escapeHtml(item.comment || "")}</p>
          <small>${details}</small>
        </div>
        <div class="admin-item-actions">
          <span class="admin-badge ${getStatusClass(currentStatus)}">${getStatusLabel(currentStatus)}</span>
          ${itemId ? `<button class="status-toggle" type="button" data-status="${escapeHtml(currentStatus)}" data-id="${escapeHtml(itemId)}">${getStatusAction(currentStatus)}</button>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function updateStatus(id, currentStatus) {
  try {
    const feedback = getFeedback();
    const nextStatus = currentStatus === "processed" || currentStatus === "resolved"
      ? "new"
      : currentStatus === "processing" || currentStatus === "reviewing"
        ? "processed"
        : "processing";
    const updated = feedback.map((item) => {
      const itemId = item.id || item.attemptId;
      return String(itemId) === String(id) ? { ...item, status: nextStatus } : item;
    });
    localStorage.setItem("studysphere_feedback", JSON.stringify(updated));
    document.querySelector("#feedback-message").textContent = "";
    renderSummary();
    renderList();
  } catch {
    document.querySelector("#feedback-message").textContent = "Không thể cập nhật trạng thái trong bộ nhớ trình duyệt.";
  }
}

document.querySelector("#feedback-search").addEventListener("input", renderList);
document.querySelector("#feedback-status-filter").addEventListener("change", renderList);
document.querySelector("#feedback-rating-filter").addEventListener("change", renderList);

document.querySelector("#feedback-list").addEventListener("click", (event) => {
  const button = event.target.closest(".status-toggle");
  if (!button) return;
  updateStatus(button.dataset.id, button.dataset.status || "new");
});

renderSummary();
renderList();
