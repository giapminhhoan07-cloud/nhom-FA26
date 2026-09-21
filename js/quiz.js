import { exams } from "../data/exams.js";
import { questions } from "../data/questions.js";

const examId = new URLSearchParams(window.location.search).get("id");
const exam = exams.find((item) => item.id === examId) || exams[0];
let currentIndex = 0;
let answers = Array(questions.length).fill(null);
let remainingSeconds = 45 * 60;
let submitted = false;

const title = document.querySelector("#quiz-title");
const timer = document.querySelector("#timer");
const card = document.querySelector("#question-card");
const dots = document.querySelector("#question-dots");
const progressLabel = document.querySelector("#progress-label");
const progressValue = document.querySelector("#progress-value");
title.textContent = exam.title;

function renderQuestion() {
  const question = questions[currentIndex];
  progressLabel.textContent = `Câu ${currentIndex + 1} / ${questions.length}`;
  progressValue.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  card.innerHTML = `<p class="question-number">Câu hỏi ${String(currentIndex + 1).padStart(2, "0")}</p><h1>${question.content}</h1><div class="answer-list">${question.options.map((option, index) => `<label class="answer-option ${answers[currentIndex] === index ? "selected" : ""}"><input type="radio" name="answer" value="${index}" ${answers[currentIndex] === index ? "checked" : ""}> <span>${String.fromCharCode(65 + index)}. ${option}</span></label>`).join("")}</div>`;
  card.querySelectorAll("input").forEach((input) => input.addEventListener("change", () => { answers[currentIndex] = Number(input.value); renderQuestion(); renderDots(); }));
  document.querySelector("#previous-button").disabled = currentIndex === 0;
  document.querySelector("#next-button").textContent = currentIndex === questions.length - 1 ? "Xem lại bài →" : "Câu tiếp theo →";
}
function renderDots() { dots.innerHTML = questions.map((_, index) => `<button class="dot ${index === currentIndex ? "current" : ""} ${answers[index] !== null ? "answered" : ""}" type="button" data-index="${index}">${index + 1}</button>`).join(""); }
async function submitQuiz() {
  if (submitted) return;
  submitted = true;

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("studysphere_current_user") || "null");
    } catch {
      return null;
    }
  })();

  const correctCount = answers.reduce((total, answer, index) => total + (answer === questions[index].correctAnswer ? 1 : 0), 0);
  const result = {
    attemptId: `attempt-${Date.now()}`,
    examId: exam.id,
    examTitle: exam.title,
    submittedAt: new Date().toISOString(),
    score: Number(((correctCount / questions.length) * 10).toFixed(2)),
    totalQuestions: questions.length,
    correctCount,
    wrongCount: answers.filter((answer, index) => answer !== null && answer !== questions[index].correctAnswer).length,
    unansweredCount: answers.filter((answer) => answer === null).length,
    answers,
  };

  const payload = {
    action: "save_attempt",
    user_id: currentUser?.id ?? 0,
    exam_id: exam.id,
    score: result.score,
    total_questions: result.totalQuestions,
    correct_count: result.correctCount,
    wrong_count: result.wrongCount,
    unanswered_count: result.unansweredCount,
    answers: questions.map((question, index) => ({
      question_id: question.id,
      selected_answer: answers[index],
      is_correct: answers[index] === question.correctAnswer ? 1 : 0,
    })),
  };

  try {
    const response = await fetch("../api/attempts.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Không thể lưu bài làm.");
    }

    const localHistory = JSON.parse(localStorage.getItem("studysphere_history") || "[]");
    localHistory.unshift({ ...result, attemptId: String(data.attempt_id || result.attemptId) });
    localStorage.setItem("studysphere_history", JSON.stringify(localHistory));
    localStorage.setItem(`studysphere_result_${result.attemptId}`, JSON.stringify({ result, questions }));

    window.location.href = `result.html?attempt=${encodeURIComponent(data.attempt_id || result.attemptId)}`;
  } catch (error) {
    console.error(error);
    const history = JSON.parse(localStorage.getItem("studysphere_history") || "[]");
    history.unshift(result);
    localStorage.setItem("studysphere_history", JSON.stringify(history));
    localStorage.setItem(`studysphere_result_${result.attemptId}`, JSON.stringify({ result, questions }));
    window.location.href = `result.html?attempt=${result.attemptId}`;
  }
}
function updateTimer() { const minutes = Math.floor(remainingSeconds / 60); const seconds = remainingSeconds % 60; timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`; timer.classList.toggle("warning", remainingSeconds <= 300 && remainingSeconds > 60); timer.classList.toggle("danger", remainingSeconds <= 60); if (remainingSeconds <= 0) submitQuiz(); remainingSeconds -= 1; }

document.querySelector("#previous-button").addEventListener("click", () => { if (currentIndex > 0) { currentIndex -= 1; renderQuestion(); renderDots(); } });
document.querySelector("#next-button").addEventListener("click", () => { if (currentIndex < questions.length - 1) { currentIndex += 1; renderQuestion(); renderDots(); } else { document.querySelector("#submit-button").focus(); } });
dots.addEventListener("click", (event) => { const button = event.target.closest("[data-index]"); if (button) { currentIndex = Number(button.dataset.index); renderQuestion(); renderDots(); } });
document.querySelector("#submit-button").addEventListener("click", () => { if (window.confirm("Bạn chắc chắn muốn nộp bài?")) submitQuiz(); });
renderQuestion(); renderDots(); updateTimer(); setInterval(updateTimer, 1000);
