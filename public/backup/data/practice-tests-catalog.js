const examTypeNames = {
  "topic-review": "Ôn tập theo chủ đề",
  midterm: "Ôn tập giữa kỳ",
  final: "Ôn tập cuối kỳ",
  "integrated-review": "Ôn tập tổng hợp",
  "graduation-practice": "Ôn thi tốt nghiệp THPT",
};

const difficultyNames = {
  basic: "Cơ bản",
  medium: "Trung bình",
  upper: "Khá",
  advanced: "Nâng cao",
};

export function defineUpcomingTests(subjectId, subjectName, definitions) {
  return definitions.map((test) => ({
    ...test,
    subjectId,
    subjectName,
    examTypeName: examTypeNames[test.examType],
    difficultyName: difficultyNames[test.difficulty],
    questionCount: null,
    status: "upcoming",
  }));
}