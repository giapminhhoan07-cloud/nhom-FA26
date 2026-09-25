import { exams } from "../data/exams.js";

const localExams = (() => { try { return JSON.parse(localStorage.getItem("studysphere_custom_exams") || "[]"); } catch { return []; } })();
const createDefaultTest = () => ({
  id: "default-test-20-mc-5-short",
  title: "Bài test tổng hợp 20 trắc nghiệm + 5 trả lời ngắn",
  subjectName: "Tổng hợp",
  difficulty: "medium",
  durationMinutes: 60,
  description: "Bài test mẫu gồm 20 câu trắc nghiệm và 5 câu trả lời ngắn.",
  questions: Array.from({ length: 25 }, (_, index) => index < 20
    ? { id: `default-q-${index + 1}`, type: "multiple_choice", content: `Câu trắc nghiệm mẫu ${index + 1}: đáp án đúng là gì?`, options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], correct_answer: 0 }
    : { id: `default-q-${index + 1}`, type: "short_answer", content: `Câu trả lời ngắn mẫu ${index - 19}: nhập đáp án.`, answer: "Đáp án mẫu" })
});
const sourceExam = exams.find((item) => item.difficulty === "medium") || createDefaultTest();
const sourceQuestions = sourceExam.questions || [];
const testQuestions = Array.from({ length: 25 }, (_, index) => {
  if (index < 20) {
    const source = sourceQuestions[index] || {};
    return {
      id: source.id || `grade12-medium-q-${index + 1}`,
      type: "multiple_choice",
      content: source.content || `Câu trắc nghiệm Toán lớp 12 mức trung bình ${index + 1}?`,
      options: source.options || ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      correct_answer: source.correct_answer ?? source.correctAnswer ?? 0,
      explanation: source.explanation || "Đáp án được chọn theo cấu trúc đề mẫu."
    };
  }
  return { id: `grade12-medium-q-${index + 1}`, type: "short_answer", content: `Câu trả lời ngắn Toán lớp 12 ${index - 19}?`, answer: "Đáp án mẫu", explanation: "Đáp án mẫu của bài test." };
});
const exam = { ...sourceExam, id: "grade12-medium-test", title: "Bài test lớp 12 - Mức trung bình", questionCount: 25, question_count: 25, questions: testQuestions };
localStorage.setItem("studysphere_custom_exams", JSON.stringify([...localExams.filter((item) => item.id !== exam.id), exam]));
const questionCount = exam.questionCount || exam.question_count || (exam.questions ? exam.questions.length : 25);
const difficultyNames = { easy: "Cơ bản", medium: "Trung bình", hard: "Khá khó" };
const card = document.querySelector("#test-card");

card.innerHTML = `<div class="detail-top"><span class="exam-subject">${exam.subjectName || exam.subject_name || "Tổng hợp"}</span><span class="detail-label">${difficultyNames[exam.difficulty] || exam.difficultyName || "Trung bình"}</span></div><h2>${exam.title}</h2><p class="detail-description">${exam.description || "Bài test tổng hợp để kiểm tra nhanh kiến thức của bạn."}</p><div class="detail-stats"><div><strong>${questionCount}</strong><span>Số câu hỏi</span></div><div><strong>${exam.durationMinutes || exam.duration_minutes || 60}</strong><span>Phút làm bài</span></div><div><strong>20 + 5</strong><span>Trắc nghiệm + trả lời ngắn</span></div></div><div class="detail-actions"><a class="button button-primary" href="quiz.html?id=${encodeURIComponent(exam.id)}">Bắt đầu làm bài <span aria-hidden="true">→</span></a><a class="button button-quiet" href="exams.html">Chọn đề khác</a></div>`;

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});