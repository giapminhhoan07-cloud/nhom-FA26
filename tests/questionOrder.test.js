import test from "node:test";
import assert from "node:assert/strict";

import { createQuestionOrder, isValidQuestionOrder } from "../public/backup/js/questionOrder.js";
import { isQuestionAnswered, isQuestionAnswerCorrect } from "../public/backup/js/questionAnswers.js";
import { additionalQuestionsByTestId } from "../public/backup/tests/data/questionAdditions.js";
import { practiceTests } from "../public/backup/tests/data/practice-tests.js";

test("shuffles question indices into a valid permutation", () => {
  const order = createQuestionOrder(5, () => 0);
  assert.deepEqual(order, [1, 2, 3, 4, 0]);
  assert.equal(isValidQuestionOrder(order, 5), true);
  assert.equal(isValidQuestionOrder([0, 1, 1, 3, 4], 5), false);
});

test("adds exactly five valid short-answer questions to each available test", () => {
  assert.equal(practiceTests.length, 12);
  const testsWithShortAnswerAdditions = practiceTests.filter((practiceTest) =>
    Object.hasOwn(additionalQuestionsByTestId, practiceTest.id),
  );
  assert.equal(testsWithShortAnswerAdditions.length, 4);

  for (const practiceTest of testsWithShortAnswerAdditions) {
    const additions = additionalQuestionsByTestId[practiceTest.id];
    assert.equal(additions.length, 5, `${practiceTest.id} should have five added questions`);
    assert.equal(practiceTest.questions.length, (practiceTest.id === "toan12-on-tap-01" ? 10 : 20) + 5);
    assert.equal(new Set(practiceTest.questions.map((question) => question.id)).size, practiceTest.questions.length);

    for (const question of additions) {
      assert.equal(question.type, "short_answer");
      assert.equal(typeof question.answer, "string");
      assert.ok(question.answer.trim());
    }
  }
});

test("checks short answers case-insensitively and treats blank answers as unanswered", () => {
  const question = { type: "short_answer", answer: "Đông Bắc" };
  assert.equal(isQuestionAnswerCorrect("  đông bắc ", question), true);
  assert.equal(isQuestionAnswerCorrect("Tây Nam", question), false);
  assert.equal(isQuestionAnswered("   ", question), false);
});
