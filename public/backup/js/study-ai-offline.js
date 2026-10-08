const normalize = (value) => String(value ?? "").trim().normalize("NFC").toLocaleLowerCase("vi");

const isExplanationRequest = (message) =>
  /(giải thích|giải bài|hướng dẫn|vì sao|tại sao|đáp án|lời giải|cách làm)/i.test(message);

const isDetailRequest = (message) =>
  /(chi tiết hơn|nói rõ hơn|giải thích thêm|kỹ hơn|từng bước|cụ thể hơn)/i.test(message);

const isWrongAnswerRequest = (message) =>
  /(sai|nhầm|mình chọn|tôi chọn|đáp án .*đúng)/i.test(message);

const isExampleRequest = (message) =>
  /(ví dụ|tương tự|bài khác|câu khác)/i.test(message);

const getAnswerLetter = (answer) => String(answer ?? "").match(/^\s*([A-F])(?:[.)]|\s|$)/i)?.[1]?.toUpperCase() || "";

function getStudyLevel(context) {
  const subject = context.subject ? `môn ${context.subject}` : "môn học này";
  const grade = context.grade ? ` lớp ${context.grade}` : "";
  const topic = context.topic ? `, chủ đề ${context.topic}` : "";
  return `${subject}${grade}${topic}`;
}

function makeSimilarMathExample(question) {
  const match = String(question || "").match(/(-?\d+)\s*x\s*([+-])\s*(\d+)\s*=\s*(-?\d+)/i);
  if (!match) return "";
  const originalCoefficient = Number(match[1]);
  const originalConstant = Number(match[3]) * (match[2] === "-" ? -1 : 1);
  if (!originalCoefficient) return "";
  const solution = (Number(match[4]) - originalConstant) / originalCoefficient;
  const sign = match[2];
  const coefficient = originalCoefficient + 1;
  const constant = Number(match[3]) + 2;
  const rightSide = coefficient * solution + constant * (sign === "-" ? -1 : 1);
  return `Thử câu tương tự: ${coefficient}x ${sign} ${constant} = ${rightSide}. Bạn hãy tìm x trước nhé; mình sẽ kiểm tra cách làm của bạn.`;
}

function makeDetailedMathExplanation(context) {
  const question = String(context.question || "");
  const vectors = question.match(/a\s*=\s*\(([^)]+)\).*?b\s*=\s*\(([^)]+)\)/i);
  if (vectors && /tích vô hướng|a\s*[·.]\s*b/i.test(question)) {
    const coordinates = vectors.slice(1).map((vector) =>
      vector.split(/[;,]/).map((coordinate) => Number(coordinate.trim())),
    );
    if (coordinates[0].length === coordinates[1].length
      && coordinates[0].length > 0
      && coordinates.flat().every(Number.isFinite)) {
      const products = coordinates[0].map((left, index) => left * coordinates[1][index]);
      const total = products.reduce((sum, value) => sum + value, 0);
      const steps = products.map((product, index) =>
        `${index + 1}. Nhân hai tọa độ cùng vị trí: ${coordinates[0][index]} × ${coordinates[1][index]} = ${product}.`,
      );
      const answer = String(context.correctAnswer || "").trim();
      return [
        "Tích vô hướng được tính bằng cách nhân từng cặp tọa độ cùng vị trí, sau đó cộng các tích lại:",
        ...steps,
        `${steps.length + 1}. Cộng các kết quả: ${products.join(" + ").replace(/\+ -/g, "- ")} = ${total}.`,
        `Vậy a · b = ${total}.${answer ? ` Đáp án: ${answer}.` : ""}`,
      ].join("\n");
    }
  }

  const equation = question.match(/(-?\d+)\s*x\s*([+-])\s*(\d+)\s*=\s*(-?\d+)/i);
  if (equation) {
    const coefficient = Number(equation[1]);
    const signedConstant = Number(equation[3]) * (equation[2] === "-" ? -1 : 1);
    const rightSide = Number(equation[4]);
    if (coefficient !== 0) {
      const isolatedRightSide = rightSide - signedConstant;
      const solution = isolatedRightSide / coefficient;
      const movedConstant = signedConstant < 0
        ? `cộng ${Math.abs(signedConstant)}`
        : `trừ ${signedConstant}`;
      const firstStep = movedConstant[0].toUpperCase() + movedConstant.slice(1);
      return [
        `Ta giải phương trình ${question.match(/-?\d+\s*x\s*[+-]\s*\d+\s*=\s*-?\d+/i)[0]} bằng cách giữ cân bằng hai vế:`,
        `1. ${firstStep} ở cả hai vế để đưa hạng tử chứa x về một phía: ${coefficient}x = ${isolatedRightSide}.`,
        `2. Chia cả hai vế cho ${coefficient}: x = ${solution}.`,
        `3. Thử lại: thay x = ${solution} vào phương trình ban đầu thì hai vế bằng nhau.`,
      ].join("\n");
    }
  }

  return "";
}

export function createOfflineAnswer(message, context = null, history = []) {
  const prompt = String(message ?? "").trim();
  const normalizedPrompt = normalize(prompt);
  if (!context?.question) {
    return "Mình đang ở chế độ offline miễn phí nên chỉ hỗ trợ theo quy tắc, không tạo câu trả lời linh hoạt như AI online. Bạn gửi môn học và nội dung câu hỏi cụ thể nhé; mình sẽ giúp trong phạm vi có thể.";
  }

  const level = getStudyLevel(context);
  if (context.assessmentInProgress) {
    return `Mình đang hỗ trợ ${level}. Vì bạn đang làm bài thi, mình không tiết lộ đáp án. Hãy xác định kiến thức cần dùng, thử loại những lựa chọn không phù hợp rồi tự tính/đối chiếu lại. Bạn gửi cách làm của bạn, mình có thể giúp kiểm tra hướng suy luận mà không bật mí đáp án.`;
  }

  if (isDetailRequest(normalizedPrompt)) {
    const detailedMath = makeDetailedMathExplanation(context);
    if (detailedMath) return detailedMath;
    if (explanation) {
      return `Mình chỉ có lời giải ngắn được lưu cho câu này: ${explanation}\n\nỞ chế độ offline, mình chưa có thêm dữ kiện để diễn giải sâu hơn mà không đoán. Bạn chỉ rõ bước hoặc từ nào chưa hiểu, mình sẽ tập trung giải thích đúng phần đó nhé.`;
    }
    const previousAnswer = [...history].reverse().find((item) => item.role === "assistant")?.content;
    if (previousAnswer) {
      return `Mình chưa có lời giải chi tiết được lưu cho câu này. Trong phần trả lời trước, bạn muốn mình làm rõ bước hoặc ý nào?`;
    }
  }

  if (isExampleRequest(normalizedPrompt)) {
    const similarMath = makeSimilarMathExample(context.question);
    if (similarMath) return similarMath;
    return `Mình chưa tạo được câu mới tự động cho chủ đề ${context.topic || context.subject || "này"} khi chạy offline. Bạn thử tự đổi số liệu hoặc ngữ liệu trong câu hiện tại để tạo một câu tương tự, rồi gửi lại để mình kiểm tra nhé.`;
  }

  const correctAnswer = String(context.correctAnswer ?? "").trim();
  const explanation = String(context.explanation ?? "").trim();
  const userAnswer = String(context.userAnswer ?? "").trim();
  if (isWrongAnswerRequest(normalizedPrompt) && correctAnswer) {
    if (!userAnswer || normalize(userAnswer) === normalize("Chưa chọn")) {
      return `Mình chưa thấy bạn chọn đáp án nào. Đáp án đúng là ${correctAnswer}.${explanation ? `\n\nGiải thích: ${explanation}` : ""}`;
    }
    const selectedLetter = getAnswerLetter(userAnswer);
    const correctLetter = getAnswerLetter(correctAnswer);
    const askedLetter = normalizedPrompt.match(/đáp án\s+([a-f])\b/i)?.[1]?.toUpperCase();
    if (askedLetter && correctLetter && askedLetter === correctLetter) {
      return `Thật ra đáp án ${askedLetter} là đáp án đúng.${explanation ? `\n\nGiải thích: ${explanation}` : ""}`;
    }
    if (askedLetter && correctLetter && askedLetter !== correctLetter) {
      return `Đáp án ${askedLetter} không đúng; đáp án đúng là ${correctAnswer}.${explanation ? `\n\nGiải thích: ${explanation}` : ""}`;
    }
    if (selectedLetter && correctLetter && selectedLetter === correctLetter) {
      return `Lựa chọn của bạn (${userAnswer}) thực ra là đáp án đúng. ${explanation || `Đáp án đúng là ${correctAnswer}.`}`;
    }
    if (normalize(userAnswer) === normalize(correctAnswer)) {
      return `Lựa chọn của bạn là đáp án đúng. ${explanation}`;
    }
    return `Bạn đã chọn ${userAnswer}; đáp án đúng là ${correctAnswer}.${explanation ? `\n\nGiải thích: ${explanation}` : "\n\nHãy so sánh yêu cầu của đề với ý nghĩa của lựa chọn đúng để tìm chỗ chưa khớp."}`;
  }

  if (isExplanationRequest(normalizedPrompt) && explanation) {
    return `${explanation}${correctAnswer ? `\n\nĐáp án: ${correctAnswer}.` : ""}`;
  }
  if (/(đáp án|lời giải|kiểm tra giúp|mình làm đúng không|tôi làm đúng không)/i.test(normalizedPrompt)
    && correctAnswer && explanation) {
    return `Với câu hỏi ${level}, đáp án là ${correctAnswer}.\n\n${explanation}`;
  }

  const previousAnswer = [...history].reverse().find((item) => item.role === "assistant")?.content;
  if (/(tại sao|vì sao|bước đó|lại chia|ý đó|giải thích thêm)/i.test(normalizedPrompt) && previousAnswer) {
    return `Mình đang dựa trên hướng dẫn trước: ${previousAnswer.slice(0, 650)}\n\nBạn muốn mình nói rõ bước hoặc khái niệm nào?`;
  }

  return `Mình đang ở chế độ offline miễn phí và chưa rõ bạn cần gì về câu hỏi thuộc ${level}. Bạn có thể hỏi “giải thích câu này”, “tại sao lựa chọn mình chọn sai?” hoặc gửi bước giải bạn đang vướng nhé.`;
}

export const studyAiOfflineInternals = { makeSimilarMathExample, makeDetailedMathExplanation };
