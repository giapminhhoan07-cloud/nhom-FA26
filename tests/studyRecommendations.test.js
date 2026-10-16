import test from "node:test";
import assert from "node:assert/strict";

import { getScopeQuestions, getScopeTopics } from "../public/backup/js/practiceScopes.js";
import { getStudyRecommendations } from "../public/backup/js/studyRecommendations.js";

function createAttempt(questions, answers, attemptId = "attempt-1") {
  return {
    result: {
      attemptId,
      subjectId: questions[0]?.subjectId || "toan",
      subjectName: "Toán",
      grade: 12,
      answers,
      submittedAt: "2026-10-16T00:00:00.000Z",
    },
    questions,
  };
}

function getThreeQuestionTopic() {
  for (const topic of getScopeTopics("toan", 12)) {
    const questions = getScopeQuestions("toan", 12, [topic])
      .filter((question) => question.type !== "short_answer" && Number.isInteger(question.correctAnswer))
      .slice(0, 3);
    if (questions.length === 3) return { topic, questions };
  }
  throw new Error("Expected a Toán lớp 12 topic with at least three multiple-choice questions.");
}

test("recommends a matching subject and topic when saved answers show a weakness", () => {
  const { topic, questions } = getThreeQuestionTopic();
  const wrongAnswers = questions.map((question) => (question.correctAnswer + 1) % question.options.length);
  const analysis = getStudyRecommendations([createAttempt(questions, wrongAnswers)]);

  assert.equal(analysis.status, "ready");
  assert.equal(analysis.analyzedAttempts, 1);
  assert.equal(analysis.analyzedQuestions, 3);
  assert.ok(analysis.recommendations.length > 0);
  assert.equal(analysis.recommendations[0].isWeakness, true);
  assert.match(analysis.recommendations[0].reason, /3 câu sai hoặc bỏ trống/);
  assert.match(analysis.recommendations[0].href, /subject=toan/);
  assert.match(analysis.recommendations[0].href, /grade=12/);
  if (topic !== "Ôn tập tổng hợp") {
    assert.match(analysis.recommendations[0].href, /topic=/);
    assert.equal(analysis.recommendations[0].topic, topic);
  }
});

test("does not claim personalized analysis before enough detailed outcomes exist", () => {
  const { questions } = getThreeQuestionTopic();
  const analysis = getStudyRecommendations([createAttempt(questions.slice(0, 2), [0, 1])]);

  assert.equal(analysis.status, "insufficient");
  assert.equal(analysis.analyzedQuestions, 2);
  assert.deepEqual(analysis.recommendations, []);
});

test("offers maintenance practice without calling a fully correct topic a weakness", () => {
  const { questions } = getThreeQuestionTopic();
  const correctAnswers = questions.map((question) => question.correctAnswer);
  const analysis = getStudyRecommendations([createAttempt(questions, correctAnswers)]);

  assert.equal(analysis.status, "ready");
  assert.ok(analysis.recommendations.length > 0);
  assert.equal(analysis.recommendations[0].isWeakness, false);
  assert.match(analysis.recommendations[0].reason, /chưa có câu sai hoặc bỏ trống/);
});

test("returns insufficient status when no attempt details are available", () => {
  assert.deepEqual(getStudyRecommendations([]), {
    status: "insufficient",
    analyzedAttempts: 0,
    analyzedQuestions: 0,
    recommendations: [],
  });
});
