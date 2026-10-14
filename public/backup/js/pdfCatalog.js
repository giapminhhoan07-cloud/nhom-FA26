export function mergeExamCatalog(localExams, apiExams) {
  const merged = new Map();
  for (const exam of [...localExams, ...apiExams]) {
    if (exam?.id !== undefined && exam?.id !== null) merged.set(String(exam.id), exam);
  }
  return [...merged.values()];
}

export function getExamGrade(exam) {
  const grade = Number(exam?.grade);
  if ([10, 11, 12].includes(grade)) return grade;
  const match = String(exam?.title || "").match(/\b(?:lớp\s*)?(10|11|12)\b/i);
  return match ? Number(match[1]) : null;
}

export function resolvePdfReference(documentUrl, pageUrl) {
  if (typeof documentUrl !== "string" || !documentUrl.trim()) return "";
  const value = documentUrl.trim();
  if (/^data:application\/pdf;base64,[a-z0-9+/=]+$/i.test(value)) return value;

  try {
    const page = new URL(pageUrl);
    const url = new URL(value, page);
    return url.origin === page.origin && url.pathname.toLowerCase().endsWith(".pdf") ? url.href : "";
  } catch {
    return "";
  }
}

export async function verifyPdfDocument(documentUrl, pageUrl, fetcher = globalThis.fetch) {
  const href = resolvePdfReference(documentUrl, pageUrl);
  if (!href) return "";
  if (href.startsWith("data:application/pdf;base64,")) return href;

  try {
    const response = await fetcher(href, { method: "HEAD", cache: "no-store" });
    const contentType = response.headers?.get?.("content-type") || "";
    return response.ok && (!contentType || contentType.toLowerCase().includes("pdf")) ? href : "";
  } catch {
    return "";
  }
}

export function createPdfObjectUrl(dataUrl, createObjectURL = (blob) => URL.createObjectURL(blob)) {
  const prefix = "data:application/pdf;base64,";
  if (typeof dataUrl !== "string" || !dataUrl.startsWith(prefix)) return "";

  try {
    const binary = globalThis.atob(dataUrl.slice(prefix.length));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return createObjectURL(new Blob([bytes], { type: "application/pdf" }));
  } catch {
    return "";
  }
}