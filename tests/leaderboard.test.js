import test from "node:test";
import assert from "node:assert/strict";

import { buildLeaderboard } from "../public/backup/js/leaderboard.js";

const now = new Date("2026-10-16T00:00:00.000Z");
const users = [
  { id: "1", name: "An" },
  { id: "2", name: "Bình" },
  { id: "3", name: "Admin", role: "admin", xp: 999 },
  { id: "4", name: "Khóa", status: "locked", xp: 500 },
];

test("weekly ranking counts unique completions from the last seven days", () => {
  const ranking = buildLeaderboard(users, [
    { id: "a1", userId: "1", score: 8, submittedAt: "2026-10-15T12:00:00.000Z" },
    { id: "a1", userId: "1", score: 8, submittedAt: "2026-10-15T12:00:00.000Z" },
    { id: "a2", userId: "1", score: 6, submittedAt: "2026-10-14T12:00:00.000Z" },
    { id: "b1", userId: "2", score: 10, submittedAt: "2026-10-16T00:00:00.000Z" },
    { id: "old", userId: "2", score: 10, submittedAt: "2026-10-08T00:00:00.000Z" },
    { id: "future", userId: "2", score: 10, submittedAt: "2026-10-17T00:00:00.000Z" },
    { id: "bad", userId: "2", score: 20, submittedAt: "2026-10-15T12:00:00.000Z" },
    { id: "admin", userId: "3", score: 10, submittedAt: "2026-10-15T12:00:00.000Z" },
  ], "week", now);

  assert.deepEqual(ranking.map(({ id, xp }) => [id, xp]), [["1", 100], ["2", 50]]);
});

test("all-time ranking uses stored XP and ignores non-students", () => {
  const ranking = buildLeaderboard([
    { id: "1", name: "An", xp: 100 },
    { id: "2", name: "Bình", xp: 150 },
    ...users.slice(2),
  ], [], "all", now);

  assert.deepEqual(ranking.map(({ id, xp, level }) => [id, xp, level]), [["2", 150, 2], ["1", 100, 2]]);
});
