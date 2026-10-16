import { practiceTests, testSubjects } from "../tests/data/practice-tests.js";
import { isQuestionAnswered, isQuestionAnswerCorrect } from "./questionAnswers.js";
import { practiceQuestionBank } from "./practiceScopes.js";

const testsById = new Map(practiceTests.map((test) => [String(test.id), test]));
const questionsById = new Map(practiceQuestionBank.map((question) => [String(question.id), question]));
const subjectsById = new Map(testSubjects.map((subject) => [subject.id, subject.name]));

export function buildStudyRecommendations(attemptDetails, limit = 3) {
  const recommendations = new Map();

  for (const detail of attemptDetails || []) {
    const result = detail?.result || detail;
    const questions = Array.isArray(detail?.questions) ? detail.questions : [];
    const test = testsById.get(String(result?.examId ?? result?.exam_id ?? ""));
    const subjectId = String(result?.subjectId ?? result?.subject_id ?? test?.subjectId ?? "");
    const grade = Number(result?.grade ?? test?.grade);
    if (!subjectId || !Number.isFinite(grade) || !Array.isArray(result?.answers)) continue;

    questions.forEach((question, index) => {
      const answer = result.answers[index];
      if (!isQuestionAnswered(answer, question) || isQuestionAnswerCorrect(answer, question)) return;

      const bankQuestion = questionsById.get(String(question.id ?? ""));
      const topics = [
        ...(Array.isArray(question.topics) ? question.topics : []),
        ...(question.topic ? [question.topic] : []),
        ...(Array.isArray(bankQuestion?.topics) ? bankQuestion.topics : []),
        ...(bankQuestion?.topic ? [bankQuestion.topic] : []),
      ].filter((topic) => typeof topic === "string" && topic.trim());
      const topic = topics[0] || "Ôn tập tổng hợp";
      const key = `${subjectId}|${grade}|${topic}`;
      const recommendation = recommendations.get(key) || {
        subjectId,
        subjectName: String(result.subjectName || result.subject || subjectsById.get(subjectId) || subjectId),
        grade,
        topic,
        wrongCount: 0,
      };
      recommendation.wrongCount += 1;
      recommendations.set(key, recommendation);
    });
  }

  return [...recommendations.values()]
    .sort((first, second) => second.wrongCount - first.wrongCount || first.topic.localeCompare(second.topic, "vi"))
    .slice(0, Math.max(0, Number(limit) || 0));
}