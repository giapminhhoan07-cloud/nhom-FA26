import { exams } from "../data/exams.js";

const featuredContainer = document.querySelector("#featured-exams");

if (featuredContainer) {
  featuredContainer.innerHTML = exams
    .filter((exam) => exam.featured)
    .map((exam) => {
      const destination = exam.questions?.length
        ? `pages/quiz.html?id=${encodeURIComponent(exam.id)}`
        : `pages/exam-detail.html?id=${encodeURIComponent(exam.id)}`;
      const linkLabel = exam.questions?.length ? `Bắt đầu làm bài: ${exam.title}` : `Xem ${exam.title}`;
      return `
      <article class="exam-card">
        <div class="exam-card-top"><span class="exam-subject">${exam.subjectName}</span><span class="exam-year">${exam.year}</span></div>
        <h3>${exam.title}</h3>
        <p>${exam.description}</p>
        <div class="exam-meta"><span>◷ ${exam.durationMinutes} phút</span><span>▤ ${exam.questionCount} câu</span></div>
        <a class="exam-card-link" href="${destination}" aria-label="${linkLabel}">↗</a>
      </article>
    `;
    })
    .join("");
}
