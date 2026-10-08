import test from "node:test";
import assert from "node:assert/strict";

import {
  getQuestionSubjects,
  getScopeGrades,
  getScopeQuestions,
  getScopeTopics,
  practiceQuestionBank,
  selectRandomQuestions,
} from "../public/backup/js/practiceScopes.js";
import { exams } from "../public/backup/data/exams.js";
import { practiceTests, upcomingTests } from "../public/backup/tests/data/practice-tests.js";

test("scope bank contains only questions from available practice sets", () => {
  assert.equal(practiceQuestionBank.length, 250);
  assert.deepEqual(getQuestionSubjects().map((subject) => subject.id), [
    "toan", "ngu-van", "tieng-anh", "vat-ly", "hoa-hoc",
    "sinh-hoc", "lich-su", "dia-li", "tin-hoc", "gdkp",
  ]);
  assert.deepEqual(getScopeGrades(), [10, 11, 12]);
  assert.equal(new Set(practiceQuestionBank.map((question) => question.id)).size, practiceQuestionBank.length);
  assert.ok(practiceQuestionBank.every((question) =>
    question.id && question.question && question.subject && question.subjectId
    && question.grade && question.topic && question.topics.length
    && (question.type === "short_answer"
      ? question.options.length === 0 && typeof question.answer === "string"
      : question.options.length === 4)
    && question.correctAnswer !== null
    && question.explanation && question.difficulty,
  ));
});

test("every listed subject has questions for grades 10, 11 and 12", () => {
  const expectedGradeQuestionCounts = { 10: 55, 11: 55, 12: 140 };

  for (const subject of getQuestionSubjects()) {
    for (const grade of [10, 11, 12]) {
      const questions = getScopeQuestions(subject.id, grade);
      assert.ok(questions.length > 0, `${subject.name} grade ${grade} should have matching questions`);
      assert.ok(getScopeTopics(subject.id, grade).length > 0);
      assert.equal(
        questions.every((question) => question.subjectId === subject.id && question.grade === grade),
        true,
      );
    }
  }

  for (const [grade, expectedCount] of Object.entries(expectedGradeQuestionCounts)) {
    assert.equal(practiceQuestionBank.filter((question) => question.grade === Number(grade)).length, expectedCount);
  }
});

test("all newly added subject-grade sets are marked as sample data", () => {
  const sampleTests = practiceTests.filter((practiceTest) => practiceTest.id.startsWith("sample-"));
  assert.equal(sampleTests.length, 24);
  assert.ok(sampleTests.every((practiceTest) =>
    practiceTest.isSample
    && practiceTest.questions.length === 5
    && new Set(practiceTest.questions.map((question) => question.correctAnswer)).size > 1
    && practiceTest.questions.every((question) =>
      question.subjectId === practiceTest.subjectId
      && question.subject === practiceTest.subjectName
      && question.grade === practiceTest.grade
      && question.topic
      && question.difficulty
      && Number.isInteger(question.correctAnswer)
      && question.correctAnswer >= 0
      && question.correctAnswer < question.options.length,
    ),
  ));
});

test("all eight literature outlines are available as clearly marked sample quizzes", () => {
  const literatureQuestions = practiceQuestionBank.filter((question) => question.subjectId === "ngu-van");
  const sampleIds = new Set(literatureQuestions.map((question) => question.sourceTestId));

  assert.equal(sampleIds.size, 8);
  assert.equal(literatureQuestions.length, 40);
  assert.ok(literatureQuestions.every((question) => question.topics.length > 0 && question.explanation));
  assert.ok(getScopeQuestions("ngu-van", 10, ["Đọc hiểu thơ"]).length > 0);
  assert.ok(getScopeQuestions("ngu-van", 11, ["Nghị luận văn học"]).length > 0);
  assert.ok(getScopeQuestions("ngu-van", 12, ["Định hướng tốt nghiệp"]).length > 0);
});

test("the 2024 literature exam is available with its own question set", () => {
  const sourceExam = exams.find((exam) => exam.id === "ngu-van-2024-thu");

  assert.equal(sourceExam.questions.length, sourceExam.questionCount);
  assert.ok(sourceExam.questions.length > 0);
  assert.equal(upcomingTests.some((test) => test.id === sourceExam.id), false);
  assert.equal(practiceTests.filter((test) => test.subjectId === "ngu-van").length, 8);
});

test("filters by subject, grade and any selected topic", () => {
  const algebra = getScopeQuestions("toan", 12, ["Đại số"]);
  const geometry = getScopeQuestions("toan", 12, ["Hình học"]);
  const mixed = getScopeQuestions("toan", 12, ["Đại số", "Hình học"]);

  assert.ok(algebra.length > 0);
  assert.ok(geometry.length > 0);
  assert.equal(mixed.length, new Set([...algebra, ...geometry]).size);
  assert.equal(getScopeQuestions("toan", 9).length, 0);
  assert.ok(getScopeTopics("toan", 12).includes("Ôn tập tổng hợp"));
});

test("selects the requested number randomly without duplicates", () => {
  const pool = getScopeQuestions("toan", 12);
  const selection = selectRandomQuestions(pool, 10);

  assert.equal(selection.length, 10);
  assert.equal(new Set(selection.map((question) => question.id)).size, 10);
  assert.deepEqual(selectRandomQuestions(pool, "all").length, pool.length);
  assert.deepEqual(selectRandomQuestions(pool, 10, () => 0).length, 10);
});

test("each subject-grade sample scope supports random unique question selection", () => {
  for (const subject of getQuestionSubjects()) {
    for (const grade of [10, 11, 12]) {
      const pool = getScopeQuestions(subject.id, grade);
      const selected = selectRandomQuestions(pool, Math.min(5, pool.length));
      assert.equal(selected.length, Math.min(5, pool.length));
      assert.equal(new Set(selected.map((question) => question.id)).size, selected.length);
    }
  }
});
