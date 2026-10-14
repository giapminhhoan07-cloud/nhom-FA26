import test from "node:test";
import assert from "node:assert/strict";

import { createPdfObjectUrl, getExamGrade, mergeExamCatalog, resolvePdfReference, verifyPdfDocument } from "../public/backup/js/pdfCatalog.js";

test("merges uploaded exams by ID and lets the API version replace static metadata", () => {
  const merged = mergeExamCatalog([{ id: "1", title: "Static" }, { id: "2", title: "Local" }], [{ id: 1, title: "Uploaded PDF" }]);
  assert.deepEqual(merged, [{ id: 1, title: "Uploaded PDF" }, { id: "2", title: "Local" }]);
});

test("resolves only same-origin PDF paths and actual embedded PDF data", () => {
  assert.equal(resolvePdfReference("../documents/math.pdf", "http://localhost:5173/backup/pages/exams.html"), "http://localhost:5173/backup/documents/math.pdf");
  assert.equal(resolvePdfReference("https://other.example/math.pdf", "http://localhost:5173/backup/pages/exams.html"), "");
  assert.equal(resolvePdfReference("../documents/not-a-pdf.html", "http://localhost:5173/backup/pages/exams.html"), "");
  assert.equal(resolvePdfReference("../documents/math.pdf", "not a URL"), "");
  assert.equal(resolvePdfReference("data:application/pdf;base64,JVBERi0=", "http://localhost:5173/"), "data:application/pdf;base64,JVBERi0=");
});

test("derives class from exam metadata or title", () => {
  assert.equal(getExamGrade({ grade: 11, title: "Toán" }), 11);
  assert.equal(getExamGrade({ title: "Đề ôn tập Toán lớp 10" }), 10);
  assert.equal(getExamGrade({ title: "Đề chưa phân lớp" }), null);
});

test("only returns a PDF URL after a successful PDF response", async () => {
  const baseUrl = "http://localhost:5173/backup/pages/exams.html";
  const valid = await verifyPdfDocument("../documents/math.pdf", baseUrl, async () => ({ ok: true, headers: { get: () => "application/pdf" } }));
  const missing = await verifyPdfDocument("../documents/missing.pdf", baseUrl, async () => ({ ok: false, headers: { get: () => "text/html" } }));
  assert.equal(valid, "http://localhost:5173/backup/documents/math.pdf");
  assert.equal(missing, "");
});

test("converts an embedded PDF into a small object URL instead of a large DOM URL", () => {
  let createdBlob;
  const href = createPdfObjectUrl("data:application/pdf;base64,JVBERi0=", (blob) => {
    createdBlob = blob;
    return "blob:http://localhost/test-pdf";
  });
  assert.equal(href, "blob:http://localhost/test-pdf");
  assert.equal(createdBlob.type, "application/pdf");
  assert.equal(createdBlob.size, 5);
});