const STOP_WORDS = new Set([
  "ban", "bi", "cho", "co", "cua", "gi", "giup", "hay", "hoi", "la", "lam",
  "khong", "minh", "mot", "muon", "nao", "nhu", "nho", "o", "toi", "the", "thi",
  "va", "voi",
]);

const SYNONYMS = [
  ["mat khau", "password", "pass", "quen", "forgot", "khong nho"],
  ["dang nhap", "login", "log in", "khong vao duoc", "khong the dang nhap"],
  ["bai thi", "lam bai", "quiz", "kiem tra", "nop bai", "thi lai"],
  ["ket qua", "diem", "score", "lich su", "xem lai"],
  ["de thi", "kho de", "tim de", "mon hoc", "lop", "favorite", "yeu thich", "luu de"],
  ["loi", "khong tai duoc", "bao loi", "error", "bug"],
  ["dang ky", "tao tai khoan", "register", "sign up"],
];

export function normalizeFaqText(value) {
  return String(value)
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getQueryTerms(query) {
  const normalizedQuery = normalizeFaqText(query);
  const queryTokens = normalizedQuery.split(/\s+/).filter((token) => token && !STOP_WORDS.has(token));
  const synonymPhrases = new Set();

  for (const group of SYNONYMS) {
    const normalizedGroup = group.map(normalizeFaqText);
    if (normalizedGroup.some((term) => normalizedQuery.includes(term) || queryTokens.includes(term))) {
      for (const term of normalizedGroup) {
        if (!queryTokens.includes(term)) synonymPhrases.add(term);
      }
    }
  }

  return { queryTokens, synonymPhrases: [...synonymPhrases] };
}

export function searchFaqs(query, faqData) {
  const { queryTokens, synonymPhrases } = getQueryTerms(query);
  if (!queryTokens.length && !synonymPhrases.length) return [];

  return faqData
    .flatMap((group) => group.questions.map((faq, index) => ({
      ...faq,
      id: `${group.id}-${index}`,
      category: group.category,
      categoryId: group.id,
    })))
    .map((faq) => {
      const question = normalizeFaqText(faq.question);
      const searchableText = ` ${normalizeFaqText([
        faq.question,
        faq.answer,
        faq.category,
        ...(faq.keywords || []),
      ].join(" "))} `;
      const searchableTokens = new Set(searchableText.split(" "));
      const score = queryTokens.reduce((total, term) => {
        if (!searchableTokens.has(term)) return total;
        return total + (question.split(" ").includes(term) ? 3 : 1);
      }, 0) + synonymPhrases.reduce((total, phrase) => {
        return searchableText.includes(` ${phrase} `) ? total + (question.includes(phrase) ? 2 : 1) : total;
      }, 0);
      return { ...faq, score };
    })
    .filter((faq) => faq.score > 0)
    .sort((first, second) => second.score - first.score);
}
