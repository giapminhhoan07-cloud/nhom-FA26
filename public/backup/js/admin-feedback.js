import { createNotifications } from "./notifications.js";
import { apiClient } from "./apiClient.js";

let apiFeedback = [];

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
  const merged = new Map((Array.isArray(feedback) ? feedback : []).map((item) => [String(item.id || item.attemptId), item]));
  apiFeedback.forEach((item) => merged.set(String(item.id || item.attemptId), item));
  return [...merged.values()];
};

const formatDate = (value) => {
  if (!value) return "Chưa rõ";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa rõ";
  return date.toLocaleString("vi-VN");
};

const hasResolvedReply = (item) => {
  const reply = item && (item.adminReply ?? item.reply ?? "");
  const hasReply = typeof reply === "string" ? reply.trim().length > 0 : Boolean(reply);
  return hasReply || item?.status === "processed" || item?.status === "resolved";
};

const getNormalizedStatus = (item) => {
  if (hasResolvedReply(item)) return "processed";
  if (item?.status === "processing" || item?.status === "reviewing") return "processing";
  return "new";
};

const getStatusLabel = (status, item) => {
  if (hasResolvedReply(item) || status === "processed" || status === "resolved") return "Đã xử lý";
  if (status === "processing" || status === "reviewing") return "Đang xử lý";
  return "Chưa xử lý";
};

const getStatusClass = (status, item) => {
  if (hasResolvedReply(item) || status === "processed" || status === "resolved") return "success";
  if (status === "processing" || status === "reviewing") return "warning";
  return "neutral";
};

function renderSummary() {
  const feedback = getFeedback();
  const resolvedCount = feedback.filter((item) => hasResolvedReply(item)).length;
  const pendingCount = feedback.length - resolvedCount;
  const ratedFeedback = feedback.filter((item) => Number(item.rating) > 0);
  const averageRating = ratedFeedback.length
    ? (ratedFeedback.reduce((sum, item) => sum + Number(item.rating), 0) / ratedFeedback.length).toFixed(1)
    : "Chưa có";
  const cards = [
    { label: "Tổng phản hồi", value: feedback.length, note: "Đã ghi nhận trên trình duyệt này" },
    { label: "Chưa xử lý", value: pendingCount, note: "Cần trả lời người dùng" },
    { label: "Đã xử lý", value: resolvedCount, note: "Đã phản hồi" },
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
    const itemStatus = getNormalizedStatus(item);
    const matchesQuery = !search || `${item.userName || ""} ${item.email || ""} ${item.comment || ""} ${item.type || ""}`.toLowerCase().includes(search);
    const matchesStatus = status === "all" || itemStatus === status;
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
    const currentStatus = getNormalizedStatus(item);
    const details = [
      item.email ? `<a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a>` : "",
      item.rating ? `${escapeHtml(item.rating)}/5 sao` : "",
      escapeHtml(formatDate(item.submittedAt)),
    ].filter(Boolean).join(" · ");
    const replyText = item.adminReply || item.reply || "";
    const replyMarkup = replyText
      ? `<div class="feedback-reply-preview"><strong>Phản hồi đã gửi:</strong><p>${escapeHtml(replyText)}</p></div>`
      : `
        <div class="feedback-reply-form">
          <textarea class="feedback-reply-input" data-id="${escapeHtml(itemId)}" rows="3" placeholder="Nhập câu trả lời cho người dùng..."></textarea>
          <button class="reply-feedback" type="button" data-id="${escapeHtml(itemId)}">Gửi trả lời</button>
        </div>
      `;

    return `
      <article class="admin-exam-item">
        <div>
          <span>${escapeHtml(item.type || "Góp ý")}</span>
          <h3>${escapeHtml(item.userName || "Người dùng")}</h3>
          <p>${escapeHtml(item.comment || "")}</p>
          <small>${details}</small>
          ${replyMarkup}
        </div>
        <div class="admin-item-actions">
          <span class="admin-badge ${getStatusClass(currentStatus, item)}">${getStatusLabel(currentStatus, item)}</span>
        </div>
      </article>
    `;
  }).join("");
}

async function submitReply(id, rawReply) {
  const trimmedReply = String(rawReply ?? "").trim();
  if (!trimmedReply) {
    document.querySelector("#feedback-message").textContent = "Vui lòng nhập câu trả lời trước khi gửi.";
    document.querySelector("#feedback-message").classList.remove("success");
    return;
  }

  try {
    const feedback = getFeedback();
    const matchedItem = feedback.find((item) => String(item.id || item.attemptId) === String(id));
    if (!matchedItem) {
      document.querySelector("#feedback-message").textContent = "Không tìm thấy phản hồi cần trả lời. Vui lòng tải lại trang.";
      document.querySelector("#feedback-message").classList.remove("success");
      return;
    }
    const updated = feedback.map((item) => {
      const itemId = item.id || item.attemptId;
      return String(itemId) === String(id)
        ? { ...item, adminReply: trimmedReply, reply: trimmedReply, status: "processed", answeredAt: new Date().toISOString() }
        : item;
    });
    localStorage.setItem("studysphere_feedback", JSON.stringify(updated));
    let apiSynced = true;
    const updatedItem = updated.find((item) => String(item.id || item.attemptId) === String(id));
    if (apiFeedback.some((item) => String(item.id || item.attemptId) === String(id))) {
      try {
        await apiClient.update("feedback", id, updatedItem);
        apiFeedback = apiFeedback.map((item) => String(item.id || item.attemptId) === String(id) ? updatedItem : item);
      } catch {
        apiSynced = false;
      }
    }
    let notificationMessage = "";
    try {
      const notificationCount = createNotifications(
        [{ email: matchedItem.email, id: matchedItem.userId }],
        {
          type: "admin-reply",
          title: "Quản trị viên đã trả lời",
          message: trimmedReply,
          link: "/backup/pages/contact.html",
        },
      );
      notificationMessage = notificationCount
        ? "Đã gửi phản hồi và thông báo cho người dùng."
        : "Đã lưu phản hồi nhưng không thể gửi thông báo do phản hồi chưa có email hoặc tài khoản người nhận.";
      document.querySelector("#feedback-message").classList.toggle("success", notificationCount > 0);
    } catch (error) {
      notificationMessage = `Đã lưu phản hồi nhưng không thể lưu thông báo: ${error.message}`;
      document.querySelector("#feedback-message").classList.remove("success");
    }
    document.querySelector("#feedback-message").textContent = apiSynced
      ? notificationMessage
      : `${notificationMessage} JSON-server chưa đồng bộ thay đổi này.`;
    renderSummary();
    renderList();
  } catch {
    document.querySelector("#feedback-message").textContent = "Không thể lưu phản hồi trong bộ nhớ trình duyệt.";
    document.querySelector("#feedback-message").classList.remove("success");
  }
}

document.querySelector("#feedback-search").addEventListener("input", renderList);
document.querySelector("#feedback-status-filter").addEventListener("change", renderList);
document.querySelector("#feedback-rating-filter").addEventListener("change", renderList);

document.querySelector("#feedback-list").addEventListener("click", (event) => {
  const button = event.target.closest(".reply-feedback");
  if (!button) return;
  const form = button.closest(".feedback-reply-form");
  const textarea = form ? form.querySelector(".feedback-reply-input") : null;
  submitReply(button.dataset.id, textarea ? textarea.value : "");
});

document.querySelector("#feedback-list").addEventListener("keydown", (event) => {
  if (event.target.matches(".feedback-reply-input") && event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    submitReply(event.target.dataset.id, event.target.value);
  }
});

renderSummary();
renderList();

async function loadApiFeedback() {
  const status = document.querySelector("#feedback-api-status");
  try {
    const records = await apiClient.list("feedback");
    apiFeedback = Array.isArray(records) ? records : [];
    if (status) status.textContent = `Đã tải ${apiFeedback.length} phản hồi từ JSON-server.`;
  } catch (error) {
    if (status) status.textContent = `${error.message} Đang hiển thị phản hồi lưu trên thiết bị.`;
  }
  renderSummary();
  renderList();
}

loadApiFeedback();
