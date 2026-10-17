import { exams } from "../data/exams.js";
import { practiceTests } from "../tests/data/practice-tests.js";
import { createQuestionOrder, isValidQuestionOrder } from "./questionOrder.js";
import { isQuestionAnswerCorrect } from "./questionAnswers.js";
import { apiClient } from "./apiClient.js";
import { hideSkeleton, showSkeleton } from "./skeleton.js";
import { recordGamificationCompletion } from "./gamification.js";
import { createNotifications, createStudyRecommendationNotifications } from "./notifications.js";
import { getStudyRecommendations } from "./studyRecommendations.js";
import { getCurrentUser, getUserDataKey, readUserCollection, readUserData, writeUserCollection } from "./userData.js";

const params = new URLSearchParams(window.location.search);
const examId = params.get("id");
const testId = params.get("test");
const scopePractice = params.get("scope") === "1";
const standaloneTest = practiceTests.find((test) => test.id === testId);
let selectedExam = exams.find((item) => String(item.id) === examId);
if (!selectedExam && examId) {
  showSkeleton(document.querySelector("#question-card"), "question");
  try {
    const records = await apiClient.list("exams", { id: examId });
    const record = records.find((item) => String(item.id) === examId);
    if (record && Array.isArray(record.questions) && record.questions.length) {
      selectedExam = {
        ...record,
        id: String(record.id),
        title: String(record.title || "Đề thi"),
        subjectId: record.subjectId || record.subject || "",
        subjectName: record.subjectName || record.subject || "",
        durationMinutes: Number(record.durationMinutes ?? record.duration) || 45,
        questions: record.questions,
      };
    }
  } catch {
    // Static and saved practice tests remain available when JSON-server is offline.
  }
}
const currentUser = getCurrentUser();
const currentUserId = String(currentUser?.id || currentUser?.email || "");
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
let submitting = false;
let submitFailed = false;
let pendingResult = null;
const progressStorageKey = `studysphere_quiz_progress_${encodeURIComponent(currentUserId || "guest")}_${scopePractice ? "scope" : standaloneTest ? "test" : "exam"}_${exam.id}`;

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
const submitButton = document.querySelector("#submit-button");
const submitStatus = document.querySelector("#submit-status");
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
  card.innerHTML = `<p class="question-number">${question.type === "short_answer" ? "Trả lời ngắn" : "Trắc nghiệm"} · Câu hỏi ${String(currentIndex + 1).padStart(2, "0")}${question.difficultyName ? ` · ${question.difficultyName}` : ""}</p>${question.image_url ? `<img class="question-image" style="display:block;max-width:100%;max-height:360px;margin:0 0 24px;border-radius:8px;object-fit:contain" src="${question.image_url}" alt="Hình minh họa cho câu hỏi ${currentIndex + 1}">` : ""}<h1>${question.content}</h1><div class="answer-list">${answerMarkup}</div>`;
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
  if (submitted || submitting) return;
  submitting = true;
  submitFailed = false;
  submitButton.disabled = true;
  submitButton.textContent = "Đang lưu bài...";
  submitStatus.hidden = true;

  try {
    if (!pendingResult) {
      const correctCount = answers.reduce((total, answer, index) => total + (isQuestionAnswerCorrect(answer, questions[index]) ? 1 : 0), 0);
      pendingResult = {
        attemptId: `attempt-${globalThis.crypto?.randomUUID?.() || Date.now()}`,
        userId: currentUserId || null,
        examId: exam.id,
        examTitle: scopePractice ? scopeTitle : exam.title,
        quizKind: scopePractice ? "scope-practice" : standaloneTest ? "practice-test" : "exam",
        subjectId: scopeDetails?.subjectId || standaloneTest?.subjectId || selectedExam?.subjectId || questionPool.find((question) => question.subjectId)?.subjectId || "",
        subjectName: scopeDetails?.subjectName || standaloneTest?.subjectName || selectedExam?.subjectName || questionPool.find((question) => question.subjectName || question.subject)?.subjectName || questionPool.find((question) => question.subject)?.subject || "",
        grade: Number(scopeDetails?.grade || standaloneTest?.grade || selectedExam?.grade || questionPool.find((question) => question.grade)?.grade) || Number(exam.title.match(/\b(?:lớp\s*)?(10|11|12)\b/i)?.[1]) || null,
        topics: [...new Set([
          ...(scopeDetails?.topics || []),
          ...questionPool.flatMap((question) => [
            ...(Array.isArray(question.topics) ? question.topics : []),
            ...(typeof question.topic === "string" ? [question.topic] : []),
          ]),
        ])],
        submittedAt: new Date().toISOString(),
        score: Number(((correctCount / questions.length) * 10).toFixed(2)),
        totalQuestions: questions.length,
        correctCount,
        wrongCount: answers.filter((answer, index) => answer !== null && answer !== "" && !isQuestionAnswerCorrect(answer, questions[index])).length,
        unansweredCount: answers.filter((answer) => answer === null || answer === "").length,
        answers: [...answers],
        ...(scopeDetails ? {
          subjectId: scopeDetails.subjectId,
          subjectName: scopeDetails.subjectName,
          grade: scopeDetails.grade,
          topics: scopeDetails.topics || [],
          requestedCount: scopeDetails.requestedCount,
        } : {}),
      };
    }

    const result = pendingResult;
    const resultKey = currentUser
      ? getUserDataKey(currentUser, `result_${result.attemptId}`)
      : `studysphere_guest_result_${result.attemptId}`;
    localStorage.setItem(resultKey, JSON.stringify({ result, questions }));
    submitted = true;
    clearProgress();

    const historyKey = currentUser ? "studysphere_history" : "studysphere_guest_history";
    try {
      const history = currentUser
        ? readUserCollection(currentUser, "history", historyKey)
        : JSON.parse(localStorage.getItem(historyKey) || "[]");
      const deduplicatedHistory = Array.isArray(history)
        ? history.filter((item) => String(item.attemptId || item.id) !== result.attemptId)
        : [];
      deduplicatedHistory.unshift(result);
      if (currentUser) writeUserCollection(currentUser, "history", deduplicatedHistory);
      else localStorage.setItem(historyKey, JSON.stringify(deduplicatedHistory));
    } catch (error) {
      console.error("Không thể cập nhật lịch sử làm bài.", error);
    }

    if (currentUser) {
      const previousHistory = readUserCollection(currentUser, "history", "studysphere_history");
      const attemptDetails = previousHistory.map((entry) => {
        if (String(entry.attemptId || entry.id || "") === result.attemptId) return null;
        if (Array.isArray(entry.questions)) return entry;
        const attemptId = String(entry.attemptId || entry.id || "");
        return attemptId
          ? readUserData(currentUser, `result_${attemptId}`, null, { legacyKey: `studysphere_result_${attemptId}` })
          : null;
      }).filter((entry) => entry && Array.isArray(entry.questions));
      const recommendations = getStudyRecommendations([...attemptDetails, { result, questions }]).recommendations;
      createStudyRecommendationNotifications(currentUser, recommendations);

      try {
        await apiClient.create("attempts", { id: result.attemptId, attemptId: result.attemptId, ...result, questions });
      } catch {
        // Keep the completed attempt in this account's local history.
      }

      try {
        const award = recordGamificationCompletion(currentUser, result);
        if (award.awarded) {
          if (award.streakUpdated) {
            try {
              createNotifications([currentUser], {
                type: "streak",
                title: award.state.streak === 1 ? "Chuỗi học tập đã bắt đầu!" : "Bạn đã duy trì streak!",
                message: award.state.streak === 1
                  ? "Bạn đã hoàn thành bài học hôm nay. Hãy quay lại vào ngày mai để tiếp tục streak."
                  : `Bạn đã học liên tiếp ${award.state.streak} ngày. Tiếp tục giữ nhịp nhé!`,
                link: "/backup/pages/profile.html",
              });
            } catch (error) {
              console.error("Không thể lưu thông báo streak.", error);
            }
          }
          const updatedUser = { ...currentUser, xp: award.state.xp, level: award.state.level, streak: award.state.streak };
          for (const key of ["studysphere_current_user", "studysphere_session", "studysphere_user_session"]) {
            localStorage.setItem(key, JSON.stringify(updatedUser));
          }
          if (currentUser.id && !String(currentUser.id).startsWith("local-")) {
            await apiClient.update("users", currentUser.id, {
              xp: award.state.xp,
              level: award.state.level,
              streak: award.state.streak,
              lastStudyDate: award.state.lastStudyDate,
            });
          }
          for (const badgeId of award.newBadges) {
            await apiClient.create("userAchievements", {
              id: `${currentUserId}-${badgeId}`,
              userId: currentUserId,
              achievementId: badgeId,
              earnedAt: new Date().toISOString(),
            });
          }
        }
      } catch {
        // The local gamification record remains authoritative when API sync fails.
      }
    }

    const resultPage = standaloneTest || scopePractice ? "../pages/result.html" : "result.html";
    window.location.href = `${resultPage}?attempt=${encodeURIComponent(result.attemptId)}`;
  } catch (error) {
    console.error("Không thể lưu kết quả bài thi.", error);
    submitting = false;
    submitFailed = true;
    submitButton.disabled = false;
    submitButton.textContent = "Thử nộp lại";
    submitStatus.textContent = "Chưa lưu được kết quả trên thiết bị. Bài làm vẫn được giữ; hãy kiểm tra dung lượng trình duyệt rồi thử lại.";
    submitStatus.hidden = false;
  }
}
function updateTimer() { const minutes = Math.floor(remainingSeconds / 60); const seconds = remainingSeconds % 60; timer.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`; timer.classList.toggle("warning", remainingSeconds <= 300 && remainingSeconds > 60); timer.classList.toggle("danger", remainingSeconds <= 60); if (remainingSeconds <= 0) { if (!submitFailed) submitQuiz(); return; } remainingSeconds -= 1; saveProgress(); }

document.querySelector("#previous-button").addEventListener("click", () => { if (currentIndex > 0) { currentIndex -= 1; saveProgress(); renderQuestion(); renderDots(); } });
document.querySelector("#next-button").addEventListener("click", () => { if (currentIndex < questions.length - 1) { currentIndex += 1; saveProgress(); renderQuestion(); renderDots(); } else { document.querySelector("#submit-button").focus(); } });
dots.addEventListener("click", (event) => { const button = event.target.closest("[data-index]"); if (button) { currentIndex = Number(button.dataset.index); saveProgress(); renderQuestion(); renderDots(); } });
document.querySelector("#submit-button").addEventListener("click", () => { if (window.confirm("Bạn chắc chắn muốn nộp bài?")) submitQuiz(); });
window.addEventListener("pagehide", saveProgress);
document.addEventListener("studysphere:study-ai-ready", () => {
  if (!unavailableQuiz) publishStudyAiContext(questions[currentIndex]);
}, { once: true });

if (unavailableQuiz) {
  hideSkeleton(card);
  const returnHref = scopePractice
    ? "scope.html"
    : standaloneTest
      ? "../pages/exam-detail.html?test=" + encodeURIComponent(standaloneTest.id)
      : selectedExam
        ? `exam-detail.html?id=${encodeURIComponent(selectedExam.id)}`
        : "../tests/index.html";
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
  hideSkeleton(card);
  renderQuestion();
  renderDots();
  updateTimer();
  setInterval(updateTimer, 1000);
}
