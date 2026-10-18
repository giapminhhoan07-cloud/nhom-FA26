import test from "node:test";
import assert from "node:assert/strict";

import { filterPracticeTests } from "../public/backup/js/practiceTestFilters.js";

const practiceTests = [
  { id: "done-algebra", grade: 10, subjectId: "toan", topics: ["Đại số"], difficulty: "basic", isCompleted: true },
  { id: "new-geometry", grade: 10, subjectId: "toan", topics: ["Hình học"], difficulty: "medium", isCompleted: false },
  { id: "new-biology", grade: 11, subjectId: "sinh-hoc", topics: ["Sinh thái"], difficulty: "basic", isCompleted: false },
];

test("filters practice tests by grade, subject, topic and difficulty together", () => {
  assert.deepEqual(
    filterPracticeTests(practiceTests, {
      grade: "10",
      subject: "toan",
      topic: "Đại số",
      difficulty: "basic",
    }).map(({ id }) => id),
    ["done-algebra"],
  );
});

test("filters practice tests by completion status", () => {
  assert.deepEqual(
    filterPracticeTests(practiceTests, { completion: "done" }).map(({ id }) => id),
    ["done-algebra"],
  );
  assert.deepEqual(
    filterPracticeTests(practiceTests, { completion: "not-done" }).map(({ id }) => id),
    ["new-geometry", "new-biology"],
  );
});
