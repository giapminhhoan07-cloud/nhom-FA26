import { practiceTests } from "../data/practice-tests.js";

const list = document.querySelector("#practice-test-list");
const icons = { toan: "∑", "dia-li": "◌", "lich-su": "⌛" };

list.innerHTML = practiceTests.map((test) => `
  <a class="practice-test-card" href="quiz.html?test=${encodeURIComponent(test.id)}">
    <span class="practice-test-subject"><span class="practice-test-icon" aria-hidden="true">${icons[test.subjectId]}</span>${test.subjectName}</span>
    <h2>${test.title}</h2>
    <p>${test.description}</p>
    <span class="practice-test-meta"><span>${test.questions.length} câu hỏi</span><span>${test.durationMinutes} phút</span><span>Từ dễ đến khó</span></span>
    <span class="practice-test-start"><span>Bắt đầu kiểm tra</span><span aria-hidden="true">→</span></span>
  </a>
`).join("");

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
menuToggle?.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});