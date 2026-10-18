const STOP_WORDS = new Set(["cac", "cho", "de", "la", "mon", "mot", "va"]);

const SUBJECT_ALIASES = [
  ["toan", "math", "dai so", "hinh hoc"],
  ["ngu van", "van hoc", "literature"],
  ["tieng anh", "anh", "english"],
  ["vat ly", "ly", "physics"],
  ["hoa hoc", "hoa", "chemistry"],
  ["sinh hoc", "sinh", "biology"],
  ["dia li", "dia ly", "dia", "geography"],
  ["lich su", "su", "history"],
  ["tin hoc", "tin", "informatics"],
];

export function normalizeExamSearchText(value) {
  return String(value ?? "")
    .toLocaleLowerCase("vi")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getAliases(query, tokens) {
  const aliases = new Set();
  for (const group of SUBJECT_ALIASES) {
    const matches = group.some((alias) => {
      const normalizedAlias = normalizeExamSearchText(alias);
      return query.includes(normalizedAlias)
        || (!normalizedAlias.includes(" ") && tokens.includes(normalizedAlias));
    });
    if (matches) group.forEach((alias) => aliases.add(normalizeExamSearchText(alias)));
  }
  return aliases;
}

function getSearchableFields(exam) {
  return [
    exam.id,
    exam.title,
    exam.subjectName,
    exam.subjectId,
    exam.grade ? `lớp ${exam.grade}` : "",
    exam.typeName,
    exam.examTypeName,
    exam.difficultyName,
    exam.description,
    ...(Array.isArray(exam.topics) ? exam.topics : []),
    ...(Array.isArray(exam.topics) ? exam.topics : []),
  ].map(normalizeExamSearchText).filter(Boolean);
}

export function searchExams(exams, query) {
  const normalizedQuery = normalizeExamSearchText(query);
  const tokens = normalizedQuery.split(" ").filter((token) => token && !STOP_WORDS.has(token));
  if (!tokens.length) return [...exams];

  const aliases = getAliases(normalizedQuery, tokens);
  return exams
    .map((exam, index) => {
      const fields = getSearchableFields(exam);
      const searchableText = ` ${fields.join(" ")} `;
      const title = normalizeExamSearchText(exam.title);
      let score = title.includes(normalizedQuery) ? 8 : searchableText.includes(` ${normalizedQuery} `) ? 5 : 0;

      for (const token of tokens) {
        if (title.split(" ").includes(token)) score += 3;
        else if (searchableText.includes(` ${token} `)) score += 1;
      }
      for (const alias of aliases) {
        if (!tokens.includes(alias) && searchableText.includes(` ${alias} `)) score += 2;
      }

      return { exam, index, score };
    })
    .filter((result) => result.score > 0)
    .sort((first, second) => second.score - first.score || first.index - second.index)
    .map(({ exam }) => exam);
}