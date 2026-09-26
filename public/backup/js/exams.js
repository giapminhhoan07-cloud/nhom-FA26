import { exams } from "../data/exams.js";

const localExams = (() => { try { return JSON.parse(localStorage.getItem("studysphere_custom_exams") || "[]"); } catch { return []; } })();
let availableExams = [...exams, ...localExams];

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".main-nav a").forEach((link) => link.addEventListener("click", () => mainNav?.classList.remove("open")));

const searchInput = document.querySelector("#search-input");
const filterIds = ["subject-filter", "year-filter", "type-filter", "difficulty-filter"];
const resultCount = document.querySelector("#result-count");
const examList = document.querySelector("#exam-list");
const emptyState = document.querySelector("#empty-state");
const activeFilters = document.querySelector("#active-filters");
const filterPanel = document.querySelector("#filter-panel");
const filterToggle = document.querySelector(".filter-toggle");

const params = new URLSearchParams(window.location.search);
if (params.get("subject")) document.querySelector("#subject-filter").value = params.get("subject");

const getFavorites = () => {
  try { return JSON.parse(localStorage.getItem("studysphere_favorites") || "[]"); } catch { return []; }
};
const setFavorites = (favorites) => localStorage.setItem("studysphere_favorites", JSON.stringify(favorites));

function getFilteredExams() {
  const query = searchInput.value.trim().toLowerCase();
  const values = Object.fromEntries(filterIds.map((id) => [id, document.querySelector(`#${id}`).value]));
  return availableExams.filter((exam) => {
    const matchesQuery = !query || `${exam.title} ${exam.subjectName} ${exam.typeName}`.toLowerCase().includes(query);
    return matchesQuery && (values["subject-filter"] === "all" || exam.subjectId === values["subject-filter"])
      && (values["year-filter"] === "all" || String(exam.year) === values["year-filter"])
      && (values["type-filter"] === "all" || exam.type === values["type-filter"])
      && (values["difficulty-filter"] === "all" || exam.difficulty === values["difficulty-filter"]);
  });
}

function renderCard(exam) {
  const favorites = getFavorites();
  const isFavorite = favorites.includes(exam.id);
  const destination = exam.questions?.length
    ? `quiz.html?id=${encodeURIComponent(exam.id)}`
    : `exam-detail.html?id=${encodeURIComponent(exam.id)}`;
  const linkLabel = exam.questions?.length ? `Bắt đầu làm bài: ${exam.title}` : `Xem ${exam.title}`;
  return `<article class="exam-card"><div class="exam-card-top"><span class="exam-subject">${exam.subjectName}</span><span class="exam-year">${exam.year}</span></div><h3>${exam.title}</h3><p>${exam.description}</p><div class="exam-meta"><span>◷ ${exam.durationMinutes} phút</span><span>▤ ${exam.questionCount} câu</span></div><button class="favorite-button ${isFavorite ? "saved" : ""}" data-favorite="${exam.id}" type="button" aria-label="${isFavorite ? "Bỏ lưu" : "Lưu"} ${exam.title}">${isFavorite ? "♥" : "♡"}</button><a class="exam-card-link" href="${destination}" aria-label="${linkLabel}">↗</a></article>`;
}

function renderFilters() {
  const labels = { "subject-filter": "Môn", "year-filter": "Năm", "type-filter": "Loại", "difficulty-filter": "Mức độ" };
  activeFilters.innerHTML = filterIds.map((id) => {
    const select = document.querySelector(`#${id}`);
    if (select.value === "all") return "";
    const text = select.options[select.selectedIndex].text;
    return `<span class="filter-chip">${labels[id]}: ${text}<button type="button" data-clear-filter="${id}" aria-label="Xóa bộ lọc ${labels[id]}">×</button></span>`;
  }).join("");
}

function render() {
  const filtered = getFilteredExams();
  resultCount.textContent = `${filtered.length} đề thi`;
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

async function loadExams() {
  try {
    const response = await fetch("../api/exams.php");
    const result = await response.json();
    if (response.ok && result.success && result.exams.length) availableExams = [...result.exams, ...localExams];
  } catch {
    availableExams = exams;
  }
  render();
}

loadExams();
