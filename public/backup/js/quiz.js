import { exams } from "../data/exams.js";
import { practiceTests } from "../tests/data/practice-tests.js";
import { createQuestionOrder, isValidQuestionOrder } from "./questionOrder.js";
import { isQuestionAnswerCorrect } from "./questionAnswers.js";

const params = new URLSearchParams(window.location.search);
const examId = params.get("id");
const testId = params.get("test");
const scopePractice = params.get("scope") === "1";
const standaloneTest = practiceTests.find((test) => test.id === testId);
const selectedExam = exams.find((item) => item.id === examId);
let scopePayload = null;
if (scopePractice) {
  try {
    const storedScope = JSON.parse(sessionStorage.getItem("studysphere_scope_quiz") || "null");
    if (Array.isArray(storedScope?.questions) && storedScope.questions.length > 0 && storedScope.scope) {
      scopePayload = storedScope;
    }
  } catch (error) {
    console.error("Unable to read the selected practice scope.", error);
  }
}
const scopeDetails = scopePayload?.scope || null;
const scopeTitle = scopeDetails
  ? `${scopeDetails.subjectName} lớp ${scopeDetails.grade} · ${scopeDetails.topics?.length ? scopeDetails.topics.join(" + ") : "Ôn tập tổng hợp"}`
  : "";
const scopeExamId = scopeDetails
  ? `scope-${scopeDetails.subjectId}-${scopeDetails.grade}-${scopeDetails.topics?.length ? scopeDetails.topics.join("-") : "all"}`
  : "";
const exam = scopePractice
  ? { id: scopeExamId || "invalid-scope", title: scopeTitle || "Ôn tập theo phạm vi", durationMinutes: 45, questions: scopePayload?.questions || [] }
  : standaloneTest || selectedExam || { id: "unavailable", title: "Đề thi chưa sẵn sàng", durationMinutes: 45, questions: [] };
const unavailableQuiz = scopePractice
  ? !scopePayload
  : !standaloneTest && (!selectedExam || !Array.isArray(selectedExam.questions) || selectedExam.questions.length === 0);
const questionPool = (exam.questions || []).map((question) => ({ ...question, type: question.type || (question.answer !== undefined ? "short_answer" : "multiple_choice"), correctAnswer: question.correctAnswer ?? question.correct_answer }));
let questionOrder = scopePractice
  ? createQuestionOrder(questionPool.length)
  : Array.from({ length: questionPool.length }, (_, index) => index);
let questions = questionOrder.map((index) => questionPool[index]);
let currentIndex = 0;
let answers = Array(questions.length).fill(null);
let remainingSeconds = (Number(exam.durationMinutes) || 45) * 60;
let submitted = false;
const progressStorageKey = `studysphere_quiz_progress_${scopePractice ? "scope" : standaloneTest ? "test" : "exam"}_${exam.id}`;

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
const selectQuizLink = document.querySelector(".quiz-select-link");
if (scopePractice && selectQuizLink) selectQuizLink.href = "scope.html";

function getAnswerLabel(answer, question) {
  if (answer === null || answer === undefined || answer === "") return "Chưa chọn";
  if (question.type === "short_answer") return String(answer);
  const option = question.options?.[Number(answer)];
  return option === undefined ? "Chưa chọn" : `${String.fromCharCode(65 + Number(answer))}. ${option}`;
}

function publishStudyAiContext(question) {
  const isScoredAssessment = !scopePractice;
  const context = {
    questionId: `${exam.id}-${question.id || currentIndex}`,
    subject: scopeDetails?.subjectName || standaloneTest?.subjectName || selectedExam?.subjectName || "",
    grade: Number(scopeDetails?.grade || standaloneTest?.grade || selectedExam?.grade || 0) || null,
    topic: question.topic || question.topics?.filter((topic) => topic !== "Ôn tập tổng hợp").join(", ") || "",
    difficulty: question.difficulty || question.difficultyName || standaloneTest?.difficultyName || selectedExam?.difficultyName || "",
    question: question.content ?? question.question ?? "",
    options: question.options || [],
    userAnswer: getAnswerLabel(answers[currentIndex], question),
    assessmentInProgress: isScoredAssessment && !submitted,
  };
  if (!isScoredAssessment) {
    const correctAnswer = question.type === "short_answer"
      ? question.answer ?? question.correctAnswer
      : question.correctAnswer;
    context.correctAnswer = question.type === "short_answer"
      ? String(correctAnswer ?? "")
      : getAnswerLabel(correctAnswer, question);
    context.explanation = question.explanation || "";
  }
  window.studysphereCurrentQuizContext = context;
  document.dispatchEvent(new CustomEvent("studysphere:quiz-context", { detail: context }));
}

function renderQuestion() {
  const question = questions[currentIndex];
  publishStudyAiContext(question);
  progressLabel.textContent = `Câu ${currentIndex + 1} / ${questions.length}`;
  progressValue.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  const answerMarkup = question.type === "short_answer"
    ? `<label class="short-answer-field">Nhập câu trả lời<input type="text" name="answer" value="${answers[currentIndex] || ""}" placeholder="Nhập đáp án ngắn"></label>`
    : question.options.map((option, index) => `<label class="answer-option ${answers[currentIndex] === index ? "selected" : ""}"><input type="radio" name="answer" value="${index}" ${answers[currentIndex] === index ? "checked" : ""}> <span>${String.fromCharCode(65 + index)}. ${option}</span></label>`).join("");
  card.innerHTML = `<p class="question-number">${question.type === "short_answer" ? "Trả lời ngắn" : "Trắc nghiệm"} · Câu hỏi ${String(currentIndex + 1).padStart(2, "0")}${question.difficultyName ? ` · ${question.difficultyName}` : ""}</p>${question.image_url ? `<img class="question-image" style="display:block;max-width:100%;max-height:360px;margin:0 0 24px;border-radius:8px;object-fit:contain" src="${question.image_url}" alt="Hình minh họa cho câu hỏi ${currentIndex + 1}">` : ""}<h1>${question.content}</h1><div class="answer-list">${answerMarkup}</div><button class="button button-quiet study-ai-question-button" id="ask-study-ai" type="button">✨ Hỏi Study AI về câu này</button>`;
  card.querySelector("#ask-study-ai").addEventListener("click", () => {
    document.dispatchEvent(new CustomEvent("studysphere:study-ai-open", {
      detail: { prompt: "Giải thích câu hỏi hiện tại cho mình theo từng bước, đừng chỉ đưa đáp án." },
    }));
  });
  card.querySelectorAll("input").forEach((input) => {
    const updateAnswer = () => {
      answers[currentIndex] = question.type === "short_answer" ? input.value : Number(input.value);
      saveProgress();
      if (question.type === "short_answer") publishStudyAiContext(question);
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
    examTitle: scopePractice ? scopeTitle : exam.title,
    quizKind: scopePractice ? "scope-practice" : standaloneTest ? "practice-test" : "exam",
    submittedAt: new Date().toISOString(),
    score: Number(((correctCount / questions.length) * 10).toFixed(2)),
    totalQuestions: questions.length,
    correctCount,
    wrongCount: answers.filter((answer, index) => answer !== null && answer !== "" && !isQuestionAnswerCorrect(answer, questions[index])).length,
    unansweredCount: answers.filter((answer) => answer === null || answer === "").length,
    answers,
    ...(scopeDetails ? {
      subjectId: scopeDetails.subjectId,
      subjectName: scopeDetails.subjectName,
      grade: scopeDetails.grade,
      topics: scopeDetails.topics || [],
      requestedCount: scopeDetails.requestedCount,
    } : {}),
  };

  const saveLocalResult = () => {
    const history = JSON.parse(localStorage.getItem("studysphere_history") || "[]");
    history.unshift(result);
    localStorage.setItem("studysphere_history", JSON.stringify(history));
    localStorage.setItem(`studysphere_result_${result.attemptId}`, JSON.stringify({ result, questions }));
    const resultPage = standaloneTest || scopePractice ? "../pages/result.html" : "result.html";
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
document.addEventListener("studysphere:study-ai-ready", () => {
  if (!unavailableQuiz) publishStudyAiContext(questions[currentIndex]);
}, { once: true });

if (unavailableQuiz) {
  const returnHref = scopePractice
    ? "scope.html"
    : standaloneTest
      ? "../pages/exam-detail.html?test=" + encodeURIComponent(standaloneTest.id)
      : selectedExam
        ? `exam-detail.html?id=${encodeURIComponent(selectedExam.id)}`
        : "exams.html";
  const unavailableTitle = scopePractice ? "Không tìm thấy lượt luyện tập" : "Đề thi chưa sẵn sàng";
  const unavailableMessage = scopePractice
    ? "Phiên chọn phạm vi không còn hợp lệ. Hãy chọn lại môn, lớp và chủ đề."
    : "Đề này chưa có bộ câu hỏi tương tác hoàn chỉnh nên chưa thể bắt đầu bài làm.";
  document.title = `${unavailableTitle} | StudySphere`;
  title.textContent = unavailableTitle;
  card.innerHTML = `<h1>${unavailableTitle}</h1><p>${unavailableMessage}</p><a class="button button-primary" href="${returnHref}">${scopePractice ? "Quay lại chọn phạm vi" : "Quay lại chi tiết đề"}</a>`;
  document.querySelectorAll("#previous-button, #next-button, #submit-button").forEach((button) => { button.disabled = true; });
  timer.hidden = true;
  dots.hidden = true;
} else {
  renderQuestion();
  renderDots();
  updateTimer();
  setInterval(updateTimer, 1000);
}
