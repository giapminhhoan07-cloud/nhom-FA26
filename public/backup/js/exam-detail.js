import { exams } from "../data/exams.js";
import { practiceTests, upcomingTests } from "../data/practice-tests.js";

const nav = document.querySelector(".main-nav");
document.querySelector(".menu-toggle")?.addEventListener("click", (event) => { const button = event.currentTarget; const open = nav.classList.toggle("open"); button.setAttribute("aria-expanded", String(open)); });
const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const testId = params.get("test");
const detail = document.querySelector("#exam-detail");
const backLink = document.querySelector(".back-link");

function renderPracticeTestDetail() {
	const test = practiceTests.find((item) => item.id === testId)
		 || upcomingTests.find((item) => item.id === testId);
	const requestedReturn = params.get("return") || "";
	const returnHref = /^tests\.html(?:\?.*)?$/.test(requestedReturn) ? requestedReturn : "tests.html";
	backLink.href = returnHref;

	if (!test) {
		detail.innerHTML = '<h1>Không tìm thấy đề kiểm tra</h1><p class="detail-description">Đề có thể đã bị gỡ khỏi kho.</p><a class="button button-primary" href="tests.html">Trở về</a>';
		return;
	}

	document.title = `${test.title} | StudySphere`;
	backLink.hidden = true;
	       const hasQuestions = Array.isArray(test.questions) && test.questions.length > 0;
	       const questionCount = hasQuestions
		       ? test.questions.length
		       : test.questionCount == null ? "Đang cập nhật" : `${test.questionCount} (dự kiến)`;
	       const actionMarkup = hasQuestions
		       ? `<a class="button button-primary" href="quiz.html?test=${encodeURIComponent(test.id)}">Bắt đầu làm bài <span aria-hidden="true">→</span></a>`
		       : '<span class="test-status">Đề đang được cập nhật</span>';
	detail.innerHTML = `
		<div class="detail-top">
			<span class="exam-subject">${test.subjectName}</span>
			<span class="detail-label">Lớp ${test.grade} · ${test.examTypeName}</span>
		</div>
		<h1>${test.title}</h1>
		<p class="detail-description">${test.description || ""}</p>
		<div class="detail-stats">
			<div><strong>${test.grade}</strong><span>Lớp</span></div>
			<div><strong>${test.examTypeName}</strong><span>Loại đề</span></div>
			<div><strong>${test.difficultyName}</strong><span>Mức độ</span></div>
			<div><strong>${test.durationMinutes}</strong><span>Phút làm bài</span></div>
			       <div><strong>${questionCount}</strong><span>Số câu</span></div>
		</div>
		<div class="detail-actions">
			       ${actionMarkup}
			<a class="button button-quiet" href="${returnHref}">Trở về</a>
		</div>
	`;
}

if (testId) {
	renderPracticeTestDetail();
} else {
const localExams = (() => { try { return JSON.parse(localStorage.getItem("studysphere_custom_exams") || "[]"); } catch { return []; } })();
let exam = [...exams, ...localExams].find((item) => item.id === id) || exams[0];
try { const response = await fetch(`../api/exams.php?id=${encodeURIComponent(id || exam.id)}`); const result = await response.json(); if (response.ok && result.success) exam = result.exam; } catch { /* Use bundled fallback when PHP is unavailable. */ }
const isPreviewOnly = Boolean(exam.documentUrl);
const documentPreview = isPreviewOnly ? (exam.documentUrl ? `<details class="exam-document"><summary><span class="exam-document-summary"><strong>${exam.title}</strong><small>Đề PDF · Nhấn để xem đề</small></span><span class="exam-document-toggle">Xem đề <span aria-hidden="true">↗</span></span></summary><iframe src="${exam.documentUrl}" title="${exam.title}"></iframe><div class="exam-document-actions"><a class="button button-primary" href="${exam.documentUrl}" target="_blank" rel="noreferrer">Mở tab mới</a><a class="button button-quiet" href="${exam.documentUrl}" download>⇩ Tải đề xuống</a></div></details>` : `<div class="exam-document exam-document-empty"><strong>Nội dung đề sẽ được cập nhật</strong><p>File đề sẽ hiển thị tại đây sau khi được tải lên.</p></div>`) : "";
const detailStats = isPreviewOnly ? "" : `<div class="detail-stats"><div><strong>${exam.questionCount}</strong><span>Số câu hỏi</span></div><div><strong>${exam.durationMinutes}</strong><span>Phút làm bài</span></div><div><strong>${exam.difficultyName}</strong><span>Mức độ</span></div></div>`;
const actionMarkup = isPreviewOnly ? "" : `<div class="detail-actions"><a class="button button-primary" href="quiz.html?id=${exam.id}">Bắt đầu làm bài <span aria-hidden="true">→</span></a><button class="button button-quiet" type="button" id="favorite-detail">♡ Lưu đề</button></div>`;
const noteMarkup = isPreviewOnly ? "" : `<div class="detail-note"><strong>Trước khi bắt đầu</strong><p>Hãy chuẩn bị không gian yên tĩnh. Đồng hồ sẽ bắt đầu chạy ngay khi bạn vào bài làm.</p></div>`;
detail.innerHTML = `<div class="detail-top"><span class="exam-subject">${exam.subjectName}</span><span class="detail-label">${exam.typeName}</span></div><h1>${exam.title}</h1><p class="detail-description">${exam.description}</p>${detailStats}${actionMarkup}${documentPreview}${noteMarkup}`;
const favoriteButton = document.querySelector("#favorite-detail");
if (favoriteButton) {
	let favorites = JSON.parse(localStorage.getItem("studysphere_favorites") || "[]");
	const updateFavorite = () => { const saved = favorites.includes(exam.id); favoriteButton.textContent = saved ? "♥ Đã lưu" : "♡ Lưu đề"; favoriteButton.classList.toggle("saved", saved); };
	updateFavorite();
	favoriteButton.addEventListener("click", () => { const index = favorites.indexOf(exam.id); index >= 0 ? favorites.splice(index, 1) : favorites.push(exam.id); localStorage.setItem("studysphere_favorites", JSON.stringify(favorites)); updateFavorite(); });
}
}
