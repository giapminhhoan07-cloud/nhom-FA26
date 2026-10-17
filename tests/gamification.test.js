import test from "node:test";
import assert from "node:assert/strict";

import { createGamificationUpdate } from "../public/backup/js/gamification.js";

function createAttempt(attemptId, submittedAt) {
  return {
    attemptId,
    totalQuestions: 1,
    correctCount: 1,
    score: 10,
    answers: [0],
    submittedAt: submittedAt.toISOString(),
  };
}

test("starts a streak on the first completed study day", () => {
  const now = new Date(2026, 9, 17, 9);
  const update = createGamificationUpdate({}, createAttempt("first", now), now);

  assert.equal(update.awarded, true);
  assert.equal(update.state.streak, 1);
  assert.equal(update.streakUpdated, true);
});

test("does not signal another streak update for a second attempt on the same day", () => {
  const now = new Date(2026, 9, 17, 9);
  const previous = createGamificationUpdate({}, createAttempt("first", now), now);
  const update = createGamificationUpdate(previous.state, createAttempt("second", now), now);

  assert.equal(update.state.streak, 1);
  assert.equal(update.streakUpdated, false);
});

test("signals each new study day and resets the streak after a missed day", () => {
  const today = new Date(2026, 9, 17, 9);
  const continued = createGamificationUpdate(
    { streak: 4, lastStudyDate: "2026-10-16" },
    createAttempt("continued", today),
    today,
  );
  const returned = createGamificationUpdate(
    { streak: continued.state.streak, lastStudyDate: "2026-10-14" },
    createAttempt("returned", today),
    today,
  );

  assert.equal(continued.state.streak, 5);
  assert.equal(continued.streakUpdated, true);
  assert.equal(returned.state.streak, 1);
  assert.equal(returned.streakUpdated, true);
});
