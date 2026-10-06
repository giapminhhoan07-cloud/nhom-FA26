export function normalizeQuestionAnswer(value) {
  return String(value ?? "").trim().normalize("NFC").replace(/\s+/g, " ").toLocaleLowerCase("vi");
}

export function isQuestionAnswered(answer, question) {
  return question.type === "short_answer"
    ? normalizeQuestionAnswer(answer).length > 0
    : answer !== null && answer !== undefined;
}

export function isQuestionAnswerCorrect(answer, question) {
  if (!isQuestionAnswered(answer, question)) return false;
  return question.type === "short_answer"
    ? normalizeQuestionAnswer(answer) === normalizeQuestionAnswer(question.answer)
    : answer === question.correctAnswer;
}
