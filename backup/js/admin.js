const currentUser = (() => {
  try { return JSON.parse(localStorage.getItem("studysphere_current_user") || "null"); } catch { return null; }
})();

const isAdmin = currentUser && (currentUser.role === "admin" || currentUser.is_admin === true || currentUser.isAdmin === true || Number(currentUser.is_admin) === 1);

if (!isAdmin) {
  window.location.replace("auth.html?return=admin");
}

const form = document.querySelector("#exam-form");
const list = document.querySelector("#admin-exam-list");
const formMessage = document.querySelector("#form-message");
const listMessage = document.querySelector("#list-message");
const fileInput = document.querySelector("#exam-file");
const imageInput = document.querySelector("#question-images");
const localExamKey = "studysphere_custom_exams";
const getLocalExams = () => { try { return JSON.parse(localStorage.getItem(localExamKey) || "[]"); } catch { return []; } };
const setLocalExams = (items) => localStorage.setItem(localExamKey, JSON.stringify(items));

function createQuestionTemplate() {
  return Array.from({ length: 25 }, (_, index) => index < 20
    ? { id: `q-${index + 1}`, type: "multiple_choice", content: `Câu trắc nghiệm ${index + 1}?`, options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"], correct_answer: 0, explanation: "Giải thích đáp án." }
    : { id: `q-${index + 1}`, type: "short_answer", content: `Câu trả lời ngắn ${index - 19}?`, answer: "Đáp án mẫu", explanation: "Giải thích đáp án." });
}

function validateQuestions(questions) {
  const multipleChoice = questions.filter((question) => question.type !== "short_answer");
  const shortAnswer = questions.filter((question) => question.type === "short_answer");
  if (multipleChoice.length !== 20 || shortAnswer.length !== 5) throw new Error("Đề phải có đúng 20 câu trắc nghiệm và 5 câu trả lời ngắn.");
  if (multipleChoice.some((question) => !Array.isArray(question.options) || question.options.length < 2 || question.correct_answer === undefined)) throw new Error("Mỗi câu trắc nghiệm cần có options và correct_answer.");
  if (shortAnswer.some((question) => !String(question.answer || "").trim())) throw new Error("Mỗi câu trả lời ngắn cần có answer.");
}

const setMessage = (element, text, success = false) => {
  element.textContent = text;
  element.classList.toggle("success", success);
};

async function request(payload) {
  try {
    const response = await fetch("../api/admin-exams.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (response.status === 403) {
      localStorage.removeItem("studysphere_current_user");
      window.location.replace("auth.html?return=admin");
    }
    if (response.ok) return result;
  } catch {
    // Browser-only fallback when the PHP API is unavailable.
  }

  const localExams = getLocalExams();
  if (payload.action === "list") return { exams: localExams };
  if (payload.action === "get") return { exam: localExams.find((item) => item.id === payload.id) };
  if (payload.action === "delete") {
    setLocalExams(localExams.filter((item) => item.id !== payload.id));
    return { message: "Đã xóa đề thi." };
  }
  const subjectNames = { toan: "Toán", "ngu-van": "Ngữ văn", "tieng-anh": "Tiếng Anh", "vat-ly": "Vật lý", "dia-li": "Địa lí", "lich-su": "Lịch sử" };
  const difficultyNames = { easy: "Cơ bản", medium: "Trung bình", hard: "Khá khó" };
  const exam = { ...payload, subject_name: subjectNames[payload.subject_id] || payload.subject_id, subjectName: subjectNames[payload.subject_id] || payload.subject_id, exam_type: payload.exam_type, type: payload.exam_type, typeName: payload.exam_type, difficultyName: difficultyNames[payload.difficulty] || payload.difficulty, question_count: payload.questions.length, questionCount: payload.questions.length, duration_minutes: payload.duration_minutes, durationMinutes: payload.duration_minutes };
  if (payload.action === "update") setLocalExams(localExams.map((item) => item.id === exam.id ? exam : item));
  else setLocalExams([...localExams.filter((item) => item.id !== exam.id), exam]);
  return { message: "Đã lưu đề thi." };
}

function getFormPayload() {
  const data = new FormData(form);
  let questions;
  try { questions = JSON.parse(data.get("questions")); } catch { throw new Error("Danh sách câu hỏi phải là JSON hợp lệ."); }
  validateQuestions(questions);
  return { action: document.querySelector("#exam-action").value, id: data.get("id").trim(), title: data.get("title").trim(), subject_id: data.get("subject_id"), year: Number(data.get("year")), exam_type: data.get("exam_type").trim(), difficulty: data.get("difficulty"), duration_minutes: Number(data.get("duration_minutes")), description: data.get("description").trim(), featured: data.get("featured") === "on" ? 1 : 0, questions };
}

function resetForm() {
  form.reset();
  document.querySelector("#exam-action").value = "create";
  document.querySelector("#form-title").textContent = "Upload đề mới";
  document.querySelector("#exam-id").readOnly = false;
  document.querySelector("#exam-year").value = 2026;
  document.querySelector("#exam-duration").value = 60;
  document.querySelector("#exam-questions").value = JSON.stringify(createQuestionTemplate(), null, 2);
  setMessage(formMessage, "");
}

function fillForm(exam) {
  document.querySelector("#exam-action").value = "create";
  document.querySelector("#form-title").textContent = "Upload đề mới";
  document.querySelector("#exam-id").readOnly = false;
  document.querySelector("#exam-id").value = exam.id || "";
  document.querySelector("#exam-title").value = exam.title || "";
  document.querySelector("#exam-subject").value = exam.subject_id || exam.subjectId || "toan";
  document.querySelector("#exam-year").value = exam.year || 2026;
  document.querySelector("#exam-type").value = exam.exam_type || exam.type || "on-tap";
  document.querySelector("#exam-difficulty").value = exam.difficulty || "medium";
  document.querySelector("#exam-duration").value = exam.duration_minutes || exam.durationMinutes || 60;
  document.querySelector("#exam-description").value = exam.description || "";
  document.querySelector("#exam-featured").checked = Boolean(exam.featured);
  document.querySelector("#exam-questions").value = JSON.stringify(exam.questions || [], null, 2);
}

function renderList(exams) {
  if (!exams.length) { list.innerHTML = '<div class="admin-empty">Chưa có đề thi trong cơ sở dữ liệu.</div>'; return; }
  list.innerHTML = exams.map((exam) => `<article class="admin-exam-item"><div><span>${exam.subject_name} · ${exam.year}</span><h3>${exam.title}</h3><small>${exam.question_count} câu · ${exam.duration_minutes} phút</small></div><div class="admin-item-actions"><button class="admin-edit" type="button" data-edit="${exam.id}">Sửa</button><button class="admin-delete" type="button" data-delete="${exam.id}">Xóa</button></div></article>`).join("");
}

async function loadExams() {
  try { const result = await request({ action: "list" }); renderList(result.exams); } catch (error) { setMessage(listMessage, error.message); }
}

async function editExam(id) {
  try {
    const result = await request({ action: "get", id });
    const exam = result.exam;
    document.querySelector("#exam-action").value = "update";
    document.querySelector("#form-title").textContent = "Chỉnh sửa đề thi";
    document.querySelector("#exam-id").value = exam.id;
    document.querySelector("#exam-title").value = exam.title;
    document.querySelector("#exam-subject").value = exam.subject_id;
    document.querySelector("#exam-year").value = exam.year;
    document.querySelector("#exam-type").value = exam.exam_type;
    document.querySelector("#exam-difficulty").value = exam.difficulty;
    document.querySelector("#exam-duration").value = exam.duration_minutes;
    document.querySelector("#exam-description").value = exam.description || "";
    document.querySelector("#exam-featured").checked = Number(exam.featured) === 1;
    document.querySelector("#exam-questions").value = JSON.stringify(exam.questions, null, 2);
    document.querySelector("#exam-id").readOnly = true;
    document.querySelector("#form-title").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) { setMessage(listMessage, error.message); }
}

list.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit]");
  const deleteButton = event.target.closest("[data-delete]");
  if (editButton) await editExam(editButton.dataset.edit);
  if (deleteButton && window.confirm("Xóa đề thi này? Lịch sử và đề yêu thích liên quan cũng sẽ bị xóa.")) {
    try { await request({ action: "delete", id: deleteButton.dataset.delete }); setMessage(listMessage, "Đã xóa đề thi.", true); await loadExams(); } catch (error) { setMessage(listMessage, error.message); }
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try { const result = await request(getFormPayload()); resetForm(); setMessage(formMessage, result.message, true); await loadExams(); } catch (error) { setMessage(formMessage, error.message); }
});

document.querySelector("#new-exam-button").addEventListener("click", resetForm);
document.querySelector("#reset-form").addEventListener("click", resetForm);
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const payload = JSON.parse(reader.result);
      fillForm(payload.exam || payload);
      setMessage(formMessage, `Đã đọc file ${file.name}. Kiểm tra lại rồi bấm Lưu đề thi.`, true);
    } catch {
      setMessage(formMessage, "File đề không đúng định dạng JSON.");
    }
  });
  reader.readAsText(file);
});
imageInput.addEventListener("change", async () => {
  const files = [...imageInput.files];
  if (!files.length) return;
  try {
    const questions = JSON.parse(document.querySelector("#exam-questions").value);
    const images = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result));
      reader.addEventListener("error", reject);
      reader.readAsDataURL(file);
    })));
    questions.forEach((question, index) => { if (images[index]) question.image_url = images[index]; });
    document.querySelector("#exam-questions").value = JSON.stringify(questions, null, 2);
    setMessage(formMessage, `${images.length} ảnh đã gắn vào câu hỏi theo thứ tự.`, true);
  } catch {
    setMessage(formMessage, "Hãy nhập danh sách câu hỏi JSON hợp lệ trước khi chọn ảnh.");
  }
});
resetForm();
loadExams();