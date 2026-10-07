import { faqData, supportContact } from "../data/supportFaq.js";
import { searchFaqs } from "./supportSearch.js";

const categoryList = document.querySelector("#faq-categories");
const resultsContainer = document.querySelector("#faq-results");
const searchInput = document.querySelector("#faq-search");
const resultCount = document.querySelector("#faq-result-count");
const contactForm = document.querySelector("#support-form");
const contactFormSection = document.querySelector("#contact-form-section");
const formSuccess = document.querySelector("#form-success");
const formNotice = document.querySelector("#form-notice");
const supportEmailLink = document.querySelector("#support-email-link");
const supportContactEmail = document.querySelector("#support-contact-email");
const supportHours = document.querySelector("#support-hours");
const emailText = supportContact.email;
let activeCategory = faqData[0].id;
let expandedFaqId = null;

supportEmailLink.href = `mailto:${emailText}`;
supportEmailLink.textContent = emailText;
supportContactEmail.href = `mailto:${emailText}`;
supportContactEmail.querySelector("strong").textContent = emailText;
supportHours.querySelector("strong").textContent = supportContact.hours;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function renderCategories() {
  categoryList.innerHTML = faqData.map((group) => `
    <button class="faq-category${group.id === activeCategory ? " is-active" : ""}" type="button"
      data-category="${escapeHtml(group.id)}" aria-pressed="${group.id === activeCategory}">
      <span>${escapeHtml(group.category)}</span><span aria-hidden="true">→</span>
    </button>
  `).join("");
}

function renderFaqCard(faq) {
  const isExpanded = faq.id === expandedFaqId;
  const answerId = `faq-answer-${faq.id}`;
  const feedback = isExpanded ? `
    <div class="faq-feedback">
      <p>Câu trả lời này có giúp bạn không?</p>
      <div class="faq-feedback-actions">
        <button class="button button-secondary" type="button" data-feedback="yes">Có, cảm ơn!</button>
        <button class="button button-secondary" type="button" data-feedback="no">Chưa giải quyết được</button>
      </div>
      <p class="faq-thanks" data-feedback-message role="status" aria-live="polite" hidden>Rất vui vì StudySphere đã giúp được bạn!</p>
      <div class="faq-escalation" data-escalation role="status" aria-live="polite" hidden>
        <p>Không sao! Bạn có thể liên hệ trực tiếp với đội ngũ tư vấn của StudySphere.</p>
        <button class="button button-primary" type="button" data-open-contact data-topic="${escapeHtml(faq.categoryId)}">
          Liên hệ tư vấn viên <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  ` : "";

  return `
    <article class="faq-item${isExpanded ? " is-open" : ""}">
      <h3>
        <button class="faq-question" type="button" id="faq-question-${escapeHtml(faq.id)}"
          aria-expanded="${isExpanded}" aria-controls="${answerId}" data-faq-id="${escapeHtml(faq.id)}">
          <span>${escapeHtml(faq.question)}</span>
          <span class="faq-chevron" aria-hidden="true">⌄</span>
        </button>
      </h3>
      <div class="faq-answer" id="${answerId}" role="region" aria-labelledby="faq-question-${escapeHtml(faq.id)}" ${isExpanded ? "" : "hidden"}>
        <p>${escapeHtml(faq.answer)}</p>
        ${feedback}
      </div>
    </article>
  `;
}

function renderResults() {
  const query = searchInput.value.trim();
  if (!query) {
    const group = faqData.find((item) => item.id === activeCategory) || faqData[0];
    const questions = group.questions.map((faq, index) => ({
      ...faq,
      id: `${group.id}-${index}`,
      category: group.category,
      categoryId: group.id,
    }));
    resultCount.textContent = `${questions.length} câu hỏi`;
    resultsContainer.innerHTML = `
      <div class="faq-list-heading"><h3>${escapeHtml(group.category)}</h3></div>
      <div class="faq-list">${questions.map(renderFaqCard).join("")}</div>
    `;
    return;
  }

  const matches = searchFaqs(query, faqData);
  resultCount.textContent = `${matches.length} câu hỏi phù hợp`;
  if (!matches.length) {
    resultsContainer.innerHTML = `
      <div class="faq-empty">
        <span class="faq-empty-icon" aria-hidden="true">?</span>
        <h3>Không tìm thấy câu trả lời phù hợp.</h3>
        <p>Đừng lo! Bạn có thể gửi câu hỏi trực tiếp cho đội ngũ StudySphere.</p>
        <button class="button button-primary" type="button" data-open-contact>
          Liên hệ tư vấn viên <span aria-hidden="true">→</span>
        </button>
      </div>
    `;
    return;
  }

  const groupedMatches = faqData
    .map((group) => ({
      ...group,
      questions: matches.filter((faq) => faq.categoryId === group.id),
    }))
    .filter((group) => group.questions.length);

  resultsContainer.innerHTML = groupedMatches.map((group) => `
    <section class="faq-match-group" aria-label="${escapeHtml(group.category)}">
      <div class="faq-list-heading"><h3>${escapeHtml(group.category)}</h3></div>
      <div class="faq-list">${group.questions.map(renderFaqCard).join("")}</div>
    </section>
  `).join("");
}

function setFieldError(input, errorId, message) {
  const error = document.querySelector(`#${errorId}`);
  input.setAttribute("aria-invalid", String(Boolean(message)));
  error.textContent = message;
  error.hidden = !message;
}

function openContactForm(topicId) {
  const topicMap = {
    account: "Tài khoản",
    exams: "Bài thi",
    results: "Kết quả",
    "exam-library": "Đề thi",
    troubleshooting: "Lỗi website",
  };
  if (topicMap[topicId]) {
    document.querySelector("#support-topic").value = topicMap[topicId];
  }
  contactFormSection.scrollIntoView({ behavior: "smooth", block: "start" });
  document.querySelector("#support-name").focus({ preventScroll: true });
}

categoryList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  expandedFaqId = null;
  renderCategories();
  renderResults();
});

searchInput.addEventListener("input", () => {
  expandedFaqId = null;
  renderResults();
});

resultsContainer.addEventListener("click", (event) => {
  const questionButton = event.target.closest("[data-faq-id]");
  if (questionButton) {
    expandedFaqId = expandedFaqId === questionButton.dataset.faqId ? null : questionButton.dataset.faqId;
    renderResults();
    return;
  }

  const feedbackButton = event.target.closest("[data-feedback]");
  if (feedbackButton) {
    const item = feedbackButton.closest(".faq-feedback");
    if (feedbackButton.dataset.feedback === "yes") {
      item.querySelector("[data-feedback-message]").hidden = false;
      item.querySelector("[data-escalation]").hidden = true;
    } else {
      item.querySelector("[data-escalation]").hidden = false;
      item.querySelector("[data-feedback-message]").hidden = true;
    }
    return;
  }

  const contactButton = event.target.closest("[data-open-contact]");
  if (contactButton) openContactForm(contactButton.dataset.topic);
});

contactForm.addEventListener("input", (event) => {
  const input = event.target;
  const errorId = input.dataset.errorId;
  if (errorId) setFieldError(input, errorId, "");
});

contactForm.querySelectorAll("[aria-describedby]").forEach((input) => {
  input.dataset.errorId = input.getAttribute("aria-describedby");
});

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nameInput = contactForm.elements.namedItem("name");
  const emailInput = contactForm.elements.namedItem("email");
  const topicInput = contactForm.elements.namedItem("topic");
  const messageInput = contactForm.elements.namedItem("message");
  const fields = [
    [nameInput, "name-error", nameInput.value.trim() ? "" : "Nhập họ và tên của bạn."],
    [emailInput, "email-error", !emailInput.value.trim()
      ? "Nhập email của bạn."
      : emailInput.validity.typeMismatch ? "Email chưa đúng định dạng." : ""],
    [topicInput, "topic-error", topicInput.value ? "" : "Chọn một chủ đề."],
    [messageInput, "message-error", messageInput.value.trim() ? "" : "Mô tả vấn đề bạn đang gặp phải."],
  ];

  fields.forEach(([input, errorId, message]) => setFieldError(input, errorId, message));
  const firstInvalid = fields.find(([, , message]) => message)?.[0];
  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  try {
    const feedback = JSON.parse(localStorage.getItem("studysphere_feedback") || "[]");
    if (!Array.isArray(feedback)) throw new Error("Dữ liệu phản hồi không hợp lệ.");
    const currentUser = (() => {
      for (const key of ["studysphere_current_user", "studysphere_session", "studysphere_user_session"]) {
        try {
          const user = JSON.parse(localStorage.getItem(key) || "null");
          if (user && typeof user === "object") return user;
        } catch {
          continue;
        }
      }
      return null;
    })();
    feedback.unshift({
      id: `contact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      source: "contact",
      userId: currentUser?.id || "",
      userName: nameInput.value.trim(),
      email: emailInput.value.trim(),
      type: topicInput.value,
      comment: messageInput.value.trim(),
      submittedAt: new Date().toISOString(),
      status: "new",
    });
    localStorage.setItem("studysphere_feedback", JSON.stringify(feedback));
  } catch {
    formNotice.textContent = "Không thể lưu yêu cầu trong trình duyệt này. Vui lòng gửi email trực tiếp đến địa chỉ hỗ trợ bên dưới.";
    formNotice.classList.add("is-error");
    formNotice.focus();
    return;
  }

  contactForm.hidden = true;
  formSuccess.hidden = false;
  formSuccess.focus();
});

renderCategories();
renderResults();
