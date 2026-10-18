import { searchExams } from "./examSearch.js";

export function filterPracticeTests(tests, filters = {}) {
  return searchExams(tests, filters.search || "").filter((test) => {
    const duration = Number(test.durationMinutes);
    const matchesGrade = !filters.grade || filters.grade === "all" || Number(test.grade) === Number(filters.grade);
    const matchesSubject = !filters.subject || filters.subject === "all" || String(test.subjectId) === filters.subject;
    const topics = Array.isArray(test.topics) ? test.topics : [];
    const matchesTopic = !filters.topic || filters.topic === "all" || topics.includes(filters.topic);
    const matchesType = !filters.type || filters.type === "all" || String(test.examType) === filters.type;
    const matchesDifficulty = !filters.difficulty || filters.difficulty === "all" || String(test.difficulty) === filters.difficulty;
    const matchesCompletion = !filters.completion || filters.completion === "all"
      || (filters.completion === "done" && test.isCompleted)
      || (filters.completion === "not-done" && !test.isCompleted);
    const matchesDuration = !filters.duration || filters.duration === "all"
      || (filters.duration === "under-30" && duration > 0 && duration < 30)
      || (filters.duration === "30-60" && duration >= 30 && duration <= 60)
      || (filters.duration === "over-60" && duration > 60)
      || (filters.duration === "unknown" && !(duration > 0));
    return matchesGrade && matchesSubject && matchesTopic && matchesType && matchesDifficulty && matchesCompletion && matchesDuration;
  });
}