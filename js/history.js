const list = document.querySelector("#history-list");
const count = document.querySelector("#history-count");
const search = document.querySelector("#history-search");
const status = document.querySelector("#history-status");

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("studysphere_current_user") || "null");
  } catch {
    return null;
  }
}

function formatDate(value) {
	return new Date(value).toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function renderHistory(items) {
	const query = search.value.trim().toLowerCase();
	const filtered = items.filter((item) => {
		const passed = Number(item.score) >= 5;
		const examTitle = item.exam_title || item.examTitle || "";
		const matchesSearch = !query || examTitle.toLowerCase().includes(query);
		const matchesStatus = status.value === "all" || (status.value === "passed" ? passed : !passed);
		return matchesSearch && matchesStatus;
	});

	count.textContent = `${filtered.length} lần làm`;
	if (!filtered.length) {
		list.innerHTML = `<div class="empty-state"><strong>${items.length ? "Không tìm thấy kết quả phù hợp" : "Chưa có lịch sử làm bài"}</strong><p>${items.length ? "Hãy thử đổi từ khóa hoặc trạng thái lọc." : "Hoàn thành một đề để thấy kết quả ở đây."}</p>${items.length ? "" : '<a class="button button-primary" href="exams.html">Chọn đề đầu tiên</a>'}</div>`;
		return;
	}

	list.innerHTML = filtered.map((item) => {
		const score = Number(item.score ?? 0);
		const correctCount = Number(item.correct_count ?? item.correctCount ?? 0);
		const totalQuestions = Number(item.total_questions ?? item.totalQuestions ?? 0);
		const attemptId = item.id || item.attemptId;
		const examTitle = item.exam_title || item.examTitle || "Bài làm";
		const submittedAt = item.submitted_at || item.submittedAt || new Date().toISOString();
		const passed = score >= 5;
		return `<article class="history-item ${passed ? "is-passed" : "is-failed"}">
			<div class="history-item-marker" aria-hidden="true">${passed ? "✓" : "!"}</div>
			<div class="history-item-main"><span class="history-subject">${passed ? "Tiếp tục phát huy" : "Cần luyện thêm"}</span><h3>${examTitle}</h3><p>${formatDate(submittedAt)} <span aria-hidden="true">·</span> ${correctCount}/${totalQuestions} câu đúng</p></div>
			<div class="history-score"><strong>${Number(score).toFixed(1)}</strong><span>/10 điểm</span></div>
			<span class="history-status ${passed ? "passed" : "failed"}">${passed ? "Đạt" : "Chưa đạt"}</span>
			<a class="button button-quiet history-review" href="result.html?attempt=${encodeURIComponent(attemptId)}">Xem lại <span aria-hidden="true">↗</span></a>
		</article>`;
	}).join("");
}

async function loadHistory() {
	const currentUser = getCurrentUser();
	const fallback = JSON.parse(localStorage.getItem("studysphere_history") || "[]");

	if (!currentUser?.id) {
		renderHistory(fallback);
		return;
	}

	try {
		const response = await fetch("../api/attempts.php", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ action: "get_attempts", user_id: currentUser.id }),
		});
		const data = await response.json();
		const attempts = Array.isArray(data.attempts) ? data.attempts : fallback;
		renderHistory(attempts);
	} catch {
		renderHistory(fallback);
	}
}

search.addEventListener("input", () => loadHistory());
status.addEventListener("change", () => loadHistory());
loadHistory();
