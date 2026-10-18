import { exams as seedExams } from "../data/exams.js";
import { apiClient } from "./apiClient.js";
import { resolvePdfReference } from "./pdfCatalog.js";

const list = document.querySelector("#exam-library-list");
const count = document.querySelector("#exam-library-count");
const status = document.querySelector("#exam-library-status");
const emptyState = document.querySelector("#exam-library-empty");
const emptyTitle = document.querySelector("#exam-library-empty-title");
const emptyMessage = document.querySelector("#exam-library-empty-message");
const searchInput = document.querySelector("#exam-library-search");
const subjectFilter = document.querySelector("#exam-library-subject");
let pdfExams = [];

function normalizeExam(exam) {
  return {
    ...exam,
    id: String(exam.id),
    subjectName: String(exam.subjectName || exam.subject_name || exam.subject || exam.subjectId || exam.subject_id || "Môn học"),
    documentUrl: String(exam.documentUrl || exam.document_url || ""),
  };
}

function readLocalExams() {
  const raw = localStorage.getItem("studysphere_custom_exams");
  if (!raw) return [];
  const records = JSON.parse(raw);
  if (!Array.isArray(records)) throw new Error("Danh sách đề đã lưu trên thiết bị không đúng định dạng.");
  return records.filter((exam) => exam && exam.id !== undefined).map(normalizeExam);
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function render() {
  const query = searchInput.value.trim().toLocaleLowerCase("vi");
  const subject = subjectFilter.value;
  const filtered = pdfExams.filter((exam) => {
    const searchable = `${exam.title || ""} ${exam.subjectName} ${exam.description || ""}`.toLocaleLowerCase("vi");
    return (!query || searchable.includes(query)) && (subject === "all" || exam.subjectName === subject);
  });

  count.textContent = `${filtered.length} đề PDF`;
  list.innerHTML = filtered.map((exam) => {
    const pdfUrl = resolvePdfReference(exam.documentUrl, window.location.href);
    const detailUrl = `exam-detail.html?id=${encodeURIComponent(exam.id)}&return=${encodeURIComponent("exam-library.html")}`;
    const metadata = [
      exam.year ? String(exam.year) : "",
      exam.durationMinutes || exam.duration_minutes ? `${Number(exam.durationMinutes || exam.duration_minutes)} phút` : "",
      exam.typeName || exam.type_name || "",
    ].filter(Boolean);
    return `
      <article class="exam-card">
        <div class="exam-card-top">
          <span class="exam-subject">${escapeHtml(exam.subjectName)}</span>
          <span class="exam-year">${escapeHtml(exam.year || "Đề PDF")}</span>
        </div>
        <h3><a href="${escapeHtml(detailUrl)}">${escapeHtml(exam.title || "Đề thi chưa có tên")}</a></h3>
        <p>${escapeHtml(exam.description || "Đề PDF do quản trị viên tải lên.")}</p>
        <div class="exam-meta">
          <span>${escapeHtml(metadata.join(" · ") || "Tài liệu PDF")}</span>
        </div>
        <div class="exam-library-actions">
          ${pdfUrl ? `<a class="button button-primary" href="${escapeHtml(pdfUrl)}" target="_blank" rel="noopener noreferrer">Xem PDF <span aria-hidden="true">↗</span></a>` : '<span class="exam-library-missing">Chưa tìm thấy file PDF</span>'}
          <a class="text-link" href="${escapeHtml(detailUrl)}">Chi tiết</a>
        </div>
      </article>
    `;
  }).join("");
  emptyState.hidden = filtered.length > 0;
  if (!filtered.length) {
    emptyTitle.textContent = pdfExams.length ? "Không tìm thấy đề phù hợp" : "Chưa có đề PDF";
    emptyMessage.textContent = pdfExams.length
      ? "Thử đổi từ khóa hoặc chọn môn học khác."
      : "Đề PDF được quản trị viên tải lên sẽ xuất hiện tại đây.";
  }
}

async function loadCatalog() {
  const warnings = [];
  let localExams = [];
  let apiExams = [];

  try {
    localExams = readLocalExams();
  } catch (error) {
    warnings.push(error.message);
  }

  try {
    const records = await apiClient.list("exams");
    if (!Array.isArray(records)) throw new Error("Dữ liệu đề thi từ JSON-server không đúng định dạng.");
    apiExams = records.filter((exam) => exam && exam.id !== undefined).map(normalizeExam);
  } catch (error) {
    warnings.push(error.message);
  }

  const merged = new Map();
  for (const exam of [...seedExams.map(normalizeExam), ...localExams, ...apiExams]) {
    if (exam.documentUrl && exam.id) merged.set(exam.id, exam);
  }
  pdfExams = [...merged.values()];

  const subjects = [...new Set(pdfExams.map((exam) => exam.subjectName))]
    .sort((first, second) => first.localeCompare(second, "vi"));
  subjectFilter.replaceChildren(
    new Option("Tất cả môn học", "all"),
    ...subjects.map((subject) => new Option(subject, subject)),
  );

  status.textContent = warnings.length
    ? `Một số nguồn kho đề không tải được: ${warnings.join(" ")}`
    : `Đã tải ${pdfExams.length} đề PDF.`;
  status.classList.toggle("is-error", warnings.length > 0);
  render();
}

searchInput.addEventListener("input", render);
subjectFilter.addEventListener("change", render);
loadCatalog();
