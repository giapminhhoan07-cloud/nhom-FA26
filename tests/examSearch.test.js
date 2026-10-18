import test from "node:test";
import assert from "node:assert/strict";

import { exams } from "../public/backup/data/exams.js";
import { normalizeExamSearchText, searchExams } from "../public/backup/js/examSearch.js";

test("normalizes Vietnamese accents and punctuation for exam searches", () => {
  assert.equal(normalizeExamSearchText("Đề thi thử Vật lý!"), "de thi thu vat ly");
});

test("finds exams with unaccented text and common subject aliases", () => {
  assert.equal(searchExams(exams, "vat ly")[0].subjectId, "vat-ly");
  assert.equal(searchExams(exams, "physics")[0].subjectId, "vat-ly");
  assert.equal(searchExams(exams, "van hoc")[0].subjectId, "ngu-van");
  assert.equal(searchExams([{ title: "Bộ luyện tập", topics: ["Hình học không gian"] }], "hinh hoc khong gian").length, 1);
});

test("ranks title matches before matches found only in descriptions", () => {
  const results = searchExams([
    { id: "description", title: "Bộ luyện tập", description: "Đề Toán chuyên sâu" },
    { id: "title", title: "Đề Toán chuyên sâu", description: "Bộ luyện tập" },
  ], "toan chuyen sau");

  assert.deepEqual(results.map((exam) => exam.id), ["title", "description"]);
});

test("returns the original exam order for an empty or stop-word-only query", () => {
  assert.deepEqual(searchExams(exams.slice(0, 2), ""), exams.slice(0, 2));
  assert.deepEqual(searchExams(exams.slice(0, 2), "đề môn"), exams.slice(0, 2));
});

test("returns no result for unrelated search terms", () => {
  assert.deepEqual(searchExams(exams, "xyzzy"), []);
});
