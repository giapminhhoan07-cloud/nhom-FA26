import { exams } from "../data/exams.js";
import { questions as bundledQuestions } from "../data/questions.js";

const examId = new URLSearchParams(window.location.search).get("id");
const localExams = (() => { try { return JSON.parse(localStorage.getItem("studysphere_custom_exams") || "[]"); } catch { return []; } })();
let exam = [...exams, ...localExams].find((item) => item.id === examId) || exams[0];
let questions = exam.questions || bundledQuestions;
try { const response = await fetch(`../api/exams.php?id=${encodeURIComponent(examId || exam.id)}`); const result = await response.json(); if (response.ok && result.success) { exam = result.exam; questions = result.exam.questions; } } catch { /* Use bundled fallback when PHP is unavailable. */ }
questions = questions.map((question) => ({ ...question, type: question.type || (question.answer !== undefined ? "short_answer" : "multiple_choice"), correctAnswer: question.correctAnswer ?? question.correct_answer }));
let currentIndex = 0;
let answers = Array(questions.length).fill(null);
let remainingSeconds = (Number(exam.durationMinutes) || 45) * 60;
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
  const answerMarkup = question.type === "short_answer"
    ? `<label class="short-answer-field">Nhập câu trả lời<input type="text" name="answer" value="${answers[currentIndex] || ""}" placeholder="Nhập đáp án ngắn"></label>`
    : question.options.map((option, index) => `<label class="answer-option ${answers[currentIndex] === index ? "selected" : ""}"><input type="radio" name="answer" value="${index}" ${answers[currentIndex] === index ? "checked" : ""}> <span>${String.fromCharCode(65 + index)}. ${option}</span></label>`).join("");
  card.innerHTML = `<p class="question-number">${question.type === "short_answer" ? "Trả lời ngắn" : "Trắc nghiệm"} · Câu hỏi ${String(currentIndex + 1).padStart(2, "0")}${question.difficultyName ? ` · ${question.difficultyName}` : ""}</p>${question.image_url ? `<img class="question-image" style="display:block;max-width:100%;max-height:360px;margin:0 0 24px;border-radius:8px;object-fit:contain" src="${question.image_url}" alt="Hình minh họa cho câu hỏi ${currentIndex + 1}">` : ""}<h1>${question.content}</h1><div class="answer-list">${answerMarkup}</div>`;
  card.querySelectorAll("input").forEach((input) => input.addEventListener("change", () => { answers[currentIndex] = question.type === "short_answer" ? input.value : Number(input.value); renderQuestion(); renderDots(); }));
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

  const isCorrect = (answer, question) => question.type === "short_answer"
    ? String(answer || "").trim().toLowerCase() === String(question.answer || "").trim().toLowerCase()
    : answer === question.correctAnswer;
  const correctCount = answers.reduce((total, answer, index) => total + (isCorrect(answer, questions[index]) ? 1 : 0), 0);
  const result = {
    attemptId: `attempt-${Date.now()}`,
    examId: exam.id,
    examTitle: exam.title,
    submittedAt: new Date().toISOString(),
    score: Number(((correctCount / questions.length) * 10).toFixed(2)),
    totalQuestions: questions.length,
    correctCount,
    wrongCount: answers.filter((answer, index) => answer !== null && !isCorrect(answer, questions[index])).length,
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
      is_correct: isCorrect(answers[index], question) ? 1 : 0,
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
