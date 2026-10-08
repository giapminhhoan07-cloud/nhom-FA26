import {
  practiceTests,
  testDifficulties,
  testCatalogExamTypes,
  testGrades,
  testSubjects,
  upcomingTests,
} from "../data/practice-tests.js";
import {
  getQuestionSubjects,
  getScopeQuestions,
  getScopeTopics,
  practiceQuestionBank,
  selectRandomQuestions,
} from "../../js/practiceScopes.js";

const list = document.querySelector("#practice-test-list");
const emptyState = document.querySelector("#practice-test-empty");
const count = document.querySelector("#practice-test-count");
const scope = document.querySelector("#practice-test-scope");
const subjectFilter = document.querySelector("#subject-filter");
const searchInput = document.querySelector("#test-search");
const typeFilter = document.querySelector("#type-filter");
const difficultyFilter = document.querySelector("#difficulty-filter");
const readyTestList = document.querySelector("#ready-test-list");
const scopePanel = document.querySelector("#scope-practice-panel");
const fullExamSection = document.querySelector("#full-exam-section");
const scopeSubject = document.querySelector("#scope-subject");
const scopeGrade = document.querySelector("#scope-grade");
const scopeTopicList = document.querySelector("#scope-topic-list");
const scopeSelectedCount = document.querySelector("#scope-selected-count");
const scopeTopicStatus = document.querySelector("#scope-topic-status");
const scopeQuestionCount = document.querySelector("#scope-question-count");
const scopeSummary = document.querySelector("#scope-summary");
const scopeAvailableCount = document.querySelector("#scope-available-count");
const scopeStartButton = document.querySelector("#scope-start-button");
const scopeError = document.querySelector("#scope-error");
const scopeInsufficient = document.querySelector("#scope-insufficient");
const scopeInsufficientMessage = document.querySelector("#scope-insufficient-message");
const scopeStartAvailable = document.querySelector("#scope-start-available");
const scopeBackToSelect = document.querySelector("#scope-back-to-select");
const modeButtons = [...document.querySelectorAll("[data-practice-mode]")];
const clearButtons = [
  document.querySelector("#clear-test-filters"),
  document.querySelector("#empty-clear-test-filters"),
];
const icons = Object.fromEntries(testSubjects.map((subject) => [subject.id, subject.icon]));
const availableTests = practiceTests.map((test) => ({
  ...test,
  subject: test.subjectName,
  grade: Number(test.grade) || 12,
  questions: practiceQuestionBank.filter((question) => question.sourceTestId === test.id),
  topics: [...new Set(practiceQuestionBank
    .filter((question) => question.sourceTestId === test.id)
    .flatMap((question) => question.topics)
    .filter((topic) => topic !== "Ôn tập tổng hợp"))],
  questionCount: practiceQuestionBank.filter((question) => question.sourceTestId === test.id).length,
  status: "available",
}));
const allTests = [...availableTests, ...upcomingTests];
const pageParams = new URLSearchParams(window.location.search);
const requestedGrade = pageParams.get("grade");
const requestedSubject = pageParams.get("subject");
const requestedType = pageParams.get("type");
const requestedDifficulty = pageParams.get("difficulty");
const state = {
  grade: ["all", "10", "11", "12"].includes(requestedGrade) ? requestedGrade : "12",
  subject: testSubjects.some((subject) => subject.id === requestedSubject) ? requestedSubject : "all",
  search: pageParams.get("search") || "",
  type: testCatalogExamTypes.some((type) => type.id === requestedType) ? requestedType : "all",
  difficulty: testDifficulties.some((difficulty) => difficulty.id === requestedDifficulty) ? requestedDifficulty : "all",
};
const getFavoriteIds = () => {
  try {
    return JSON.parse(localStorage.getItem("studysphere_favorites") || "[]");
  } catch {
    return [];
  }
};
let favoriteIds = getFavoriteIds();

const requestedScopeSubject = pageParams.get("subject");
const questionSubjects = getQuestionSubjects();
const scopeState = {
  subjectId: questionSubjects.some((subject) => subject.id === requestedScopeSubject)
    ? requestedScopeSubject
    : questionSubjects[0]?.id || testSubjects[0].id,
  grade: testGrades.includes(Number(pageParams.get("grade"))) ? Number(pageParams.get("grade")) : 12,
  selectedTopics: pageParams.getAll("topic"),
};

scopeSubject.innerHTML = testSubjects.map((subject) =>
  `<option value="${subject.id}">${subject.name}</option>`,
).join("");
scopeSubject.value = scopeState.subjectId;
scopeGrade.innerHTML = testGrades.map((grade) => `<option value="${grade}">Lớp ${grade}</option>`).join("");
scopeGrade.value = String(scopeState.grade);

function setPracticeMode(mode) {
  const scopeMode = mode === "scope";
  scopePanel.hidden = !scopeMode;
  fullExamSection.hidden = scopeMode;
  modeButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.practiceMode === mode)));
  if (scopeMode) renderScopeSelection();
}

function getSelectedScopeTopics() {
  const allCheckbox = scopeTopicList.querySelector('[data-scope-all]');
  if (!allCheckbox || allCheckbox.checked) return [];
  return [...scopeTopicList.querySelectorAll("[data-scope-topic]:checked")].map((input) => input.value);
}

function renderScopeSelection() {
  scopeState.subjectId = scopeSubject.value;
  scopeState.grade = Number(scopeGrade.value);
  const allQuestionPool = getScopeQuestions(scopeState.subjectId, scopeState.grade);
  const topics = getScopeTopics(scopeState.subjectId, scopeState.grade)
    .filter((topic) => topic !== "Ôn tập tổng hợp");
  const matchingRequestedTopics = scopeState.selectedTopics.filter((topic) => topics.includes(topic));
  const allSelected = matchingRequestedTopics.length === 0;

  scopeTopicList.innerHTML = `
    <label class="scope-topic-option scope-topic-all"><input type="checkbox" data-scope-all ${allSelected ? "checked" : ""}><span>Tất cả chủ đề</span></label>
    ${topics.map((topic) => `<label class="scope-topic-option"><input type="checkbox" data-scope-topic value="${topic}" ${matchingRequestedTopics.includes(topic) ? "checked" : ""}><span>${topic}</span></label>`).join("")}
  `;
  scopeTopicStatus.textContent = topics.length
    ? "Có thể chọn một hoặc nhiều chủ đề; chọn tất cả để ôn toàn bộ câu hỏi phù hợp."
    : "Chưa có câu hỏi theo chủ đề này. Chọn môn/lớp khác hoặc quay lại khi dữ liệu được bổ sung.";

  const selectedPool = allSelected ? allQuestionPool : getScopeQuestions(scopeState.subjectId, scopeState.grade, matchingRequestedTopics);
  scopeState.selectedTopics = allSelected ? [] : matchingRequestedTopics;
  scopeSelectedCount.textContent = allSelected ? "Tất cả" : `Đã chọn: ${matchingRequestedTopics.length}`;
  scopeAvailableCount.textContent = `${selectedPool.length} câu hỏi phù hợp`;
  scopeSummary.textContent = `${testSubjects.find((subject) => subject.id === scopeState.subjectId)?.name || ""} lớp ${scopeState.grade}${allSelected ? "" : ` · ${matchingRequestedTopics.join(" + ")}`}`;
  scopeStartButton.disabled = selectedPool.length === 0;
  scopeError.hidden = selectedPool.length > 0;
  scopeError.textContent = selectedPool.length ? "" : "Phạm vi này chưa có câu hỏi. Vui lòng chọn phạm vi khác.";
  scopeInsufficient.hidden = true;
}

function startScopePractice(useAvailableQuestions = false) {
  const pool = getScopeQuestions(scopeState.subjectId, scopeState.grade, scopeState.selectedTopics);
  const requestedCount = scopeQuestionCount.value === "all" ? pool.length : Number(scopeQuestionCount.value);
  if (!pool.length) {
    scopeError.textContent = "Phạm vi này chưa có câu hỏi. Vui lòng chọn phạm vi khác.";
    scopeError.hidden = false;
    return;
  }
  if (requestedCount > pool.length && !useAvailableQuestions) {
    scopeInsufficientMessage.textContent = `Phạm vi này hiện chỉ có ${pool.length} câu hỏi. Bạn có muốn làm ${pool.length} câu không?`;
    scopeInsufficient.hidden = false;
    scopeStartAvailable.textContent = `Làm ${pool.length} câu`;
    scopeInsufficient.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return;
  }

  const selectedQuestions = selectRandomQuestions(pool, useAvailableQuestions ? "all" : requestedCount);
  const subject = testSubjects.find((item) => item.id === scopeState.subjectId);
  const scope = {
    subjectId: scopeState.subjectId,
    subjectName: subject?.name || scopeState.subjectId,
    grade: scopeState.grade,
    topics: scopeState.selectedTopics,
    requestedCount: scopeQuestionCount.value,
  };
  try {
    sessionStorage.setItem("studysphere_scope_quiz", JSON.stringify({ questions: selectedQuestions, scope }));
    const query = new URLSearchParams({ scope: "1" });
    query.set("subject", scope.subjectId);
    query.set("grade", String(scope.grade));
    scope.topics.forEach((topic) => query.append("topic", topic));
    window.location.href = `quiz.html?${query}`;
  } catch (error) {
    scopeError.textContent = `Không thể bắt đầu bài luyện tập: ${error.message}`;
    scopeError.hidden = false;
  }
}

modeButtons.forEach((button) => button.addEventListener("click", () => setPracticeMode(button.dataset.practiceMode)));
scopeSubject.addEventListener("change", () => { scopeState.selectedTopics = []; renderScopeSelection(); });
scopeGrade.addEventListener("change", () => { scopeState.selectedTopics = []; renderScopeSelection(); });
scopeTopicList.addEventListener("change", (event) => {
  const allCheckbox = scopeTopicList.querySelector("[data-scope-all]");
  if (event.target.matches("[data-scope-all]")) {
    scopeTopicList.querySelectorAll("[data-scope-topic]").forEach((input) => { input.checked = false; });
    scopeState.selectedTopics = [];
  } else if (event.target.matches("[data-scope-topic]")) {
    allCheckbox.checked = !scopeTopicList.querySelector("[data-scope-topic]:checked");
    scopeState.selectedTopics = getSelectedScopeTopics();
  }
  renderScopeSelection();
});
scopeQuestionCount.addEventListener("change", () => { scopeInsufficient.hidden = true; });
scopeStartButton.addEventListener("click", () => startScopePractice());
scopeStartAvailable.addEventListener("click", () => startScopePractice(true));
scopeBackToSelect.addEventListener("click", () => { scopeInsufficient.hidden = true; scopeQuestionCount.focus(); });

readyTestList.innerHTML = availableTests.map((test) => `
  <article class="ready-test-card">
    <span class="test-status is-available">Có thể làm</span>
    <h3>${test.title}</h3>
    <p>${test.subjectName} · Lớp ${test.grade} · ${test.questions.length} câu · ${test.durationMinutes} phút</p>
    <a href="../pages/exam-detail.html?test=${encodeURIComponent(test.id)}">Xem chi tiết và làm đề <span aria-hidden="true">→</span></a>
  </article>
`).join("");

subjectFilter.insertAdjacentHTML("beforeend", testSubjects.map((subject) =>
  `<option value="${subject.id}">${subject.name}</option>`,
).join(""));
subjectFilter.value = state.subject;
searchInput.value = state.search;
typeFilter.insertAdjacentHTML("beforeend", testCatalogExamTypes.map((type) =>
  `<option value="${type.id}">${type.name}</option>`,
).join(""));
typeFilter.value = state.type;
difficultyFilter.insertAdjacentHTML("beforeend", testDifficulties.map((difficulty) =>
  `<option value="${difficulty.id}">${difficulty.name}</option>`,
).join(""));
difficultyFilter.value = state.difficulty;

document.querySelectorAll("[data-grade]").forEach((button) => {
  const isActive = button.dataset.grade === state.grade;
  button.classList.toggle("is-active", isActive);
  button.setAttribute("aria-pressed", String(isActive));
});

function getReturnUrl() {
  const returnParams = new URLSearchParams();
  for (const [key, value] of Object.entries(state)) {
    if (value !== "all" && value !== "") returnParams.set(key, value);
  }
  return `../tests/index.html${returnParams.size ? `?${returnParams}` : ""}`;
}

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
  const questionCount = test.questionCount == null
    ? "Số câu đang cập nhật"
    : test.status === "upcoming" ? `${test.questionCount} câu dự kiến` : `${test.questionCount} câu`;
  const metadata = `
    <span class="practice-test-meta-item">${test.examTypeName}</span>
    <span class="practice-test-meta-item">${test.durationMinutes} phút</span>
    <span class="practice-test-meta-item">${questionCount}</span>
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
    const detailHref = `../pages/exam-detail.html?test=${encodeURIComponent(test.id)}&return=${encodeURIComponent(getReturnUrl())}`;
    return `
      <article class="practice-test-card">
        ${subject}
        <div class="practice-test-card-actions">
          <span class="test-status is-available">${test.isSample ? "Bộ mẫu · Có thể làm" : "Có thể làm"}</span>
          <button class="test-favorite-button ${isSaved ? "is-saved" : ""}" type="button" data-test-favorite="${test.id}" aria-label="${isSaved ? "Bỏ lưu" : "Lưu"} ${test.title}" aria-pressed="${isSaved}">${isSaved ? "♥" : "♡"}</button>
        </div>
        <h2>${test.title}</h2>
        <p>${test.description}</p>
        <div class="practice-test-meta">${metadata}</div>
        <a class="practice-test-start" href="${detailHref}">
          <span>Xem chi tiết</span><span aria-hidden="true">→</span>
        </a>
      </article>
    `;
  }

  const detailHref = `../pages/exam-detail.html?test=${encodeURIComponent(test.id)}&return=${encodeURIComponent(getReturnUrl())}`;
  return `
    <article class="practice-test-card is-upcoming">
      ${subject}
      <span class="test-status">Sắp mở</span>
      <h2>${test.title}</h2>
      <p>${test.description}</p>
      <div class="practice-test-meta">${metadata}</div>
      <a class="practice-test-start" href="${detailHref}">Xem chi tiết<span aria-hidden="true">→</span></a>
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
    renderScopeSelection();
    const requestedMode = pageParams.get("mode") === "scope" ? "scope" : "exam";
    setPracticeMode(requestedMode);
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

render();
renderScopeSelection();
setPracticeMode(pageParams.get("mode") === "scope" ? "scope" : "exam");