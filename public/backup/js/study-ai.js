const historyLimit = 8;
const suggestions = [
  { label: "💡 Giải thích câu này", prompt: "Giải thích câu hỏi hiện tại cho mình theo từng bước, đừng chỉ đưa đáp án." },
  { label: "Tại sao đáp án B sai?", prompt: "Tại sao đáp án B sai? Giải thích ngắn gọn và chỉ cách suy nghĩ đúng." },
  { label: "Giải bài này dễ hiểu hơn", prompt: "Hướng dẫn mình giải câu hiện tại bằng cách đơn giản, từng bước." },
  { label: "Cho mình một ví dụ tương tự", prompt: "Cho mình một ví dụ tương tự, độ khó tương đương để mình tự thử nhé." },
];

let quizContext = window.studysphereCurrentQuizContext || null;
let contextKey = quizContext?.questionId || "";
let conversation = [];
let pending = false;
let lastFailedMessage = "";

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = new URL("../css/study-ai.css", import.meta.url).href;
document.head.append(stylesheet);

const launcher = document.createElement("button");
launcher.className = "study-ai-launcher";
launcher.type = "button";
launcher.setAttribute("aria-label", "Mở Study AI");
launcher.setAttribute("aria-expanded", "false");
launcher.setAttribute("aria-controls", "study-ai-panel");
launcher.innerHTML = '<span aria-hidden="true">✨</span><span class="study-ai-launcher-label">Study AI</span>';

const panel = document.createElement("section");
panel.className = "study-ai-panel";
panel.id = "study-ai-panel";
panel.setAttribute("aria-label", "Trợ lý học tập Study AI");
panel.hidden = true;
panel.innerHTML = `
  <header class="study-ai-header">
    <div class="study-ai-heading"><span class="study-ai-avatar" aria-hidden="true">✨</span><div><strong>Study AI</strong><small>Trợ lý học tập</small></div></div>
    <button class="study-ai-close" type="button" aria-label="Đóng Study AI">×</button>
  </header>
  <div class="study-ai-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
  <div class="study-ai-suggestions" aria-label="Câu hỏi gợi ý"></div>
  <form class="study-ai-form">
    <label class="study-ai-visually-hidden" for="study-ai-input">Nhập câu hỏi cho Study AI</label>
    <textarea id="study-ai-input" name="message" rows="1" maxlength="1500" placeholder="Hỏi Study AI..." required></textarea>
    <button class="study-ai-send" type="submit" aria-label="Gửi câu hỏi">➤</button>
  </form>
  <p class="study-ai-disclaimer">Study AI có thể trả lời chưa chính xác. Hãy đối chiếu với bài học.</p>
`;
document.body.append(launcher, panel);

const messagesElement = panel.querySelector(".study-ai-messages");
const suggestionsElement = panel.querySelector(".study-ai-suggestions");
const form = panel.querySelector(".study-ai-form");
const input = panel.querySelector("#study-ai-input");
const sendButton = panel.querySelector(".study-ai-send");
const closeButton = panel.querySelector(".study-ai-close");

function scrollToLatest() {
  messagesElement.scrollTop = messagesElement.scrollHeight;
}

function addMessage(role, content, { retry = false, loading = false } = {}) {
  const message = document.createElement("div");
  message.className = `study-ai-message is-${role}${loading ? " is-loading" : ""}`;
  if (loading) {
    message.textContent = "✨ Study AI đang tìm cách giải dễ hiểu nhất...";
  } else {
    const text = document.createElement("p");
    text.textContent = content;
    message.append(text);
  }

  if (retry) {
    const retryButton = document.createElement("button");
    retryButton.className = "study-ai-retry";
    retryButton.type = "button";
    retryButton.textContent = "🔄 Thử lại";
    retryButton.addEventListener("click", () => requestAnswer(lastFailedMessage, { reuseLastUserMessage: true }));
    message.append(retryButton);
  }

  messagesElement.append(message);
  scrollToLatest();
  return message;
}

function renderSuggestions() {
  suggestionsElement.replaceChildren();
  if (conversation.length) return;
  for (const suggestion of suggestions) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = suggestion.label;
    button.disabled = pending;
    button.addEventListener("click", () => requestAnswer(suggestion.prompt));
    suggestionsElement.append(button);
  }
}

function addWelcomeMessage() {
  addMessage("assistant", "Chào bạn! Mình là Study AI. Mình có thể giải thích câu hỏi, phân tích đáp án, hướng dẫn cách giải hoặc tạo ví dụ tương tự. Bạn muốn bắt đầu từ đâu?");
}

function setPending(value) {
  pending = value;
  input.disabled = value;
  sendButton.disabled = value;
  launcher.disabled = false;
  renderSuggestions();
}

async function requestAnswer(message, { reuseLastUserMessage = false } = {}) {
  const prompt = String(message || "").trim().slice(0, 1_500);
  if (!prompt || pending) return;

  lastFailedMessage = prompt;
  const historySource = reuseLastUserMessage ? conversation.slice(0, -1) : conversation;
  const history = historySource.slice(-historyLimit);
  if (!reuseLastUserMessage) {
    conversation.push({ role: "user", content: prompt });
    addMessage("user", prompt);
  }
  const loadingMessage = addMessage("assistant", "", { loading: true });
  setPending(true);

  try {
    const response = await fetch("/api/study-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ message: prompt, context: quizContext, history }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(payload?.error || "Study AI hiện đang gặp sự cố. Bạn có thể thử lại sau.");
    if (typeof payload?.answer !== "string" || !payload.answer.trim()) {
      throw new Error("Study AI chưa tạo được câu trả lời. Vui lòng thử lại.");
    }
    loadingMessage.remove();
    conversation.push({ role: "assistant", content: payload.answer.trim() });
    addMessage("assistant", payload.answer.trim());
    lastFailedMessage = "";
  } catch (error) {
    loadingMessage.remove();
    const messageText = error instanceof TypeError
      ? "Không kết nối được với Study AI. Kiểm tra kết nối mạng rồi thử lại."
      : error.message || "Study AI hiện đang gặp sự cố. Bạn có thể thử lại sau.";
    addMessage("error", messageText, { retry: true });
    console.error("Study AI request could not be completed.", error?.name || "UnknownError");
  } finally {
    setPending(false);
  }
}

function openPanel(prompt = "") {
  panel.hidden = false;
  launcher.setAttribute("aria-expanded", "true");
  renderSuggestions();
  input.focus();
  if (prompt) requestAnswer(prompt);
}

function closePanel() {
  panel.hidden = true;
  launcher.setAttribute("aria-expanded", "false");
  launcher.focus();
}

function resetConversation() {
  conversation = [];
  lastFailedMessage = "";
  messagesElement.replaceChildren();
  addWelcomeMessage();
  renderSuggestions();
}

launcher.addEventListener("click", () => openPanel());
closeButton.addEventListener("click", closePanel);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = input.value;
  if (!message.trim()) return;
  input.value = "";
  input.style.height = "";
  requestAnswer(message);
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
});
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !panel.hidden) closePanel();
});
document.addEventListener("studysphere:quiz-context", (event) => {
  const nextContext = event.detail && typeof event.detail === "object" ? event.detail : null;
  const nextKey = nextContext?.questionId || "";
  if (contextKey && nextKey !== contextKey) resetConversation();
  quizContext = nextContext;
  contextKey = nextKey;
});
document.addEventListener("studysphere:study-ai-open", (event) => {
  openPanel(event.detail?.prompt || "");
});

addWelcomeMessage();
renderSuggestions();
document.dispatchEvent(new CustomEvent("studysphere:study-ai-ready"));
