import { apiClient } from "./apiClient.js";
import { getCurrentUser, readUserCollection, readUserData, writeUserCollection } from "./userData.js";
import { buildStudyRecommendations } from "./studyRecommendations.js";

const list = document.querySelector("#history-list");
const count = document.querySelector("#history-count");
const search = document.querySelector("#history-search");
const status = document.querySelector("#history-status");
const apiStatus = document.querySelector("#history-api-status");
const recommendationsElement = document.querySelector("#study-recommendations");
const recommendationsList = document.querySelector("#study-recommendations-list");
const currentUser = getCurrentUser();
let allHistory = [];

function readAttemptDetails(item) {
	const attemptId = String(item.attemptId || item.id || "");
	let stored = item.questions ? { result: item, questions: item.questions } : null;
	if (!stored && currentUser && attemptId) {
		stored = readUserData(currentUser, `result_${attemptId}`, null, { legacyKey: `studysphere_result_${attemptId}` });
	}
	if (!stored && !currentUser && attemptId) {
		try {
			stored = JSON.parse(localStorage.getItem(`studysphere_guest_result_${attemptId}`) || "null");
		} catch {
			stored = null;
		}
	}
	if (!Array.isArray(stored?.questions)) return null;
	const result = stored.result || stored;
	return { ...stored, result: { ...result, ...item, answers: result.answers || item.answers } };
}

function renderRecommendations() {
	const recommendations = buildStudyRecommendations(allHistory.map(readAttemptDetails).filter(Boolean));
	recommendationsElement.hidden = recommendations.length === 0;
	recommendationsList.innerHTML = recommendations.map((recommendation) => {
		const query = new URLSearchParams({ subject: recommendation.subjectId, grade: String(recommendation.grade) });
		if (recommendation.topic !== "Ôn tập tổng hợp") query.set("topic", recommendation.topic);
		const examQuery = new URLSearchParams({ subject: recommendation.subjectId, grade: String(recommendation.grade) });
		const wrongLabel = recommendation.wrongCount === 1 ? "1 câu sai" : `${recommendation.wrongCount} câu sai`;
		return `<article class="study-recommendation">
			<div><span>${escapeHtml(recommendation.subjectName)} · Lớp ${recommendation.grade}</span><h3>${escapeHtml(recommendation.topic)}</h3><p>${wrongLabel} trong lịch sử làm bài</p></div>
			<div class="study-recommendation-actions"><a class="button button-primary" href="../tests/scope.html?${query}">Luyện chủ đề <span aria-hidden="true">→</span></a><a href="../tests/index.html?${examQuery}">Xem đề môn học</a></div>
		</article>`;
	}).join("");
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

async function loadHistory() {
	allHistory = readUserCollection(currentUser, "history", "studysphere_history");
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
