import { exams } from "../data/exams.js";
import { testSubjects } from "../tests/data/practice-tests.js";
import { practiceQuestionBank } from "./practiceScopes.js";

const featuredContainer = document.querySelector("#featured-exams");
const subjectGrid = document.querySelector(".subject-grid");

const questionCountsBySubject = new Map();
for (const question of practiceQuestionBank) {
  questionCountsBySubject.set(question.subjectId, (questionCountsBySubject.get(question.subjectId) || 0) + 1);
}
const subjectsWithQuestions = testSubjects.filter((subject) => questionCountsBySubject.has(subject.id));
const homeStats = {
  "exam-count": exams.length,
  "subject-count": testSubjects.length,
  "available-subject-count": subjectsWithQuestions.length,
  "question-count": practiceQuestionBank.length,
};
for (const [name, value] of Object.entries(homeStats)) {
  const element = document.querySelector(`[data-home-stat="${name}"]`);
  if (element) element.textContent = String(value);
}

if (subjectGrid) {
  subjectGrid.innerHTML = subjectsWithQuestions.map((subject) => {
    const subjectStyle = {
      toan: "subject-math",
      "dia-li": "subject-geography",
      "lich-su": "subject-history",
    }[subject.id] || "";
    const topicCount = new Set(practiceQuestionBank
      .filter((question) => question.subjectId === subject.id)
      .flatMap((question) => question.topics)
      .filter((topic) => topic !== "Ôn tập tổng hợp")).size;
    return `<a class="subject-card ${subjectStyle}" href="tests/index.html?mode=scope&amp;subject=${encodeURIComponent(subject.id)}"><span class="subject-icon">${subject.icon}</span><span><strong>${subject.name}</strong><small>${questionCountsBySubject.get(subject.id)} câu · ${topicCount} phạm vi</small></span><span class="card-arrow">↗</span></a>`;
  }).join("");
}

if (featuredContainer) {
  featuredContainer.innerHTML = exams
    .filter((exam) => exam.featured)
    .map((exam) => {
      const destination = exam.questions?.length
        ? `pages/quiz.html?id=${encodeURIComponent(exam.id)}`
        : `pages/exam-detail.html?id=${encodeURIComponent(exam.id)}`;
      const linkLabel = exam.questions?.length ? `Bắt đầu làm bài: ${exam.title}` : `Xem ${exam.title}`;
      const duration = Number(exam.durationMinutes) > 0 ? `◷ ${exam.durationMinutes} phút` : "◷ Thời gian đang cập nhật";
      const questionCount = exam.questions?.length
        ? `▤ ${exam.questions.length} câu`
        : exam.documentUrl ? "▤ Có file PDF" : "▤ Câu hỏi đang cập nhật";
      const status = exam.questions?.length ? "Đã hoàn thành" : exam.documentUrl ? "Có file PDF" : "Đang cập nhật";
      return `
      <article class="exam-card">
        <div class="exam-card-top"><span class="exam-subject">${exam.subjectName}</span><span class="exam-year">${exam.year}</span></div>
        <span class="exam-readiness">${status}</span>
        <h3>${exam.title}</h3>
        <p>${exam.description || "Thông tin chi tiết sẽ được cập nhật."}</p>
        <div class="exam-meta"><span>${duration}</span><span>${questionCount}</span></div>
        <a class="exam-card-link" href="${destination}" aria-label="${linkLabel}">↗</a>
      </article>
    `;
    })
    .join("");
}
