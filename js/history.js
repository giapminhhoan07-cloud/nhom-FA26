const history = JSON.parse(localStorage.getItem("studysphere_history") || "[]");
const list = document.querySelector("#history-list");
const count = document.querySelector("#history-count");
const search = document.querySelector("#history-search");
const status = document.querySelector("#history-status");

function formatDate(value) {
	return new Date(value).toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function render() {
	const query = search.value.trim().toLowerCase();
	const filtered = history.filter((item) => {
		const passed = Number(item.score) >= 5;
		const matchesSearch = !query || item.examTitle.toLowerCase().includes(query);
		const matchesStatus = status.value === "all" || (status.value === "passed" ? passed : !passed);
		return matchesSearch && matchesStatus;
	});

	count.textContent = `${filtered.length} lần làm`;
	if (!filtered.length) {
		list.innerHTML = `<div class="empty-state"><strong>${history.length ? "Không tìm thấy kết quả phù hợp" : "Chưa có lịch sử làm bài"}</strong><p>${history.length ? "Hãy thử đổi từ khóa hoặc trạng thái lọc." : "Hoàn thành một đề để thấy kết quả ở đây."}</p>${history.length ? "" : '<a class="button button-primary" href="exams.html">Chọn đề đầu tiên</a>'}</div>`;
		return;
	}

	list.innerHTML = filtered.map((item) => {
		const passed = Number(item.score) >= 5;
		return `<article class="history-item ${passed ? "is-passed" : "is-failed"}">
			<div class="history-item-marker" aria-hidden="true">${passed ? "✓" : "!"}</div>
			<div class="history-item-main"><span class="history-subject">${passed ? "Tiếp tục phát huy" : "Cần luyện thêm"}</span><h3>${item.examTitle}</h3><p>${formatDate(item.submittedAt)} <span aria-hidden="true">·</span> ${item.correctCount}/${item.totalQuestions} câu đúng</p></div>
			<div class="history-score"><strong>${Number(item.score).toFixed(1)}</strong><span>/10 điểm</span></div>
			<span class="history-status ${passed ? "passed" : "failed"}">${passed ? "Đạt" : "Chưa đạt"}</span>
			<a class="button button-quiet history-review" href="result.html?attempt=${encodeURIComponent(item.attemptId)}">Xem lại <span aria-hidden="true">↗</span></a>
		</article>`;
	}).join("");
}

search.addEventListener("input", render);
status.addEventListener("change", render);
render();
