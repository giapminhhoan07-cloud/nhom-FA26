import { exams } from "../data/exams.js";

const attemptId = new URLSearchParams(window.location.search).get("attempt");
const fallbackKey = `studysphere_result_${attemptId}`;
const fallbackStored = (() => { try { return JSON.parse(localStorage.getItem(fallbackKey) || "null"); } catch { return null; } })();
const card = document.querySelector("#result-card");

function getOptionLabel(index) {
  return String.fromCharCode(65 + index);
}

function normalizeAttemptData(stored) {
  if (!stored) return null;
  if (stored.result && Array.isArray(stored.questions)) {
    return stored;
  }
  if (stored.attempt && Array.isArray(stored.questions)) {
    const result = {
      attemptId: String(stored.attempt.id),
      examId: stored.attempt.exam_id,
      examTitle: stored.attempt.exam_title,
      submittedAt: stored.attempt.submitted_at,
      score: Number(stored.attempt.score || 0),
      totalQuestions: Number(stored.attempt.total_questions || 0),
      correctCount: Number(stored.attempt.correct_count || 0),
      wrongCount: Number(stored.attempt.wrong_count || 0),
      unansweredCount: Number(stored.attempt.unanswered_count || 0),
      answers: stored.answers || []
    };
    return { result, questions: stored.questions };
  }
  return null;
}

const currentUser = (() => {
  try {
    return JSON.parse(localStorage.getItem("studysphere_current_user") || "null");
  } catch {
    return null;
  }
})();

let stored = normalizeAttemptData(fallbackStored);

if (!stored && attemptId && currentUser?.id) {
  try {
    const response = await fetch("../api/attempts.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "get_attempt_detail", user_id: currentUser.id, attempt_id: Number(attemptId) }),
    });
    const data = await response.json();
    if (response.ok && data.success) {
      stored = normalizeAttemptData({ result: { attemptId: String(data.attempt.id), examId: data.attempt.exam_id, examTitle: data.attempt.exam_title, submittedAt: data.attempt.submitted_at, score: Number(data.attempt.score || 0), totalQuestions: Number(data.attempt.total_questions || 0), correctCount: Number(data.attempt.correct_count || 0), wrongCount: Number(data.attempt.wrong_count || 0), unansweredCount: Number(data.attempt.unanswered_count || 0), answers: data.answers || [] }, questions: data.questions || [] });
    }
  } catch {
    // Continue with the local result when the PHP API is unavailable.
  }
}

if (!stored) {
  card.innerHTML = '<h1>Không tìm thấy kết quả</h1><p class="detail-description">Kết quả có thể đã bị xóa khỏi trình duyệt hoặc chưa được lưu lên máy chủ.</p><a class="button button-primary" href="exams.html">Về kho đề</a>';
  throw new Error('No result');
}

const { result, questions } = stored;
questions.forEach((question) => { question.type = question.type || (question.answer !== undefined ? "short_answer" : "multiple_choice"); question.correctAnswer = question.correctAnswer ?? question.correct_answer; });
const passed = Number(result.score) >= 5;
const isCorrectAnswer = (answer, question) => question.type === "short_answer"
  ? String(answer ?? "").trim().toLowerCase() === String(question.answer ?? "").trim().toLowerCase()
  : answer === question.correctAnswer;

function buildReviewMarkup(filter = "all") {
  return questions.map((question, index) => {
    const selectedAnswer = result.answers?.[index];
    const selectedIndex = question.type === "short_answer" ? selectedAnswer : (Number.isInteger(selectedAnswer) ? Number(selectedAnswer) : null);
    const isUnanswered = selectedAnswer === null || selectedAnswer === undefined || selectedAnswer === "";
    const isCorrect = !isUnanswered && isCorrectAnswer(selectedAnswer, question);
    const isWrong = !isUnanswered && !isCorrect;
    const statusClass = isCorrect ? "is-correct" : isWrong ? "is-wrong" : "is-unanswered";
    const statusText = isCorrect ? "Đúng" : isWrong ? "Sai" : "Bỏ qua";

    const shouldRender = filter === "all" || (filter === "wrong" && isWrong) || (filter === "unanswered" && isUnanswered);
    if (!shouldRender) return "";

    const optionsMarkup = (question.options || []).map((option, optionIndex) => {
      const isSelected = selectedIndex === optionIndex;
      const isCorrectAnswer = optionIndex === question.correctAnswer;
      const optionClasses = [
        "review-option",
        isSelected ? "selected" : "",
        isCorrectAnswer ? "answer-correct" : "",
        isWrong && isSelected ? "answer-selected-wrong" : "",
      ].filter(Boolean).join(" ");

      return `
        <li class="${optionClasses}">
          <span class="review-option-letter">${getOptionLabel(optionIndex)}</span>
          <span class="review-option-text">${option}</span>
          ${isCorrectAnswer ? '<span class="review-option-badge">Đáp án đúng</span>' : ""}
        </li>
      `;
    }).join("");

    return `
      <article class="review-item ${statusClass}">
        <div class="review-item-head">
          <span class="review-number">Câu ${index + 1}</span>
          <span class="review-status ${statusClass}">${statusText}</span>
        </div>
        <h3>${question.content}</h3>
        <ul class="review-options">${optionsMarkup}</ul>
        <div class="review-footer">
          <p><strong>Đáp án của bạn:</strong> ${isUnanswered ? "Chưa trả lời" : question.type === "short_answer" ? selectedAnswer : getOptionLabel(selectedIndex)}</p>
          <p><strong>Đáp án đúng:</strong> ${question.type === "short_answer" ? question.answer : getOptionLabel(question.correctAnswer)}</p>
        </div>
        <p class="review-explanation">${question.explanation}</p>
      </article>
    `;
  }).join("");
}

const reviewFilterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "wrong", label: "Chỉ câu sai" },
  { value: "unanswered", label: "Chưa làm" },
];

card.innerHTML = `
  <div class="detail-top">
    <p class="eyebrow"><span class="eyebrow-dot"></span> Bài làm đã hoàn tất</p>
    <div class="detail-header-actions">
      <button class="button button-secondary review-trigger" type="button">Xem lại bài đã làm</button>
      <a class="text-link" href="history.html"><span aria-hidden="true">←</span> Quay lại lịch sử</a>
    </div>
  </div>
  <h1>${result.score}<small>/10 điểm</small></h1>
  <p class="detail-description">${result.examTitle}</p>
  <div class="detail-stats">
    <div><strong>${result.correctCount}</strong><span>Câu đúng</span></div>
    <div><strong>${result.wrongCount}</strong><span>Câu sai</span></div>
    <div><strong>${result.unansweredCount}</strong><span>Bỏ qua</span></div>
  </div>
  <div class="detail-actions">
    <a class="button button-primary" href="quiz.html?id=${result.examId}">Làm lại bài</a>
    <a class="button button-quiet" href="exams.html">Về kho đề</a>
  </div>
  <div class="detail-note">
    <strong>${passed ? "Bạn đã đạt yêu cầu" : "Cần ôn tập thêm"}</strong>
    <p>${passed ? "Tiếp tục giữ phong độ và luyện thêm những câu chưa chắc chắn." : `Bạn còn ${result.wrongCount + result.unansweredCount} câu cần xem lại trong phần dưới đây.`}</p>
  </div>
  <section class="review-section">
    <div class="review-header">
      <h2>Xem lại bài</h2>
      <span>${result.wrongCount} câu sai</span>
    </div>
    <div class="review-filter-bar">
      ${reviewFilterOptions.map(({ value, label }) => `<button class="review-filter-button" type="button" data-filter="${value}">${label}</button>`).join("")}
    </div>
    <div class="review-list" id="review-list">${buildReviewMarkup()}</div>
  </section>

  <div class="review-modal-overlay" id="review-modal-overlay" hidden>
    <div class="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title">
      <div class="review-modal-header">
        <div>
          <p class="review-modal-kicker">Chi tiết bài làm</p>
          <h3 id="review-modal-title">${result.examTitle}</h3>
        </div>
        <button class="review-modal-close" type="button" aria-label="Đóng">×</button>
      </div>

      <div class="review-modal-summary">
        <div class="review-modal-summary-main">
          <span class="review-modal-label">Bài kiểm tra</span>
          <strong>${result.examTitle}</strong>
        </div>
        <div class="review-modal-summary-score">
          <span>${result.score} / 10</span>
        </div>
      </div>

      <div class="review-modal-status-row">
        ${questions.map((_, i) => {
          const selected = result.answers?.[i];
          const isCorrect = isCorrectAnswer(selected, questions[i]);
          const state = selected === null || selected === undefined || selected === "" ? "skip" : isCorrect ? "correct" : "wrong";
          return `<button class="review-chip ${state}" type="button" data-question-index="${i}">${i + 1}</button>`;
        }).join("")}
      </div>

      <div id="review-modal-question"></div>
    </div>
  </div>
`;

const reviewList = document.querySelector("#review-list");
const filterButtons = document.querySelectorAll(".review-filter-button");
const reviewModalOverlay = document.querySelector("#review-modal-overlay");
const reviewModalQuestion = document.querySelector("#review-modal-question");
const reviewTrigger = document.querySelector(".review-trigger");
const reviewModalClose = document.querySelector(".review-modal-close");

function renderQuestionDetail(index) {
  const question = questions[index];
  const selectedAnswer = result.answers?.[index];
  const selectedIndex = question.type === "short_answer" ? selectedAnswer : (Number.isInteger(selectedAnswer) ? Number(selectedAnswer) : null);
  const isUnanswered = selectedAnswer === null || selectedAnswer === undefined || selectedAnswer === "";
  const isCorrect = !isUnanswered && isCorrectAnswer(selectedAnswer, question);
  const isWrong = !isUnanswered && !isCorrect;
  const statusClass = isCorrect ? "is-correct" : isWrong ? "is-wrong" : "is-unanswered";
  const statusText = isCorrect ? "Đúng" : isWrong ? "Sai" : "Bỏ qua";

  reviewModalQuestion.innerHTML = `
    <div class="review-question-card ${statusClass}">
      <div class="review-question-head">
        <span class="review-question-label">Câu ${index + 1}</span>
        <span class="review-question-status ${statusClass}">${statusText}</span>
      </div>
      <h4>${question.content}</h4>
      <ul class="review-question-options">
        ${(question.options || []).map((option, optionIndex) => {
          const isSelected = selectedIndex === optionIndex;
          const isCorrectAnswer = optionIndex === question.correctAnswer;
          const classes = [
            "review-answer-row",
            isSelected ? "selected" : "",
            isCorrectAnswer ? "correct" : "",
            isWrong && isSelected ? "wrong" : "",
          ].filter(Boolean).join(" ");

          return `
            <li class="${classes}">
              <span class="review-answer-letter">${getOptionLabel(optionIndex)}</span>
              <span class="review-answer-text">${option}</span>
              ${isCorrectAnswer ? '<span class="review-answer-tag">Đáp án đúng</span>' : ""}
            </li>
          `;
        }).join("")}
      </ul>
      <div class="review-question-footer">
        <p><strong>Đáp án của bạn:</strong> ${isUnanswered ? "Chưa chọn" : question.type === "short_answer" ? selectedAnswer : getOptionLabel(selectedIndex)}</p>
        <p><strong>Đáp án đúng:</strong> ${question.type === "short_answer" ? question.answer : getOptionLabel(question.correctAnswer)}</p>
      </div>
      <div class="review-question-explain">
        <strong>Giải thích:</strong>
        <p>${question.explanation}</p>
      </div>
    </div>
  `;
}

function openReviewModal() {
  reviewModalOverlay.hidden = false;
  document.body.classList.add("modal-open");
}

function closeReviewModal() {
  reviewModalOverlay.hidden = true;
  document.body.classList.remove("modal-open");
}

if (reviewTrigger) {
  reviewTrigger.addEventListener("click", openReviewModal);
}
if (reviewModalClose) {
  reviewModalClose.addEventListener("click", closeReviewModal);
}
if (reviewModalOverlay) {
  reviewModalOverlay.addEventListener("click", (event) => {
    if (event.target === reviewModalOverlay) closeReviewModal();
  });
}

document.querySelectorAll(".review-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    renderQuestionDetail(Number(chip.dataset.questionIndex));
    document.querySelectorAll(".review-chip").forEach((item) => item.classList.toggle("active", item === chip));
  });
});

const defaultModalIndex = questions.findIndex((question, index) => !isCorrectAnswer(result.answers?.[index], question));
renderQuestionDetail(defaultModalIndex >= 0 ? defaultModalIndex : 0);
document.querySelectorAll(".review-chip").forEach((chip) => chip.classList.toggle("active", Number(chip.dataset.questionIndex) === (defaultModalIndex >= 0 ? defaultModalIndex : 0)));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    reviewList.innerHTML = buildReviewMarkup(selectedFilter);
  });
});

const defaultButton = document.querySelector('.review-filter-button[data-filter="all"]');
if (defaultButton) defaultButton.classList.add("is-active");
