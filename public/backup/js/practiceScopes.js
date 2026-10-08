import { practiceTests, testSubjects } from "../tests/data/practice-tests.js";

const subjectTopics = {
  toan: (text) => {
    const topics = ["Ôn tập tổng hợp"];
    if (/log cơ số|hàm số|đạo hàm|tích phân|nguyên hàm|đồ thị|cực đại|tiếp tuyến|giá trị nhỏ nhất|phương trình|nghiệm của|tìm nghiệm/.test(text)) {
      topics.push("Đại số");
    }
    if (/phương trình|nghiệm của|tìm nghiệm/.test(text)) topics.push("Phương trình");
    if (/hàm số|đạo hàm|tích phân|nguyên hàm|đồ thị|cực đại|tiếp tuyến|giá trị nhỏ nhất/.test(text)) topics.push("Hàm số");
    if (/mặt phẳng|mặt cầu|vectơ|trong không gian|thể tích khối|khoảng cách giữa hai điểm/.test(text)) {
      topics.push("Hình học", "Hình học không gian");
    } else if (/hình chữ nhật|diện tích hình/.test(text)) {
      topics.push("Hình học");
    }
    if (/cấp số|dãy số/.test(text)) topics.push("Đại số", "Dãy số");
    if (/xác suất|biến cố|hộp có/.test(text)) topics.push("Xác suất");
    if (/log cơ số/.test(text)) topics.push("Logarit");
    return topics;
  },
  "dia-li": (text) => {
    if (/mật độ dân số|dân số|dân cư|đô thị hóa|lao động/.test(text)) return ["Dân cư và xã hội", "Ôn tập tổng hợp"];
    if (/kinh tế|cà phê|cây lương thực|trồng lúa|trung tâm kinh tế|giao thông|quốc lộ|vùng tây nguyên/.test(text)) {
      return ["Kinh tế và vùng", "Ôn tập tổng hợp"];
    }
    if (/bản đồ|biểu đồ|atlat|bảng số liệu|kỹ năng/.test(text)) return ["Kỹ năng địa lí", "Ôn tập tổng hợp"];
    return ["Địa lí tự nhiên", "Ôn tập tổng hợp"];
  },
  "lich-su": (text) => {
    if (/asean|thế giới|chiến tranh thế giới|liên hợp quốc/.test(text)) return ["Lịch sử thế giới", "Ôn tập tổng hợp"];
    if (/điện biên phủ|paris|chiến dịch|kháng chiến|độc lập|cách mạng/.test(text)) {
      return ["Lịch sử Việt Nam", "Cách mạng và kháng chiến", "Ôn tập tổng hợp"];
    }
    return ["Lịch sử Việt Nam", "Ôn tập tổng hợp"];
  },
};

const normalizeText = (value) => String(value ?? "").normalize("NFC").toLocaleLowerCase("vi");

function normalizeQuestion(question, test) {
  const content = question.content ?? question.question ?? "";
  const suppliedTopics = [
    ...(Array.isArray(question.topics) ? question.topics : []),
    ...(question.topic ? [question.topic] : []),
  ].filter((topic) => typeof topic === "string" && topic.trim());
  const tags = suppliedTopics.length
    ? [...new Set(suppliedTopics)]
    : subjectTopics[test.subjectId]?.(normalizeText(content)) || ["Ôn tập tổng hợp"];
  return {
    ...question,
    id: String(question.id),
    question: content,
    content,
    options: Array.isArray(question.options) ? question.options : [],
    correctAnswer: question.correctAnswer ?? question.correct_answer ?? question.answer ?? null,
    explanation: question.explanation ?? "",
    subject: question.subject ?? test.subjectName,
    subjectId: test.subjectId,
    grade: Number(question.grade ?? test.grade),
    topic: tags[0],
    topics: [...new Set(tags)],
    difficulty: question.difficulty ?? question.difficultyName ?? test.difficultyName ?? "Chưa phân loại",
    sourceTestId: test.id,
  };
}

export const practiceQuestionBank = practiceTests.flatMap((test) =>
  (test.questions || []).map((question) => normalizeQuestion(question, test)),
);

export function getScopeSubjects() {
  return testSubjects;
}

export function getScopeGrades() {
  return [...new Set(practiceTests.map((test) => Number(test.grade)).filter(Number.isFinite))].sort((a, b) => a - b);
}

export function getScopeQuestions(subjectId, grade, selectedTopics = []) {
  const topics = new Set(selectedTopics);
  return practiceQuestionBank.filter((question) =>
    question.subjectId === subjectId
    && question.grade === Number(grade)
    && (!topics.size || question.topics.some((topic) => topics.has(topic))),
  );
}

export function getScopeTopics(subjectId, grade) {
  const topics = new Set(getScopeQuestions(subjectId, grade).flatMap((question) => question.topics));
  return [...topics].sort((a, b) => a.localeCompare(b, "vi"));
}

export function getQuestionSubjects() {
  const available = new Set(practiceQuestionBank.map((question) => question.subjectId));
  return getScopeSubjects().filter((subject) => available.has(subject.id));
}

export function selectRandomQuestions(questions, count, random = Math.random) {
  const limit = count === "all" ? questions.length : Math.min(Math.max(0, Number(count) || 0), questions.length);
  const order = Array.from({ length: questions.length }, (_, index) => index);
  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }
  return order.slice(0, limit).map((index) => questions[index]);
}
