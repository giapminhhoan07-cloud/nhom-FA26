const attemptId = new URLSearchParams(window.location.search).get("attempt");
const stored = JSON.parse(localStorage.getItem(`studysphere_result_${attemptId}`) || "null");
const card = document.querySelector("#result-card");

function getOptionLabel(index) {
  return String.fromCharCode(65 + index);
}

if (!stored) {
  card.innerHTML = '<h1>Không tìm thấy kết quả</h1><p class="detail-description">Kết quả có thể đã bị xóa khỏi trình duyệt.</p><a class="button button-primary" href="exams.html">Về kho đề</a>';
  return;
}

const { result, questions } = stored;
const passed = Number(result.score) >= 5;

function buildReviewMarkup(filter = "all") {
  return questions.map((question, index) => {
    const selectedAnswer = result.answers?.[index];
    const selectedIndex = Number.isInteger(selectedAnswer) ? Number(selectedAnswer) : null;
    const isCorrect = selectedIndex === question.correctAnswer;
    const isWrong = selectedIndex !== null && selectedIndex !== question.correctAnswer;
    const isUnanswered = selectedIndex === null;
    const statusClass = isCorrect ? "is-correct" : isWrong ? "is-wrong" : "is-unanswered";
    const statusText = isCorrect ? "Đúng" : isWrong ? "Sai" : "Bỏ qua";

    const shouldRender = filter === "all" || (filter === "wrong" && isWrong) || (filter === "unanswered" && isUnanswered);
    if (!shouldRender) return "";

    const optionsMarkup = question.options.map((option, optionIndex) => {
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
          <p><strong>Đáp án của bạn:</strong> ${selectedIndex === null ? "Chưa trả lời" : `${getOptionLabel(selectedIndex)}`}</p>
          <p><strong>Đáp án đúng:</strong> ${getOptionLabel(question.correctAnswer)}</p>
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
    <a class="text-link" href="history.html"><span aria-hidden="true">←</span> Quay lại lịch sử</a>
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
`;

const reviewList = document.querySelector("#review-list");
const filterButtons = document.querySelectorAll(".review-filter-button");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedFilter = button.dataset.filter;
    filterButtons.forEach((item) => item.classList.toggle("is-active", item === button));
    reviewList.innerHTML = buildReviewMarkup(selectedFilter);
  });
});

const defaultButton = document.querySelector('.review-filter-button[data-filter="all"]');
if (defaultButton) defaultButton.classList.add("is-active");
