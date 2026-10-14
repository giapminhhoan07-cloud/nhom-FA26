import { exams } from "../data/exams.js";
import { searchExams } from "./examSearch.js";
import { apiClient } from "./apiClient.js";
import { getCurrentUser, readUserCollection, writeUserCollection } from "./userData.js";
import { createPdfObjectUrl, getExamGrade, mergeExamCatalog, verifyPdfDocument } from "./pdfCatalog.js";

let availableExams = [];
let allExams = [...exams];

const searchInput = document.querySelector("#search-input");
const filterIds = ["grade-filter", "subject-filter", "year-filter", "type-filter", "difficulty-filter"];
const resultCount = document.querySelector("#result-count");
const examList = document.querySelector("#exam-list");
const emptyState = document.querySelector("#empty-state");
const activeFilters = document.querySelector("#active-filters");
const filterPanel = document.querySelector("#filter-panel");
const filterToggle = document.querySelector(".filter-toggle");
const apiStatus = document.querySelector("#catalog-status");
const currentUser = getCurrentUser();

const params = new URLSearchParams(window.location.search);
const getFavorites = () => {
  if (currentUser) return readUserCollection(currentUser, "favorites", "studysphere_favorites").map(String);
  try { return JSON.parse(localStorage.getItem("studysphere_favorites") || "[]").map(String); } catch { return []; }
};
const setFavorites = (favorites) => {
  if (currentUser) writeUserCollection(currentUser, "favorites", favorites);
  else localStorage.setItem("studysphere_favorites", JSON.stringify(favorites));
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function populateFilters() {
  const filterData = {
    "subject-filter": [...new Map(availableExams.map((exam) => [String(exam.subjectId || exam.subjectName), exam.subjectName || exam.subject || exam.subjectId]).filter(([value, label]) => value && label))],
    "year-filter": [...new Set(availableExams.map((exam) => Number(exam.year)).filter(Number.isFinite))].sort((first, second) => second - first).map((year) => [String(year), String(year)]),
    "type-filter": [...new Map(availableExams.map((exam) => [String(exam.type || exam.examType || ""), exam.typeName || exam.examTypeName || exam.type || exam.examType]).filter(([value, label]) => value && label))],
    "difficulty-filter": [...new Map(availableExams.map((exam) => [String(exam.difficulty || ""), exam.difficultyName || exam.difficulty]).filter(([value, label]) => value && label))],
  };

  for (const [id, options] of Object.entries(filterData)) {
    const select = document.querySelector(`#${id}`);
    const previousValue = params.get(id.replace("-filter", "")) || select.value;
    select.replaceChildren(new Option(id === "subject-filter" ? "Tất cả môn" : id === "year-filter" ? "Tất cả năm" : id === "type-filter" ? "Tất cả loại đề" : "Tất cả mức độ", "all"));
    options.forEach(([value, label]) => select.add(new Option(label, value)));
    if ([...select.options].some((option) => option.value === previousValue)) select.value = previousValue;
  }
}

function getFilteredExams() {
  const values = Object.fromEntries(filterIds.map((id) => [id, document.querySelector(`#${id}`).value]));
  return searchExams(availableExams, searchInput.value).filter((exam) => {
    return (values["grade-filter"] === "all" || String(getExamGrade(exam)) === values["grade-filter"])
      && (values["subject-filter"] === "all" || String(exam.subjectId || exam.subjectName || exam.subject) === values["subject-filter"])
      && (values["year-filter"] === "all" || String(exam.year) === values["year-filter"])
      && (values["type-filter"] === "all" || String(exam.type || exam.examType) === values["type-filter"])
      && (values["difficulty-filter"] === "all" || exam.difficulty === values["difficulty-filter"]);
  });
}

function renderCard(exam) {
  const favorites = getFavorites();
  const isFavorite = favorites.includes(String(exam.id));
  const grade = getExamGrade(exam);
  const duration = Number(exam.durationMinutes ?? exam.duration);
  const subject = exam.subjectName || exam.subject || exam.subjectId || "Môn học chưa cập nhật";
  const difficulty = exam.difficultyName || ({ easy: "Cơ bản", medium: "Trung bình", hard: "Khó" })[exam.difficulty] || "Độ khó chưa cập nhật";
  const type = exam.typeName || exam.examTypeName || exam.type || exam.examType || "Đề thi";
  return `<article class="exam-card pdf-exam-card"><div class="exam-card-top"><span class="exam-subject">${escapeHtml(subject)}</span><span class="exam-year">${grade ? `Lớp ${grade}` : escapeHtml(exam.year || "PDF")}</span></div><span class="exam-readiness">PDF đã xác minh</span><h3>${escapeHtml(exam.title)}</h3><p>${escapeHtml(exam.description || type)}</p><div class="exam-meta"><span>${duration > 0 ? `◷ ${duration} phút` : "◷ Thời gian chưa cập nhật"}</span><span>${escapeHtml(difficulty)}</span></div><button class="favorite-button ${isFavorite ? "saved" : ""}" data-favorite="${escapeHtml(exam.id)}" type="button" aria-label="${isFavorite ? "Bỏ lưu" : "Lưu"} ${escapeHtml(exam.title)}" aria-pressed="${isFavorite}">${isFavorite ? "♥" : "♡"}</button><div class="pdf-exam-actions"><a class="button button-primary" href="${escapeHtml(exam._pdfHref)}" target="_blank" rel="noreferrer">Mở PDF <span aria-hidden="true">↗</span></a><a class="button button-secondary" href="${escapeHtml(exam._pdfHref)}" download>Tải xuống</a></div></article>`;
}

function renderFilters() {
  const labels = { "grade-filter": "Lớp", "subject-filter": "Môn", "year-filter": "Năm", "type-filter": "Loại", "difficulty-filter": "Mức độ" };
  activeFilters.innerHTML = filterIds.map((id) => {
    const select = document.querySelector(`#${id}`);
    if (select.value === "all") return "";
    const text = select.options[select.selectedIndex].text;
    return `<span class="filter-chip">${labels[id]}: ${text}<button type="button" data-clear-filter="${id}" aria-label="Xóa bộ lọc ${labels[id]}">×</button></span>`;
  }).join("");
}

function render() {
  const filtered = getFilteredExams();
  resultCount.textContent = `${filtered.length} đề PDF`;
  renderFilters();
  examList.innerHTML = filtered.map(renderCard).join("");
  emptyState.hidden = filtered.length > 0;
}

function clearFilters() {
  searchInput.value = "";
  filterIds.forEach((id) => { document.querySelector(`#${id}`).value = "all"; });
  render();
}

searchInput.addEventListener("input", render);
filterIds.forEach((id) => document.querySelector(`#${id}`).addEventListener("change", render));
document.querySelector("#clear-filters").addEventListener("click", clearFilters);
document.querySelector("#empty-clear").addEventListener("click", clearFilters);
filterToggle.addEventListener("click", () => { const isOpen = filterPanel.classList.toggle("open"); filterToggle.setAttribute("aria-expanded", String(isOpen)); });
activeFilters.addEventListener("click", (event) => { const button = event.target.closest("[data-clear-filter]"); if (!button) return; document.querySelector(`#${button.dataset.clearFilter}`).value = "all"; render(); });
examList.addEventListener("click", (event) => { const button = event.target.closest("[data-favorite]"); if (!button) return; const favorites = getFavorites(); const index = favorites.indexOf(button.dataset.favorite); index >= 0 ? favorites.splice(index, 1) : favorites.push(button.dataset.favorite); setFavorites(favorites); render(); });

async function loadCatalog() {
  try {
    const apiExams = await apiClient.list("exams");
    if (!Array.isArray(apiExams)) throw new Error("Danh sách đề từ JSON-server không đúng định dạng.");
    const normalizedApiExams = apiExams.map((exam) => ({
      ...exam,
      id: String(exam.id),
      grade: getExamGrade(exam),
      subjectId: String(exam.subjectId || exam.subject || exam.subjectName || ""),
      subjectName: String(exam.subjectName || exam.subject || exam.subjectId || "Môn học chưa cập nhật"),
      type: String(exam.type || exam.examType || ""),
      typeName: String(exam.typeName || exam.examTypeName || exam.type || exam.examType || "Đề thi"),
      difficultyName: exam.difficultyName || ({ easy: "Cơ bản", medium: "Trung bình", hard: "Khó" })[exam.difficulty] || exam.difficulty || "Độ khó chưa cập nhật",
      durationMinutes: Number(exam.durationMinutes ?? exam.duration) || null,
    }));
    allExams = mergeExamCatalog(exams, normalizedApiExams);
    apiStatus.textContent = `Đã đọc ${apiExams.length} đề từ JSON-server.`;
  } catch (error) {
    allExams = [...exams];
    apiStatus.textContent = `${error.message} Đang dùng danh sách PDF có sẵn.`;
    apiStatus.classList.add("is-error");
  }

  const candidates = allExams.filter((exam) => typeof exam.documentUrl === "string" && exam.documentUrl.trim());
  const objectUrls = [];
  const verified = await Promise.all(candidates.map(async (exam) => {
    const verifiedUrl = await verifyPdfDocument(exam.documentUrl, window.location.href);
    const pdfHref = verifiedUrl.startsWith("data:application/pdf;base64,")
      ? createPdfObjectUrl(verifiedUrl)
      : verifiedUrl;
    if (pdfHref.startsWith("blob:")) objectUrls.push(pdfHref);
    return pdfHref ? { ...exam, _pdfHref: pdfHref } : null;
  }));
  window.addEventListener("pagehide", () => objectUrls.forEach((url) => URL.revokeObjectURL(url)), { once: true });
  availableExams = verified.filter(Boolean);
  populateFilters();
  apiStatus.textContent += ` · ${availableExams.length} tệp PDF khả dụng.`;
  render();
}

loadCatalog();
