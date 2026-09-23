const currentUser = (() => {
  try { return JSON.parse(localStorage.getItem("studysphere_current_user") || "null"); } catch { return null; }
})();

if (!currentUser || currentUser.role !== "admin") {
  window.location.replace("auth.html?return=admin");
}

const form = document.querySelector("#exam-form");
const list = document.querySelector("#admin-exam-list");
const formMessage = document.querySelector("#form-message");
const listMessage = document.querySelector("#list-message");
const documentInput = document.querySelector("#exam-document-file");

const setMessage = (element, text, success = false) => {
  element.textContent = text;
  element.classList.toggle("success", success);
};

const localExamKey = "studysphere_admin_exams";
const subjectNames = { "toan": "Toán", "ngu-van": "Ngữ văn", "tieng-anh": "Tiếng Anh", "vat-ly": "Vật lý", "dia-li": "Địa lí", "lich-su": "Lịch sử" };
const getLocalExams = () => {
  try { return JSON.parse(localStorage.getItem(localExamKey) || "[]"); } catch { return []; }
};
const setLocalExams = (exams) => localStorage.setItem(localExamKey, JSON.stringify(exams));
const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => resolve(reader.result));
  reader.addEventListener("error", reject);
  reader.readAsDataURL(file);
});
const localRequest = (payload) => {
  const exams = getLocalExams();
  if (payload.action === "list") return { success: true, exams };
  if (payload.action === "get") {
    const exam = exams.find((item) => item.id === payload.id);
    if (!exam) throw new Error("Không tìm thấy đề thi.");
    return { success: true, exam };
  }
  if (payload.action === "delete") {
    setLocalExams(exams.filter((item) => item.id !== payload.id));
    return { success: true, message: "Đã xóa đề thi." };
  }
  const exam = { ...payload, subject_name: subjectNames[payload.subject_id] || payload.subject_id, question_count: payload.questions.length, duration_minutes: payload.duration_minutes };
  if (payload.action === "update") {
    setLocalExams(exams.map((item) => item.id === payload.id ? exam : item));
    return { success: true, message: "Đã cập nhật đề thi." };
  }
  if (exams.some((item) => item.id === payload.id)) throw new Error("Mã đề đã tồn tại.");
  setLocalExams([...exams, exam]);
  return { success: true, message: "Đã lưu đề thi." };
};

async function request(payload) {
  try {
    const response = await fetch("../api/admin-exams.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (response.ok) return result;
  } catch {
    // Use local storage when the PHP API is unavailable on the static deployment.
  }
  return localRequest(payload);
}

async function getFormPayload() {
  const data = new FormData(form);
  const documentFile = documentInput.files[0];
  const documentUrl = documentFile?.type === "application/pdf" ? await readFileAsDataUrl(documentFile) : document.querySelector("#exam-document-url").value;
  return { action: document.querySelector("#exam-action").value, id: data.get("id").trim(), title: data.get("title").trim(), subject_id: data.get("subject_id"), year: Number(data.get("year")), exam_type: data.get("exam_type").trim(), difficulty: data.get("difficulty"), duration_minutes: Number(data.get("duration_minutes")), description: data.get("description").trim(), featured: data.get("featured") === "on" ? 1 : 0, documentUrl, questions: [] };
}

function resetForm() {
  form.reset();
  document.querySelector("#exam-action").value = "create";
  document.querySelector("#form-title").textContent = "Upload đề mới";
  document.querySelector("#exam-id").readOnly = false;
  document.querySelector("#exam-year").value = 2026;
  document.querySelector("#exam-duration").value = 60;
  document.querySelector("#exam-document-url").value = "";
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
  document.querySelector("#exam-document-url").value = exam.documentUrl || exam.document_url || "";
  document.querySelector("#exam-featured").checked = Boolean(exam.featured);
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
    document.querySelector("#exam-document-url").value = exam.documentUrl || exam.document_url || "";
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
  try { const result = await request(await getFormPayload()); resetForm(); setMessage(formMessage, result.message, true); await loadExams(); } catch (error) { setMessage(formMessage, error.message); }
});

document.querySelector("#new-exam-button").addEventListener("click", resetForm);
document.querySelector("#reset-form").addEventListener("click", resetForm);
documentInput.addEventListener("change", () => {
  const file = documentInput.files[0];
  if (!file) return;
  setMessage(formMessage, `Đã chọn file PDF ${file.name}. Bấm Lưu đề thi để lưu tài liệu.`, true);
});
loadExams();