import { apiClient } from "./apiClient.js";
import { getCurrentUser, readUserCollection, readUserData, writeUserCollection } from "./userData.js";
import { getStudyRecommendations } from "./studyRecommendations.js";

const list = document.querySelector("#history-list");
const count = document.querySelector("#history-count");
const search = document.querySelector("#history-search");
const status = document.querySelector("#history-status");
const apiStatus = document.querySelector("#history-api-status");
const recommendationStatus = document.querySelector("#study-recommendations-status");
const recommendationList = document.querySelector("#study-recommendation-list");
const currentUser = getCurrentUser();
let allHistory = [];

function readLocalData(key, fallback) {
	try {
		return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
	} catch {
		return fallback;
	}
}

function formatDate(value) {
	return new Date(value).toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function renderHistory(items) {
	const query = search.value.trim().toLowerCase();
	const filtered = items.filter((item) => {
		const passed = Number(item.score) >= 5;
		const examTitle = item.exam_title || item.examTitle || "";
		const matchesSearch = !query || examTitle.toLowerCase().includes(query);
		const matchesStatus = status.value === "all" || (status.value === "passed" ? passed : !passed);
		return matchesSearch && matchesStatus;
	});

	count.textContent = `${filtered.length} lần làm`;
	if (!filtered.length) {
		list.innerHTML = `<div class="empty-state"><strong>${items.length ? "Không tìm thấy kết quả phù hợp" : "Chưa có lịch sử làm bài"}</strong><p>${items.length ? "Hãy thử đổi từ khóa hoặc trạng thái lọc." : "Hoàn thành một đề để thấy kết quả ở đây."}</p>${items.length ? "" : '<a class="button button-primary" href="../tests/index.html">Chọn đề đầu tiên</a>'}</div>`;
		return;
	}

	list.innerHTML = filtered.map((item) => {
		const score = Number(item.score ?? 0);
		const correctCount = Number(item.correct_count ?? item.correctCount ?? 0);
		const totalQuestions = Number(item.total_questions ?? item.totalQuestions ?? 0);
		const attemptId = item.id || item.attemptId;
		const examTitle = item.exam_title || item.examTitle || "Bài làm";
		const submittedAt = item.submitted_at || item.submittedAt || new Date().toISOString();
		const passed = score >= 5;
		return `<article class="history-item ${passed ? "is-passed" : "is-failed"}">
			<div class="history-item-marker" aria-hidden="true">${passed ? "✓" : "!"}</div>
		<div class="history-item-main"><span class="history-subject">${passed ? "Tiếp tục phát huy" : "Cần luyện thêm"}</span><h3>${escapeHtml(examTitle)}</h3><p>${formatDate(submittedAt)} <span aria-hidden="true">·</span> ${correctCount}/${totalQuestions} câu đúng</p></div>
			<div class="history-score"><strong>${Number(score).toFixed(1)}</strong><span>/10 điểm</span></div>
			<span class="history-status ${passed ? "passed" : "failed"}">${passed ? "Đạt" : "Chưa đạt"}</span>
			<a class="button button-quiet history-review" href="result.html?attempt=${encodeURIComponent(attemptId)}">Xem lại <span aria-hidden="true">↗</span></a>
		</article>`;
	}).join("");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function loadAttemptDetails() {
	return allHistory.map((entry) => {
		if (Array.isArray(entry.questions)) return entry;

		const attemptId = String(entry.attemptId || entry.id || "");
		if (!attemptId) return null;
		return currentUser
			? readUserData(currentUser, `result_${attemptId}`, null, { legacyKey: `studysphere_result_${attemptId}` })
			: readLocalData(`studysphere_guest_result_${attemptId}`, readLocalData(`studysphere_result_${attemptId}`, null));
	}).filter((entry) => entry && Array.isArray(entry.questions));
}

function renderRecommendations() {
	const analysis = getStudyRecommendations(loadAttemptDetails());
	if (analysis.status === "insufficient") {
		recommendationStatus.textContent = !allHistory.length
			? "Chưa có đủ dữ liệu lịch sử để xác định phần cần ôn. Hãy làm thêm một vài bài kiểm tra để hệ thống có dữ liệu về môn học, chủ đề và câu trả lời của bạn."
			: analysis.analyzedAttempts === 0
				? "Lịch sử hiện có chưa lưu đủ câu hỏi và câu trả lời chi tiết để phân tích. Hãy làm thêm bài luyện tập trên StudySphere để hệ thống ghi nhận kết quả theo chủ đề."
				: `Đã phân tích ${analysis.analyzedQuestions} câu trong ${analysis.analyzedAttempts} lần làm; cần tối thiểu 3 câu hỏi có kết quả trả lời đã lưu để gợi ý sát hơn. Hãy tiếp tục làm bài nhé.`;
		recommendationList.replaceChildren();
		return;
	}

	recommendationStatus.textContent = `Gợi ý được tạo từ ${analysis.analyzedQuestions} câu hỏi trong ${analysis.analyzedAttempts} lần làm đã lưu. Hệ thống dùng các câu sai/bỏ trống và chủ đề có sẵn, không dùng mô hình AI để phân tích.`;
	if (!analysis.recommendations.length) {
		recommendationList.innerHTML = '<p class="study-recommendations-empty">Chưa tìm thấy bài ôn có sẵn khớp với môn/lớp trong lịch sử. Bạn có thể xem toàn bộ <a href="../tests/index.html">bài kiểm tra</a>.</p>';
		return;
	}

	recommendationList.innerHTML = analysis.recommendations.map((item) => `
		<article class="study-recommendation-card">
			<span class="study-recommendation-label">${item.isWeakness ? "Ưu tiên củng cố" : "Luyện tập duy trì"}</span>
			<h3>${escapeHtml(item.title)}</h3>
			<p class="study-recommendation-reason">${escapeHtml(item.reason)}</p>
			<p class="study-recommendation-meta">${item.questionCount} câu có sẵn</p>
			<a class="button button-primary" href="${escapeHtml(item.href)}">Bắt đầu ôn tập <span aria-hidden="true">→</span></a>
		</article>
	`).join("");
}

async function loadHistory() {
	allHistory = currentUser
		? readUserCollection(currentUser, "history", "studysphere_history")
		: readLocalData("studysphere_guest_history", []);
	if (currentUser) {
		try {
			const userId = String(currentUser.id || currentUser.email || "");
			const remoteHistory = await apiClient.list("attempts", { userId });
			const merged = new Map([...allHistory, ...remoteHistory]
				.filter((item) => String(item.userId || userId) === userId)
				.map((item) => [String(item.attemptId || item.id), item]));
			allHistory = [...merged.values()].sort((first, second) => new Date(second.submittedAt || second.submitted_at || 0) - new Date(first.submittedAt || first.submitted_at || 0));
			writeUserCollection(currentUser, "history", allHistory);
			if (apiStatus) apiStatus.textContent = `Đã đồng bộ ${remoteHistory.length} kết quả từ JSON-server.`;
		} catch (error) {
			if (apiStatus) apiStatus.textContent = `${error.message} Đang hiển thị lịch sử lưu trên thiết bị.`;
		}
	}
	renderRecommendations();
	renderHistory(allHistory);
}

search.addEventListener("input", () => renderHistory(allHistory));
status.addEventListener("change", () => renderHistory(allHistory));
loadHistory();
