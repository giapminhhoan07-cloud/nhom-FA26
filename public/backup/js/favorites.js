import { exams } from "../data/exams.js";
import { practiceTests } from "../tests/data/practice-tests.js";

const ids = (() => {
	try {
		return JSON.parse(localStorage.getItem("studysphere_favorites") || "[]");
	} catch {
		return [];
	}
})();
const list = document.querySelector("#favorite-list");
const emptyState = document.querySelector("#favorite-empty");
const emptyLink = emptyState.querySelector("a");
emptyState.querySelector("p").textContent = "Chọn biểu tượng trái tim trong kho đề kiểm tra để lưu lại.";
emptyLink.href = "../tests/index.html";
emptyLink.textContent = "Đến kho đề kiểm tra";

const savedExams = exams.filter((exam) => ids.includes(exam.id));
const savedTests = practiceTests
	.filter((test) => ids.includes(test.id))
	.map((test) => ({
		...test,
		favoriteKind: "practice-test",
		year: `Lớp ${test.grade}`,
		questionCount: test.questions.length,
	}));
const saved = [...savedExams, ...savedTests];
if (!saved.length) {
	list.hidden = true;
	emptyState.hidden = false;
} else {
	list.innerHTML = saved.map((exam) => {
		const destination = exam.favoriteKind === "practice-test"
			? `quiz.html?test=${encodeURIComponent(exam.id)}`
			: exam.questions?.length
			? `quiz.html?id=${encodeURIComponent(exam.id)}`
			: `exam-detail.html?id=${encodeURIComponent(exam.id)}`;
		const linkLabel = exam.questions?.length ? `Bắt đầu làm bài: ${exam.title}` : `Xem ${exam.title}`;
		const duration = Number(exam.durationMinutes) > 0 ? `◷ ${exam.durationMinutes} phút` : "◷ Xem trong PDF";
		const questionCount = Number(exam.questionCount) > 0 ? `▤ ${exam.questionCount} câu` : "▤ PDF đề thi";
		return `<article class="exam-card"><div class="exam-card-top"><span class="exam-subject">${exam.subjectName}</span><span class="exam-year">${exam.year}</span></div><h3>${exam.title}</h3><p>${exam.description}</p><div class="exam-meta"><span>${duration}</span><span>${questionCount}</span></div><a class="exam-card-link" href="${destination}" aria-label="${linkLabel}">↗</a></article>`;
	}).join("");
}
