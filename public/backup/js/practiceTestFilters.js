import { searchExams } from "./examSearch.js";

export function filterPracticeTests(tests, filters = {}) {
  return searchExams(tests, filters.search || "").filter((test) => {
    const duration = Number(test.durationMinutes);
    const matchesGrade = !filters.grade || filters.grade === "all" || Number(test.grade) === Number(filters.grade);
    const matchesSubject = !filters.subject || filters.subject === "all" || String(test.subjectId) === filters.subject;
    const matchesType = !filters.type || filters.type === "all" || String(test.examType) === filters.type;
    const matchesDifficulty = !filters.difficulty || filters.difficulty === "all" || String(test.difficulty) === filters.difficulty;
    const matchesDuration = !filters.duration || filters.duration === "all"
      || (filters.duration === "under-30" && duration > 0 && duration < 30)
      || (filters.duration === "30-60" && duration >= 30 && duration <= 60)
      || (filters.duration === "over-60" && duration > 60)
      || (filters.duration === "unknown" && !(duration > 0));
    return matchesGrade && matchesSubject && matchesType && matchesDifficulty && matchesDuration;
  });
}