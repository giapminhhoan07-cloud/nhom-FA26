import { exams } from "../data/exams.js";

const nav = document.querySelector(".main-nav");
document.querySelector(".menu-toggle")?.addEventListener("click", (event) => { const button = event.currentTarget; const open = nav.classList.toggle("open"); button.setAttribute("aria-expanded", String(open)); });
const id = new URLSearchParams(window.location.search).get("id");
const detail = document.querySelector("#exam-detail");
let exam = exams.find((item) => item.id === id) || exams[0];
try { const response = await fetch(`../api/exams.php?id=${encodeURIComponent(id || exam.id)}`); const result = await response.json(); if (response.ok && result.success) exam = result.exam; } catch { /* Use bundled fallback when PHP is unavailable. */ }
detail.innerHTML = `<div class="detail-top"><span class="exam-subject">${exam.subjectName}</span><span class="detail-label">${exam.typeName}</span></div><h1>${exam.title}</h1><p class="detail-description">${exam.description}</p><div class="detail-stats"><div><strong>${exam.questionCount}</strong><span>Số câu hỏi</span></div><div><strong>${exam.durationMinutes}</strong><span>Phút làm bài</span></div><div><strong>${exam.difficultyName}</strong><span>Mức độ</span></div></div><div class="detail-actions"><a class="button button-primary" href="quiz.html?id=${exam.id}">Bắt đầu làm bài <span aria-hidden="true">→</span></a><button class="button button-quiet" type="button" id="favorite-detail">♡ Lưu đề</button></div><div class="detail-note"><strong>Trước khi bắt đầu</strong><p>Hãy chuẩn bị không gian yên tĩnh. Đồng hồ sẽ bắt đầu chạy ngay khi bạn vào bài làm.</p></div>`;
const favoriteButton = document.querySelector("#favorite-detail");
let favorites = JSON.parse(localStorage.getItem("studysphere_favorites") || "[]");
const updateFavorite = () => { const saved = favorites.includes(exam.id); favoriteButton.textContent = saved ? "♥ Đã lưu" : "♡ Lưu đề"; favoriteButton.classList.toggle("saved", saved); };
updateFavorite();
favoriteButton.addEventListener("click", () => { const index = favorites.indexOf(exam.id); index >= 0 ? favorites.splice(index, 1) : favorites.push(exam.id); localStorage.setItem("studysphere_favorites", JSON.stringify(favorites)); updateFavorite(); });
