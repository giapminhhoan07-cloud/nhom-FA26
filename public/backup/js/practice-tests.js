import {
  practiceTests,
  testDifficulties,
  testExamTypes,
  testSubjects,
  upcomingTests,
} from "../data/practice-tests.js";

const list = document.querySelector("#practice-test-list");
const emptyState = document.querySelector("#practice-test-empty");
const count = document.querySelector("#practice-test-count");
const scope = document.querySelector("#practice-test-scope");
const subjectFilter = document.querySelector("#subject-filter");
const searchInput = document.querySelector("#test-search");
const typeFilter = document.querySelector("#type-filter");
const difficultyFilter = document.querySelector("#difficulty-filter");
const clearButtons = [
  document.querySelector("#clear-test-filters"),
  document.querySelector("#empty-clear-test-filters"),
];
const icons = Object.fromEntries(testSubjects.map((subject) => [subject.id, subject.icon]));
const availableTests = practiceTests.map((test) => ({
  ...test,
  grade: Number(test.grade) || 12,
  questionCount: test.questions?.length || 0,
  status: "available",
}));
const allTests = [...availableTests, ...upcomingTests];
const requestedSubject = new URLSearchParams(window.location.search).get("subject");
const state = {
  grade: "12",
  subject: testSubjects.some((subject) => subject.id === requestedSubject) ? requestedSubject : "all",
  search: "",
  type: "all",
  difficulty: "all",
};
const getFavoriteIds = () => {
  try {
    return JSON.parse(localStorage.getItem("studysphere_favorites") || "[]");
  } catch {
    return [];
  }
};
let favoriteIds = getFavoriteIds();

subjectFilter.insertAdjacentHTML("beforeend", testSubjects.map((subject) =>
  `<option value="${subject.id}">${subject.name}</option>`,
).join(""));
subjectFilter.value = state.subject;
typeFilter.insertAdjacentHTML("beforeend", [
  ...testExamTypes.map((type) => `<option value="${type.id}">${type.name}</option>`),
  '<option value="review">Ôn tập</option>',
].join(""));
difficultyFilter.insertAdjacentHTML("beforeend", testDifficulties.map((difficulty) =>
  `<option value="${difficulty.id}">${difficulty.name}</option>`,
).join(""));

function getFilteredTests() {
  const query = state.search.trim().toLocaleLowerCase("vi");

  return allTests.filter((test) => {
    const matchesGrade = state.grade === "all" || test.grade === Number(state.grade);
    const matchesSubject = state.subject === "all" || test.subjectId === state.subject;
    const matchesType = state.type === "all" || test.examType === state.type;
    const matchesDifficulty = state.difficulty === "all" || test.difficulty === state.difficulty;
    const searchableText = [
      test.title,
      test.subjectName,
      `Lớp ${test.grade}`,
      test.examTypeName,
    ].join(" ").toLocaleLowerCase("vi");

    const matchesSearch = !query || query.split(/\s+/).every((term) => searchableText.includes(term));

    return matchesGrade && matchesSubject && matchesType && matchesDifficulty && matchesSearch;
  });
}

function renderCard(test) {
  const metadata = `
    <span class="practice-test-meta-item">${test.examTypeName}</span>
    <span class="practice-test-meta-item">${test.durationMinutes} phút</span>
    <span class="practice-test-meta-item">${test.questionCount} câu</span>
    <span class="practice-test-meta-item">${test.difficultyName}</span>
  `;
  const subject = `
    <span class="practice-test-subject">
      <span class="practice-test-icon" aria-hidden="true">${icons[test.subjectId] || "•"}</span>
      <span>${test.subjectName} · Lớp ${test.grade}</span>
    </span>
  `;

  if (test.status === "available" && Array.isArray(test.questions) && test.questions.length > 0) {
    const isSaved = favoriteIds.includes(test.id);
    return `
      <article class="practice-test-card">
        ${subject}
        <div class="practice-test-card-actions">
          <span class="test-status is-available">Có thể làm</span>
          <button class="test-favorite-button ${isSaved ? "is-saved" : ""}" type="button" data-test-favorite="${test.id}" aria-label="${isSaved ? "Bỏ lưu" : "Lưu"} ${test.title}" aria-pressed="${isSaved}">${isSaved ? "♥" : "♡"}</button>
        </div>
        <h2>${test.title}</h2>
        <p>${test.description}</p>
        <div class="practice-test-meta">${metadata}</div>
        <a class="practice-test-start" href="quiz.html?test=${encodeURIComponent(test.id)}">
          <span>Làm bài</span><span aria-hidden="true">→</span>
        </a>
      </article>
    `;
  }

  return `
    <article class="practice-test-card is-upcoming">
      ${subject}
      <span class="test-status">Sắp mở</span>
      <h2>${test.title}</h2>
      <p>${test.description}</p>
      <div class="practice-test-meta">${metadata}</div>
      <div class="practice-test-start is-disabled" aria-label="Đề chưa có câu hỏi">Đang biên soạn</div>
    </article>
  `;
}

function render() {
  const filteredTests = getFilteredTests();
  const selectedGrade = state.grade === "all" ? "Tất cả lớp" : `Lớp ${state.grade}`;
  const selectedSubject = state.subject === "all"
    ? "Tất cả môn"
    : testSubjects.find((subject) => subject.id === state.subject)?.name;

  count.textContent = `${filteredTests.length} đề kiểm tra`;
  scope.textContent = `${selectedGrade} · ${selectedSubject}`;
  list.innerHTML = filteredTests.map(renderCard).join("");
  emptyState.hidden = filteredTests.length > 0;
  list.hidden = filteredTests.length === 0;
}

document.querySelectorAll("[data-grade]").forEach((button) => {
  button.addEventListener("click", () => {
    state.grade = button.dataset.grade;
    document.querySelectorAll("[data-grade]").forEach((option) => {
      const isActive = option === button;
      option.classList.toggle("is-active", isActive);
      option.setAttribute("aria-pressed", String(isActive));
    });
    render();
  });
});

subjectFilter.addEventListener("change", () => {
  state.subject = subjectFilter.value;
  render();
});
searchInput.addEventListener("input", () => {
  state.search = searchInput.value;
  render();
});
typeFilter.addEventListener("change", () => {
  state.type = typeFilter.value;
  render();
});
difficultyFilter.addEventListener("change", () => {
  state.difficulty = difficultyFilter.value;
  render();
});

function clearFilters() {
  state.grade = "all";
  state.subject = "all";
  state.search = "";
  state.type = "all";
  state.difficulty = "all";
  subjectFilter.value = "all";
  searchInput.value = "";
  typeFilter.value = "all";
  difficultyFilter.value = "all";
  document.querySelectorAll("[data-grade]").forEach((button) => {
    const isActive = button.dataset.grade === "all";
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  render();
}

clearButtons.forEach((button) => button.addEventListener("click", clearFilters));

list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-test-favorite]");
  if (!button) return;

  const testId = button.dataset.testFavorite;
  const favoriteIndex = favoriteIds.indexOf(testId);
  if (favoriteIndex >= 0) favoriteIds.splice(favoriteIndex, 1);
  else favoriteIds.push(testId);
  localStorage.setItem("studysphere_favorites", JSON.stringify(favoriteIds));
  render();
});

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

render();