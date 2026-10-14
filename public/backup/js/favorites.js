import { exams } from "../data/exams.js";
import { practiceTests } from "../tests/data/practice-tests.js";
import { apiClient } from "./apiClient.js";
import { getCurrentUser, readUserCollection } from "./userData.js";

const currentUser = getCurrentUser();
const ids = new Set(readUserCollection(currentUser, "favorites", "studysphere_favorites").map(String));
const list = document.querySelector("#favorite-list");
const emptyState = document.querySelector("#favorite-empty");
const apiStatus = document.querySelector("#favorite-api-status");
const emptyLink = emptyState.querySelector("a");
emptyState.querySelector("p").textContent = "Chọn biểu tượng trái tim trong bài kiểm tra để lưu lại.";
emptyLink.href = "../tests/index.html";
emptyLink.textContent = "Đến bài kiểm tra";

const savedExams = exams.filter((exam) => ids.has(String(exam.id)));
const savedTests = practiceTests
	.filter((test) => ids.has(String(test.id)))
	.map((test) => ({
		...test,
		favoriteKind: "practice-test",
		year: `Lớp ${test.grade}`,
		questionCount: test.questions.length,
	}));
let savedApiExams = [];
try {
	const records = await apiClient.list("exams");
	savedApiExams = records
		.filter((exam) => ids.has(String(exam.id)) && !exams.some((localExam) => String(localExam.id) === String(exam.id)))
		.map((exam) => ({ ...exam, id: String(exam.id), favoriteKind: "json-server", subjectName: exam.subjectName || exam.subject || "Môn học chưa cập nhật", questions: Array.isArray(exam.questions) ? exam.questions : [], durationMinutes: Number(exam.durationMinutes ?? exam.duration) || null }));
	if (apiStatus) apiStatus.textContent = `Đã tải ${savedApiExams.length} đề đã lưu từ JSON-server.`;
} catch (error) {
	if (apiStatus) apiStatus.textContent = `${error.message} Một số đề đã lưu trên JSON-server chưa thể hiển thị.`;
}
const saved = [...savedExams, ...savedTests, ...savedApiExams];
if (!saved.length) {
	list.hidden = true;
	emptyState.hidden = false;
} else {
	list.innerHTML = saved.map((exam) => {
		const destination = exam.favoriteKind === "json-server"
			? `exam-detail.html?id=${encodeURIComponent(exam.id)}`
			: exam.favoriteKind === "practice-test"
			? `../tests/quiz.html?test=${encodeURIComponent(exam.id)}`
			: exam.questions?.length
			? `quiz.html?id=${encodeURIComponent(exam.id)}`
			: `exam-detail.html?id=${encodeURIComponent(exam.id)}`;
		const linkLabel = exam.questions?.length ? `Bắt đầu làm bài: ${exam.title}` : `Xem ${exam.title}`;
		const duration = Number(exam.durationMinutes) > 0 ? `◷ ${exam.durationMinutes} phút` : "◷ Thời gian đang cập nhật";
		const questionCount = exam.favoriteKind === "json-server"
			? exam.questions.length ? `▤ ${exam.questions.length} câu` : "▤ Câu hỏi đang cập nhật"
			: exam.questions?.length
			? `▤ ${exam.questions.length} câu`
			: exam.documentUrl ? "▤ Có file PDF" : "▤ Câu hỏi đang cập nhật";
		const status = exam.favoriteKind === "json-server" ? "Từ JSON-server" : exam.questions?.length ? "Đã hoàn thành" : exam.documentUrl ? "Có file PDF" : "Đang cập nhật";
		return `<article class="exam-card"><div class="exam-card-top"><span class="exam-subject">${escapeHtml(exam.subjectName || exam.subject || "Môn học")}</span><span class="exam-year">${escapeHtml(exam.year || (exam.grade ? `Lớp ${exam.grade}` : "Đề thi"))}</span></div><span class="exam-readiness">${status}</span><h3>${escapeHtml(exam.title)}</h3><p>${escapeHtml(exam.description || "Thông tin chi tiết sẽ được cập nhật.")}</p><div class="exam-meta"><span>${duration}</span><span>${questionCount}</span></div><a class="exam-card-link" href="${destination}" aria-label="${escapeHtml(linkLabel)}">↗</a></article>`;
	}).join("");
}

function escapeHtml(value) {
	return String(value ?? "").replace(/[&<>"']/g, (character) => ({
		"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
	})[character]);
}
