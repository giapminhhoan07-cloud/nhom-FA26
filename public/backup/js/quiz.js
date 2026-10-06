import { exams } from "../data/exams.js";
import { questions as bundledQuestions } from "../data/questions.js";
import { practiceTests } from "../tests/data/practice-tests.js";
import { createQuestionOrder, isValidQuestionOrder } from "./questionOrder.js";
import { isQuestionAnswerCorrect } from "./questionAnswers.js";

const params = new URLSearchParams(window.location.search);
const examId = params.get("id");
const testId = params.get("test");
const standaloneTest = practiceTests.find((test) => test.id === testId);
let exam = standaloneTest || exams.find((item) => item.id === examId) || exams[0];
const questionPool = (exam.questions || bundledQuestions).map((question) => ({ ...question, type: question.type || (question.answer !== undefined ? "short_answer" : "multiple_choice"), correctAnswer: question.correctAnswer ?? question.correct_answer }));
let questionOrder = createQuestionOrder(questionPool.length);
let questions = questionOrder.map((index) => questionPool[index]);
let currentIndex = 0;
let answers = Array(questions.length).fill(null);
let remainingSeconds = (Number(exam.durationMinutes) || 45) * 60;
let submitted = false;
const progressStorageKey = `studysphere_quiz_progress_${standaloneTest ? "test" : "exam"}_${exam.id}`;

function restoreProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(progressStorageKey) || "null");
    if (!saved || !Array.isArray(saved.answers) || saved.answers.length > questionPool.length) return;
    const savedLength = saved.answers.length;
    const savedOrder = Array.isArray(saved.questionOrder)
      ? saved.questionOrder
      : Array.from({ length: savedLength }, (_, index) => index);
    if (!isValidQuestionOrder(savedOrder, savedLength)) return;
    questionOrder = [...savedOrder, ...Array.from({ length: questionPool.length - savedLength }, (_, index) => savedLength + index)];
    questions = questionOrder.map((index) => questionPool[index]);
    answers = [...saved.answers, ...Array(questionPool.length - savedLength).fill(null)];
    currentIndex = Math.min(Math.max(Number(saved.currentIndex) || 0, 0), questions.length - 1);
    remainingSeconds = Math.max(Number(saved.remainingSeconds) || 0, 0);
  } catch {
    localStorage.removeItem(progressStorageKey);
  }
}

function saveProgress() {
  if (submitted) return;
  localStorage.setItem(progressStorageKey, JSON.stringify({
    answers,
    questionOrder,
    currentIndex,
    remainingSeconds,
    savedAt: new Date().toISOString(),
  }));
}

function clearProgress() {
  localStorage.removeItem(progressStorageKey);
}

restoreProgress();

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
  card.querySelectorAll("input").forEach((input) => {
    const updateAnswer = () => {
      answers[currentIndex] = question.type === "short_answer" ? input.value : Number(input.value);
      saveProgress();
      if (question.type !== "short_answer") {
        renderQuestion();
        renderDots();
      }
    };
    input.addEventListener(question.type === "short_answer" ? "input" : "change", updateAnswer);
  });
  document.querySelector("#previous-button").disabled = currentIndex === 0;
  document.querySelector("#next-button").textContent = currentIndex === questions.length - 1 ? "Xem lại bài →" : "Câu tiếp theo →";
}
function renderDots() { dots.innerHTML = questions.map((_, index) => `<button class="dot ${index === currentIndex ? "current" : ""} ${answers[index] !== null && answers[index] !== "" ? "answered" : ""}" type="button" data-index="${index}">${index + 1}</button>`).join(""); }
async function submitQuiz() {
  if (submitted) return;
  submitted = true;
  clearProgress();

  const correctCount = answers.reduce((total, answer, index) => total + (isQuestionAnswerCorrect(answer, questions[index]) ? 1 : 0), 0);
  const result = {
    attemptId: `attempt-${Date.now()}`,
    examId: exam.id,
    examTitle: exam.title,
    quizKind: standaloneTest ? "practice-test" : "exam",
    submittedAt: new Date().toISOString(),
    score: Number(((correctCount / questions.length) * 10).toFixed(2)),
    totalQuestions: questions.length,
    correctCount,
    wrongCount: answers.filter((answer, index) => answer !== null && answer !== "" && !isQuestionAnswerCorrect(answer, questions[index])).length,
    unansweredCount: answers.filter((answer) => answer === null || answer === "").length,
    answers,
  };

  const saveLocalResult = () => {
    const history = JSON.parse(localStorage.getItem("studysphere_history") || "[]");
    history.unshift(result);
    localStorage.setItem("studysphere_history", JSON.stringify(history));
    localStorage.setItem(`studysphere_result_${result.attemptId}`, JSON.stringify({ result, questions }));
    const resultPage = standaloneTest ? "../pages/result.html" : "result.html";
    window.location.href = `${resultPage}?attempt=${encodeURIComponent(result.attemptId)}`;
  };

  saveLocalResult();
}
function updateTimer() { const minutes = Math.floor(remainingSeconds / 60); const seconds = remainingSeconds % 60; timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`; timer.classList.toggle("warning", remainingSeconds <= 300 && remainingSeconds > 60); timer.classList.toggle("danger", remainingSeconds <= 60); if (remainingSeconds <= 0) { submitQuiz(); return; } remainingSeconds -= 1; saveProgress(); }

document.querySelector("#previous-button").addEventListener("click", () => { if (currentIndex > 0) { currentIndex -= 1; saveProgress(); renderQuestion(); renderDots(); } });
document.querySelector("#next-button").addEventListener("click", () => { if (currentIndex < questions.length - 1) { currentIndex += 1; saveProgress(); renderQuestion(); renderDots(); } else { document.querySelector("#submit-button").focus(); } });
dots.addEventListener("click", (event) => { const button = event.target.closest("[data-index]"); if (button) { currentIndex = Number(button.dataset.index); saveProgress(); renderQuestion(); renderDots(); } });
document.querySelector("#submit-button").addEventListener("click", () => { if (window.confirm("Bạn chắc chắn muốn nộp bài?")) submitQuiz(); });
window.addEventListener("pagehide", saveProgress);
renderQuestion(); renderDots(); updateTimer(); setInterval(updateTimer, 1000);
