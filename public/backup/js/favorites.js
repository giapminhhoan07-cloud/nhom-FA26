import { exams } from "../data/exams.js";
const ids = JSON.parse(localStorage.getItem("studysphere_favorites") || "[]");
const list = document.querySelector("#favorite-list");
const saved = exams.filter((exam) => ids.includes(exam.id));
if (!saved.length) { list.hidden = true; document.querySelector("#favorite-empty").hidden = false; } else { list.innerHTML = saved.map((exam) => `<article class="exam-card"><div class="exam-card-top"><span class="exam-subject">${exam.subjectName}</span><span class="exam-year">${exam.year}</span></div><h3>${exam.title}</h3><p>${exam.description}</p><div class="exam-meta"><span>◷ ${exam.durationMinutes} phút</span><span>▤ ${exam.questionCount} câu</span></div><a class="exam-card-link" href="exam-detail.html?id=${exam.id}" aria-label="Xem ${exam.title}">↗</a></article>`).join(""); }
