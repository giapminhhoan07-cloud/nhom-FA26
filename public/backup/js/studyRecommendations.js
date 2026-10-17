import { isQuestionAnswered, isQuestionAnswerCorrect } from "./questionAnswers.js";
import { practiceTests, testSubjects } from "../tests/data/practice-tests.js";
import { getScopeQuestions, practiceQuestionBank } from "./practiceScopes.js";

const normalizeText = (value) => String(value ?? "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .toLocaleLowerCase("vi")
  .trim();

function resolveSubjectId(result, question) {
  const value = String(result.subjectId || result.subjectName || result.subject || question.subjectId || question.subject || "");
  const subject = testSubjects.find((item) =>
    item.id === value || normalizeText(item.name) === normalizeText(value),
  );
  if (subject) return subject.id;

  return practiceQuestionBank.find((item) => item.subjectId === value)?.subjectId || "";
}

function resolveGrade(result, question) {
  const directGrade = Number(result.grade || question.grade);
  if ([10, 11, 12].includes(directGrade)) return directGrade;
  const title = String(result.examTitle || result.exam_title || "");
  return Number(title.match(/\b(?:lớp\s*)?(10|11|12)\b/i)?.[1]) || null;
}

function getQuestionTopics(question, subjectId, grade) {
  const bankQuestion = practiceQuestionBank.find((item) =>
    item.id === String(question.id) && item.subjectId === subjectId && item.grade === grade,
  );
  const suppliedTopics = [
    ...(Array.isArray(question.topics) ? question.topics : []),
    ...(typeof question.topic === "string" ? [question.topic] : []),
  ].filter((topic) => typeof topic === "string" && topic.trim());
  const topics = suppliedTopics.length ? suppliedTopics : bankQuestion?.topics;
  return topics?.length ? [...new Set(topics)] : ["Ôn tập tổng hợp"];
}

function getAttemptData(entry) {
  const result = entry?.result && typeof entry.result === "object" ? entry.result : entry;
  const questions = Array.isArray(entry?.questions)
    ? entry.questions
    : Array.isArray(result?.questions) ? result.questions : [];
  const answers = Array.isArray(result?.answers)
    ? result.answers
    : Array.isArray(entry?.answers) ? entry.answers : [];
  return { result: result || {}, questions, answers };
}

function getAttemptedExamIds(attemptDetails) {
  return new Set((attemptDetails || []).map((entry) => {
    const result = entry?.result && typeof entry.result === "object" ? entry.result : entry;
    return String(result?.examId || "");
  }).filter(Boolean));
}

function findRecommendedTest(group, attemptedExamIds, recommendedTestIds) {
  return practiceTests
    .filter((test) => test.subjectId === group.subjectId && Number(test.grade) === group.grade)
    .map((test) => ({
      test,
      matchingQuestionCount: practiceQuestionBank.filter((question) =>
        question.sourceTestId === test.id
        && question.subjectId === group.subjectId
        && question.grade === group.grade
        && question.topics.includes(group.topic),
      ).length,
    }))
    .filter(({ test, matchingQuestionCount }) => matchingQuestionCount > 0 && !recommendedTestIds.has(test.id))
    .sort((first, second) =>
      Number(attemptedExamIds.has(first.test.id)) - Number(attemptedExamIds.has(second.test.id))
      || second.matchingQuestionCount - first.matchingQuestionCount
      || first.test.title.localeCompare(second.test.title, "vi"),
    )[0] || null;
}

export function getStudyRecommendations(attemptDetails) {
  const groups = new Map();
  const attemptedExamIds = getAttemptedExamIds(attemptDetails);
  const recommendedTestIds = new Set();
  let analyzedAttempts = 0;
  let analyzedQuestions = 0;

  for (const [attemptIndex, entry] of (attemptDetails || []).entries()) {
    const { result, questions, answers } = getAttemptData(entry);
    if (!questions.length || !answers.length) continue;

    let attemptAnalyzed = false;
    questions.forEach((question, questionIndex) => {
      const subjectId = resolveSubjectId(result, question);
      const grade = resolveGrade(result, question);
      const answer = answers[questionIndex];
      if (!subjectId || !grade || answer === undefined) return;

      const isAnswered = isQuestionAnswered(answer, question);
      const isCorrect = isAnswered && isQuestionAnswerCorrect(answer, question);
      const topics = getQuestionTopics(question, subjectId, grade);
      if (!topics.length) return;
      analyzedQuestions += 1;
      attemptAnalyzed = true;
      for (const topic of topics) {
        const key = `${subjectId}|${grade}|${topic}`;
        let group = groups.get(key);
        if (!group) {
          group = {
            subjectId,
            subjectName: testSubjects.find((item) => item.id === subjectId)?.name || subjectId,
            grade,
            topic,
            questionCount: 0,
            errorCount: 0,
            missedCount: 0,
            attemptIds: new Set(),
            latestSubmittedAt: "",
          };
          groups.set(key, group);
        }
        group.questionCount += 1;
        if (!isCorrect) {
          group.errorCount += 1;
          if (!isAnswered) group.missedCount += 1;
          group.attemptIds.add(String(result.attemptId || result.id || attemptIndex));
        }
        const submittedAt = String(result.submittedAt || result.submitted_at || "");
        if (submittedAt > group.latestSubmittedAt) group.latestSubmittedAt = submittedAt;
      }
    });
    if (attemptAnalyzed) analyzedAttempts += 1;
  }

  if (analyzedAttempts < 1 || analyzedQuestions < 3) {
    return {
      status: "insufficient",
      analyzedAttempts,
      analyzedQuestions,
      recommendations: [],
    };
  }

  const allGroups = [...groups.values()];
  const weakGroups = allGroups
    .filter((group) => group.errorCount > 0)
    .sort((first, second) =>
      second.errorCount - first.errorCount
      || second.errorCount / second.questionCount - first.errorCount / first.questionCount
      || Number(first.topic === "Ôn tập tổng hợp") - Number(second.topic === "Ôn tập tổng hợp")
      || second.latestSubmittedAt.localeCompare(first.latestSubmittedAt),
    );
  const candidates = weakGroups.length ? weakGroups : allGroups.sort((first, second) =>
    second.latestSubmittedAt.localeCompare(first.latestSubmittedAt),
  );
  const recommendations = [];
  const seenScopes = new Set();

  for (const group of candidates) {
    if (recommendations.length >= 3) break;
    const scopeKey = `${group.subjectId}|${group.grade}|${group.topic}`;
    if (seenScopes.has(scopeKey)) continue;

    const topicQuestions = getScopeQuestions(group.subjectId, group.grade, [group.topic]);
    const scopeQuestions = topicQuestions.length
      ? topicQuestions
      : getScopeQuestions(group.subjectId, group.grade);
    if (!scopeQuestions.length) continue;

    const params = new URLSearchParams({
      subject: group.subjectId,
      grade: String(group.grade),
    });
    const hasTopicMatch = topicQuestions.length > 0 && group.topic !== "Ôn tập tổng hợp";
    if (hasTopicMatch) params.set("topic", group.topic);

    const hasWeakness = group.errorCount > 0;
    const reason = hasWeakness
      ? `Bạn có ${group.errorCount} câu sai hoặc bỏ trống (${group.missedCount} câu bỏ trống) trên ${group.questionCount} câu ở chủ đề ${group.topic}, môn ${group.subjectName} lớp ${group.grade}${group.attemptIds.size > 1 ? ` trong ${group.attemptIds.size} lần làm` : ""}.`
      : `Bạn chưa có câu sai hoặc bỏ trống trong ${group.questionCount} câu đã lưu ở môn này. Luyện thêm để củng cố kiến thức.`;

    recommendations.push({
      subjectName: group.subjectName,
      grade: group.grade,
      topic: hasTopicMatch ? group.topic : "",
      isWeakness: hasWeakness,
      title: `Ôn ${group.topic === "Ôn tập tổng hợp" || !hasTopicMatch ? "tổng hợp" : group.topic} · ${group.subjectName} lớp ${group.grade}`,
      reason,
      questionCount: scopeQuestions.length,
      href: `../tests/scope.html?${params}`,
    });
    const recommendedTest = findRecommendedTest(group, attemptedExamIds, recommendedTestIds);
    if (recommendedTest) {
      recommendations[recommendations.length - 1].examTitle = recommendedTest.test.title;
      recommendations[recommendations.length - 1].examQuestionCount = recommendedTest.matchingQuestionCount;
      recommendations[recommendations.length - 1].examHref = `../tests/quiz.html?test=${encodeURIComponent(recommendedTest.test.id)}`;
      recommendedTestIds.add(recommendedTest.test.id);
    }
    seenScopes.add(scopeKey);
  }

  return {
    status: "ready",
    analyzedAttempts,
    analyzedQuestions,
    recommendations,
  };
}
