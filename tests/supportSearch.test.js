import test from "node:test";
import assert from "node:assert/strict";

import { faqData } from "../public/backup/data/supportFaq.js";
import { normalizeFaqText, searchFaqs } from "../public/backup/js/supportSearch.js";

test("normalizes Vietnamese text and common punctuation", () => {
  assert.equal(normalizeFaqText("Tôi muốn xem điểm!"), "toi muon xem diem");
});

test("finds FAQ matches using English and informal password wording", () => {
  const matches = searchFaqs("mình không nhớ pass", faqData);
  assert.equal(matches[0].question, "Tôi quên mật khẩu thì phải làm gì?");
});

test("finds results by common study terms and saved-exam wording", () => {
  assert.ok(searchFaqs("muốn xem điểm", faqData).some((faq) => faq.question === "Tôi xem kết quả bài thi ở đâu?"));
  assert.ok(searchFaqs("yêu thích", faqData).some((faq) => faq.question === "Tôi có thể lưu đề thi yêu thích không?"));
});

test("returns no match when the search has no relevant terms", () => {
  assert.deepEqual(searchFaqs("xyzzy", faqData), []);
  assert.deepEqual(searchFaqs("mình muốn hỏi", faqData), []);
});
