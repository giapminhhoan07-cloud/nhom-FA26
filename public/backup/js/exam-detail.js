import { exams } from "../data/exams.js";
import { practiceTests, upcomingTests } from "../tests/data/practice-tests.js";
import { practiceQuestionBank } from "./practiceScopes.js";
import { apiClient } from "./apiClient.js";
import { hideSkeleton, showSkeleton } from "./skeleton.js";
import { getCurrentUser, readUserCollection, writeUserCollection } from "./userData.js";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const testId = params.get("test");
const detail = document.querySelector("#exam-detail");
const backLink = document.querySelector(".back-link");
const currentUser = getCurrentUser();

function renderPracticeTestDetail() {
	const test = practiceTests.find((item) => item.id === testId)
		 || upcomingTests.find((item) => item.id === testId);
	const requestedReturn = params.get("return") || "";
	const normalizedReturn = requestedReturn.replace(/^\.\//, "../");
	const returnHref = /^(?:\.\.\/tests\/index\.html|\.\.\/pages\/exam-library\.html|exam-library\.html)(?:\?.*)?$/.test(normalizedReturn) ? normalizedReturn : "../tests/index.html";
	backLink.href = returnHref;

	if (!test) {
		detail.innerHTML = '<h1>Không tìm thấy đề kiểm tra</h1><p class="detail-description">Đề có thể đã bị gỡ khỏi kho.</p><a class="button button-primary" href="../tests/index.html">Trở về</a>';
		return;
	}

	document.title = `${test.title} | StudySphere`;
	backLink.hidden = true;
	const hasQuestions = Array.isArray(test.questions) && test.questions.length > 0;
	const questionCount = hasQuestions
		? test.questions.length
		: test.questionCount == null ? "Đang cập nhật" : `${test.questionCount} (dự kiến)`;
	const topics = [...new Set(practiceQuestionBank
		.filter((question) => question.sourceTestId === test.id)
		.flatMap((question) => question.topics)
		.filter((topic) => topic !== "Ôn tập tổng hợp"))];
	const actionMarkup = hasQuestions
		? `<a class="button button-primary" href="../tests/quiz.html?test=${encodeURIComponent(test.id)}">Bắt đầu làm bài <span aria-hidden="true">→</span></a>`
		: '<span class="test-status">Đề đang được cập nhật</span>';
	const topicMarkup = `<div class="detail-topics"><strong>Chủ đề</strong><span>${topics.length ? topics.join(" · ") : "Đang cập nhật"}</span></div>`;
	const statusLabel = test.isSample ? "Bộ luyện tập mẫu" : hasQuestions ? "Đã hoàn thành" : "Đang cập nhật";
	detail.innerHTML = `
		<div class="detail-top">
			<span class="exam-subject">${test.subjectName}</span>
			<span class="detail-label">${statusLabel} · Lớp ${test.grade} · ${test.examTypeName}</span>
		</div>
		<h1>${test.title}</h1>
		<p class="detail-description">${test.description || ""}</p>
		<div class="detail-stats">
			<div><strong>Lớp ${test.grade}</strong><span>Lớp học</span></div>
			<div><strong>${test.examTypeName}</strong><span>Loại đề</span></div>
			<div><strong>${test.difficultyName}</strong><span>Mức độ</span></div>
			<div><strong>${test.durationMinutes}</strong><span>Phút làm bài</span></div>
			<div><strong>${questionCount}</strong><span>Số câu</span></div>
		</div>
		${topicMarkup}
		<div class="detail-actions">
				${actionMarkup}
			<a class="button button-quiet" href="${returnHref}">Trở về</a>
		</div>
	`;
}

if (testId) {
	renderPracticeTestDetail();
} else {
if (params.get("return") === "exam-library.html") {
	backLink.href = "exam-library.html";
	backLink.textContent = "← Quay lại kho đề thi";
}
let exam = exams.find((item) => String(item.id) === id);
let localCatalogError = "";
if (!exam && id) {
	try {
		const localExams = JSON.parse(localStorage.getItem("studysphere_custom_exams") || "[]");
		if (!Array.isArray(localExams)) throw new Error("Đề đã lưu trên thiết bị không đúng định dạng.");
		exam = localExams.find((item) => String(item.id) === id);
	} catch (error) {
		localCatalogError = error.message;
	}
}
if (!exam && id) {
	showSkeleton(detail, "detail");
	try {
		const records = await apiClient.list("exams", { id });
		const record = records.find((item) => String(item.id) === id);
		if (record) {
			exam = {
				...record,
				id: String(record.id),
				title: String(record.title || "Đề thi chưa có tên"),
				subjectId: record.subjectId || record.subject || "",
				subjectName: record.subjectName || record.subject || "Môn học chưa cập nhật",
				typeName: record.typeName || record.type || "Đề thi",
				difficultyName: record.difficultyName || ({ easy: "Cơ bản", medium: "Trung bình", hard: "Khó" })[record.difficulty] || "Đang cập nhật",
				durationMinutes: Number(record.durationMinutes ?? record.duration) || null,
				documentUrl: record.documentUrl || record.document_url || "",
				questions: Array.isArray(record.questions) ? record.questions : [],
			};
		}
	} catch {
		// Keep the not-found state when the JSON-server is unavailable.
	}
}
if (!exam) {
	document.title = "Không tìm thấy đề | StudySphere";
	detail.innerHTML = localCatalogError
		? '<h1>Không thể tải kho đề</h1><p class="detail-description" id="local-catalog-error"></p><a class="button button-primary" href="exam-library.html">Về kho đề thi</a>'
		: '<h1>Không tìm thấy đề thi</h1><p class="detail-description">Đề này chưa được thêm vào dữ liệu của trang.</p><a class="button button-primary" href="exam-library.html">Về kho đề thi</a>';
	if (localCatalogError) detail.querySelector("#local-catalog-error").textContent = localCatalogError;
	hideSkeleton(detail);
} else {
const relatedPracticeTest = practiceTests.find((test) => test.id === exam.relatedPracticeTestId);
const hasQuestions = Array.isArray(exam.questions) && exam.questions.length > 0;
let validDocumentUrl = "";
if (typeof exam.documentUrl === "string" && exam.documentUrl.trim()) {
	try {
		const documentUrl = new URL(exam.documentUrl, window.location.href);
		if (documentUrl.origin === window.location.origin && documentUrl.pathname.toLowerCase().endsWith(".pdf")) {
			const response = await fetch(documentUrl, { method: "HEAD", cache: "no-store" });
			if (response.ok && (!response.headers.get("content-type") || response.headers.get("content-type").includes("pdf"))) {
				validDocumentUrl = documentUrl.href;
			}
		}
	} catch {
		validDocumentUrl = "";
	}
}
exam.documentUrl = validDocumentUrl;
const hasDocument = Boolean(validDocumentUrl);
const grade = Number(exam.grade) || Number(exam.title.match(/\b(?:lớp\s*)?(10|11|12)\b/i)?.[1]) || null;
const documentPreview = hasDocument
  ? `<details class="exam-document"><summary><span class="exam-document-summary"><strong>${exam.title}</strong><small>Đề PDF · Nhấn để xem đề</small></span><span class="exam-document-toggle">Xem đề <span aria-hidden="true">↗</span></span></summary><iframe src="${exam.documentUrl}" title="${exam.title}"></iframe><div class="exam-document-actions"><a class="button button-primary" href="${exam.documentUrl}" target="_blank" rel="noreferrer">Mở tab mới</a><a class="button button-quiet" href="${exam.documentUrl}" download>⇩ Tải đề xuống</a></div></details>`
  : "";
const questionTopics = [...new Set((exam.questions || []).flatMap((question) => question.topics || (question.topic ? [question.topic] : [])))];
const examTopics = exam.topics || questionTopics;
const detailStats = `<div class="detail-stats">
	<div><strong>${grade ? `Lớp ${grade}` : "Đang cập nhật"}</strong><span>Lớp học</span></div>
	<div><strong>${hasQuestions ? exam.questions.length : "Đang cập nhật"}</strong><span>Số câu có thể làm</span></div>
	<div><strong>${exam.durationMinutes ? `${exam.durationMinutes} phút` : "Đang cập nhật"}</strong><span>Thời gian</span></div>
	<div><strong>${exam.difficultyName || "Đang cập nhật"}</strong><span>Mức độ</span></div>
	<div><strong>${examTopics.length ? examTopics.join(" · ") : "Đang cập nhật"}</strong><span>Chủ đề</span></div>
</div>`;
const actionMarkup = hasQuestions
  ? `<div class="detail-actions"><a class="button button-primary" href="quiz.html?id=${encodeURIComponent(exam.id)}">Bắt đầu làm bài <span aria-hidden="true">→</span></a><button class="button button-quiet" type="button" id="favorite-detail">♡ Lưu đề</button></div>`
  : `<div class="detail-note"><strong>${hasDocument ? "Có thể xem và tải đề PDF" : "Đề chưa có đủ dữ liệu để làm trực tuyến"}</strong><p>${hasDocument ? "Câu hỏi tương tác và đáp án chưa được nhập vào hệ thống; đề sẽ không được hiển thị như một bài thi trực tuyến hoàn chỉnh." : "Bộ câu hỏi đang được cập nhật. Bạn vẫn có thể chọn một đề có sẵn câu hỏi ở kho bài kiểm tra."}</p>${!hasDocument ? '<a href="../tests/index.html">Xem đề có thể làm ngay →</a>' : ""}${relatedPracticeTest ? `<a href="../tests/quiz.html?test=${encodeURIComponent(relatedPracticeTest.id)}">Làm bộ luyện tập mẫu liên quan →</a>` : ""}<button class="button button-quiet" type="button" id="favorite-detail">♡ Lưu đề</button></div>`;
const noteMarkup = hasQuestions ? `<div class="detail-note"><strong>Trước khi bắt đầu</strong><p>Hãy chuẩn bị không gian yên tĩnh. Đồng hồ sẽ bắt đầu chạy ngay khi bạn vào bài làm.</p></div>` : "";
detail.innerHTML = `<div class="detail-top"><span class="exam-subject">${exam.subjectName}</span><span class="detail-label">${exam.typeName}</span></div><h1>${exam.title}</h1><p class="detail-description">${exam.description || ""}</p>${detailStats}${actionMarkup}${documentPreview}${noteMarkup}`;
hideSkeleton(detail);
const favoriteButton = document.querySelector("#favorite-detail");
if (favoriteButton) {
	let favorites = readUserCollection(currentUser, "favorites", "studysphere_favorites").map(String);
	const updateFavorite = () => { const saved = favorites.includes(String(exam.id)); favoriteButton.textContent = saved ? "♥ Đã lưu" : "♡ Lưu đề"; favoriteButton.classList.toggle("saved", saved); };
	updateFavorite();
	favoriteButton.addEventListener("click", () => { const index = favorites.indexOf(String(exam.id)); index >= 0 ? favorites.splice(index, 1) : favorites.push(String(exam.id)); writeUserCollection(currentUser, "favorites", favorites); updateFavorite(); });
}
}
}
