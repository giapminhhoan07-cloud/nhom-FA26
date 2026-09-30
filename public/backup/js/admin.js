import { exams } from "../data/exams.js";

(() => {
const currentUser = (() => {
  try { return JSON.parse(localStorage.getItem("studysphere_current_user") || "null"); } catch { return null; }
})();

const isAdmin = currentUser && (currentUser.role === "admin" || currentUser.is_admin === true || currentUser.isAdmin === true || Number(currentUser.is_admin) === 1);

if (!isAdmin) {
  window.location.replace("auth.html?return=admin");
  return;
}

const form = document.querySelector("#exam-form");
const list = document.querySelector("#admin-exam-list");
const formMessage = document.querySelector("#form-message");
const listMessage = document.querySelector("#list-message");
const fileInput = document.querySelector("#exam-file");
const exportPanel = document.querySelector("#export-panel");
const exportNote = document.querySelector("#export-note");
const exportSource = document.querySelector("#export-source");
const copyExportButton = document.querySelector("#copy-export");
const downloadExportButton = document.querySelector("#download-export");

const setMessage = (element, text, success = false) => {
  element.textContent = text;
  element.classList.toggle("success", success);
};

function getFormPayload() {
  const data = new FormData(form);
  const file = fileInput.files[0];
  if (!file) throw new Error("Vui lòng chọn file PDF của đề thi.");
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("File đã chọn không phải PDF.");

  const id = data.get("id").trim();
  if (exams.some((exam) => exam.id === id)) throw new Error("Mã đề đã tồn tại trong kho đề.");
  const subjectId = data.get("subject_id");
  const subjectNames = { toan: "Toán", "ngu-van": "Ngữ văn", "tieng-anh": "Tiếng Anh", "vat-ly": "Vật lý", "dia-li": "Địa lí", "lich-su": "Lịch sử" };
  const type = data.get("exam_type");
  const typeNames = { "minh-hoa": "Đề minh họa", "khao-sat": "Đề khảo sát", "thi-thu": "Đề thi thử", "on-tap": "Đề ôn tập", thpt: "Tốt nghiệp THPT" };
  const difficulty = data.get("difficulty");
  const difficultyNames = { easy: "Cơ bản", medium: "Trung bình", hard: "Khá khó" };
  const exam = {
    id,
    title: data.get("title").trim(),
    subjectId,
    subjectName: subjectNames[subjectId] || subjectId,
    year: Number(data.get("year")),
    type,
    typeName: typeNames[type],
    difficulty,
    difficultyName: difficultyNames[difficulty],
    durationMinutes: Number(data.get("duration_minutes")),
    questionCount: 0,
    description: data.get("description").trim(),
    documentUrl: `../documents/${id}.pdf`,
    featured: data.get("featured") === "on",
  };
  return { exam, pdfPath: `public/backup/documents/${id}.pdf` };
}

function resetForm() {
  form.reset();
  document.querySelector("#exam-action").value = "create";
  document.querySelector("#form-title").textContent = "Upload đề mới";
  document.querySelector("#exam-id").readOnly = false;
  document.querySelector("#exam-year").value = 2026;
  document.querySelector("#exam-duration").value = 60;
  exportPanel.hidden = true;
  exportSource.value = "";
  copyExportButton.disabled = true;
  downloadExportButton.disabled = true;
  setMessage(formMessage, "");
}

function renderList(exams) {
  if (!exams.length) { list.innerHTML = '<div class="admin-empty">Chưa có đề thi trong kho dữ liệu.</div>'; return; }
  list.innerHTML = exams.map((exam) => {
    const duration = Number(exam.durationMinutes) > 0 ? `${exam.durationMinutes} phút` : "Xem trong PDF";
    return `<article class="admin-exam-item"><div><span>${exam.subjectName} · ${exam.year}</span><h3>${exam.title}</h3><small>${exam.typeName} · ${duration}</small></div><span class="admin-exam-source">${exam.documentUrl ? "PDF trong repo" : "Chưa gắn PDF"}</span></article>`;
  }).join("");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  try {
    const { exam, pdfPath } = getFormPayload();
    const updatedExams = [...exams, exam];
    exportSource.value = `export const exams = ${JSON.stringify(updatedExams, null, 2)};\n`;
    exportNote.textContent = `Hãy chép PDF đã chọn tới ${pdfPath}, sau đó tải exams.js bên dưới và thay file public/backup/data/exams.js. Commit cả hai file để nhóm cùng truy cập.`;
    exportPanel.hidden = false;
    copyExportButton.disabled = false;
    downloadExportButton.disabled = false;
    setMessage(formMessage, "Đã tạo dữ liệu đề. Chưa có file nào được lưu tự động vào repo.", true);
  } catch (error) {
    setMessage(formMessage, error.message);
  }
});

document.querySelector("#new-exam-button").addEventListener("click", resetForm);
document.querySelector("#reset-form").addEventListener("click", resetForm);
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    fileInput.value = "";
    setMessage(formMessage, "Vui lòng chọn đúng file PDF.");
    return;
  }
  setMessage(formMessage, `Đã chọn ${file.name}. Sau khi tạo bản ghi, chép PDF vào thư mục documents theo tên mã đề.`, true);
});

copyExportButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(exportSource.value);
    setMessage(formMessage, "Đã sao chép dữ liệu exams.js.", true);
  } catch {
    exportSource.select();
    document.execCommand("copy");
    setMessage(formMessage, "Đã chọn nội dung. Nhấn Ctrl+C để sao chép.");
  }
});

downloadExportButton.addEventListener("click", () => {
  const file = new Blob([exportSource.value], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "exams.js";
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
});

renderList(exams);
resetForm();
document.querySelector("#exam-year").value = new Date().getFullYear();
})();