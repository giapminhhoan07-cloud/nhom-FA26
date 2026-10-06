import { exams as seedExams } from "../data/exams.js";

const currentUser = (() => {
  try { return JSON.parse(localStorage.getItem("studysphere_current_user") || "null"); } catch { return null; }
})();

const isAdmin = currentUser && (currentUser.role === "admin" || currentUser.is_admin === true || currentUser.isAdmin === true || Number(currentUser.is_admin) === 1);

if (!isAdmin) {
  window.location.replace("auth.html?return=admin");
} else {
  const form = document.querySelector("#exam-form");
  const list = document.querySelector("#admin-exam-list");
  const formMessage = document.querySelector("#form-message");
  const listMessage = document.querySelector("#list-message");
  const fileInput = document.querySelector("#exam-file");
  const exportPanel = document.querySelector("#export-panel");
  const exportNote = document.querySelector("#export-note");
  const exportSource = document.querySelector("#export-source");
  const copyExportButton = document.querySelector("#copy-export");
  const downloadExportButton = document.querySelector("#download-export");
  const saveToFolderButton = document.querySelector("#save-to-folder");
  const searchInput = document.querySelector("#exam-search");
  const subjectFilter = document.querySelector("#exam-subject-filter");
  const statusFilter = document.querySelector("#exam-status-filter");

  const subjectNames = {
    toan: "Toán",
    "ngu-van": "Ngữ văn",
    "tieng-anh": "Tiếng Anh",
    "vat-ly": "Vật lý",
    "dia-li": "Địa lí",
    "lich-su": "Lịch sử",
  };
  const typeNames = {
    "minh-hoa": "Đề minh họa",
    "khao-sat": "Đề khảo sát",
    "thi-thu": "Đề thi thử",
    "on-tap": "Đề ôn tập",
    thpt: "Tốt nghiệp THPT",
  };
  const difficultyNames = { easy: "Cơ bản", medium: "Trung bình", hard: "Khá khó" };
  const state = { editingId: null, pendingUpload: null };

  if (!window.showDirectoryPicker) saveToFolderButton.hidden = true;

  const setMessage = (element, text = "", success = false) => {
    if (!element) return;
    element.textContent = text;
    element.classList.toggle("success", Boolean(success && text));
    element.classList.toggle("error", !success && Boolean(text));
  };

  function readLocalData(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  }

  function getCustomExams() {
    const custom = readLocalData("studysphere_custom_exams", []);
    return Array.isArray(custom) ? custom : [];
  }

  function getExamCatalog() {
    const merged = [...seedExams, ...getCustomExams()];
    const seen = new Map();
    merged.forEach((exam) => {
      if (exam && exam.id) seen.set(exam.id, exam);
    });
    return Array.from(seen.values());
  }

  function persistCustomExams(items) {
    localStorage.setItem("studysphere_custom_exams", JSON.stringify(items));
  }

  function renderDashboard() {
    const statGrid = document.querySelector("#admin-stat-grid");
    const feedbackList = document.querySelector("#admin-feedback-list");
    const feedbackCount = document.querySelector("#admin-feedback-count");
    if (!statGrid || !feedbackList || !feedbackCount) return;

    const history = readLocalData("studysphere_history", []);
    const feedback = readLocalData("studysphere_feedback", []);
    const attempts = Array.isArray(history) ? history : [];
    const reviews = Array.isArray(feedback) ? feedback : [];
    const scores = attempts.map((attempt) => Number(attempt.score)).filter(Number.isFinite);
    const averageScore = scores.length ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1) : "0.0";
    const averageRating = reviews.length ? (reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / reviews.length).toFixed(1) : "0.0";
    const stats = [
      { label: "Tổng số đề thi", value: getExamCatalog().length },
      { label: "Lượt làm bài", value: attempts.length },
      { label: "Điểm trung bình", value: `${averageScore}/10` },
      { label: "Đánh giá TB", value: `${averageRating}/5` },
    ];

    statGrid.innerHTML = stats.map(({ label, value }) => `<article class="admin-stat"><span>${label}</span><strong>${value}</strong></article>`).join("");

    feedbackCount.textContent = `${reviews.length} đánh giá`;
    const recentReviews = [...reviews].sort((first, second) => new Date(second.submittedAt || 0) - new Date(first.submittedAt || 0)).slice(0, 8);
    feedbackList.innerHTML = recentReviews.length ? recentReviews.map((item) => {
      const rating = Math.max(0, Math.min(5, Number(item.rating) || 0));
      const date = item.submittedAt ? new Date(item.submittedAt).toLocaleDateString("vi-VN") : "Chưa rõ";
      return `<article class="admin-feedback-item"><div class="admin-feedback-heading"><strong>${escapeHtml(item.examTitle || "Bài kiểm tra")}</strong><span class="admin-feedback-stars" aria-label="${rating} trên 5 sao">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</span></div><p>${escapeHtml(item.comment || "Chỉ gửi đánh giá sao.")}</p><span class="admin-feedback-meta">${escapeHtml(item.userName || "Người học")} · ${escapeHtml(date)}</span></article>`;
    }).join("") : '<p class="admin-feedback-empty">Chưa có đánh giá nào. Phản hồi sẽ xuất hiện tại đây sau khi người học hoàn thành bài kiểm tra.</p>';
  }

  function buildExportSource(items) {
    return `export const exams = ${JSON.stringify(items, null, 2)};\n`;
  }

  function getFormPayload() {
    const data = new FormData(form);
    const file = fileInput.files && fileInput.files[0];
    const id = String(data.get("id") || "").trim();
    const title = String(data.get("title") || "").trim();
    const subjectId = String(data.get("subject_id") || "").trim();
    const type = String(data.get("exam_type") || "").trim();
    const difficulty = String(data.get("difficulty") || "medium").trim();

    if (!id) throw new Error("Vui lòng nhập mã đề.");
    if (!title) throw new Error("Vui lòng nhập tên đề thi.");
    if (!subjectId) throw new Error("Vui lòng chọn môn học.");
    if (!type) throw new Error("Vui lòng chọn loại đề.");
    if (!state.editingId && !file) throw new Error("Vui lòng chọn file PDF của đề thi.");
    if (file && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("File đã chọn không phải PDF.");

    const catalog = getExamCatalog();
    const sameIdExists = catalog.some((exam) => exam.id === id && exam.id !== state.editingId);
    if (sameIdExists) throw new Error("Mã đề đã tồn tại trong kho dữ liệu.");

    const existingExam = catalog.find((exam) => exam.id === state.editingId) || null;
    const exam = {
      id,
      title,
      subjectId,
      subjectName: subjectNames[subjectId] || subjectId,
      year: Number(data.get("year") || new Date().getFullYear()),
      type,
      typeName: typeNames[type] || type,
      difficulty,
      difficultyName: difficultyNames[difficulty] || difficulty,
      durationMinutes: Number(data.get("duration_minutes") || 60),
      questionCount: Number(existingExam?.questionCount || 0),
      description: String(data.get("description") || "").trim(),
      documentUrl: existingExam?.documentUrl || `../documents/${id}.pdf`,
      featured: data.get("featured") === "on",
    };
    return { exam, file };
  }

  function resetForm({ preserveUpload = false } = {}) {
    form.reset();
    state.editingId = null;
    if (!preserveUpload) state.pendingUpload = null;
    document.querySelector("#exam-action").value = "create";
    document.querySelector("#form-title").textContent = "Tạo đề thi mới";
    document.querySelector("#exam-id").readOnly = false;
    document.querySelector("#exam-year").value = new Date().getFullYear();
    document.querySelector("#exam-duration").value = 60;
    if (!preserveUpload) {
      exportPanel.hidden = true;
      exportSource.value = "";
      copyExportButton.disabled = true;
      downloadExportButton.disabled = true;
      setMessage(formMessage, "");
    }
  }

  function renderList(items) {
    const filtered = Array.isArray(items) ? items : [];
    if (!filtered.length) {
      list.innerHTML = '<div class="admin-empty">Không có đề thi phù hợp với bộ lọc hiện tại.</div>';
      listMessage.textContent = "Không có đề thi phù hợp.";
      return;
    }

    list.innerHTML = filtered.map((exam) => {
      const duration = Number(exam.durationMinutes) > 0 ? `${exam.durationMinutes} phút` : "Xem trong PDF";
      const examType = exam.typeName || typeNames[exam.type] || exam.type || "Đề thi";
      return `
        <article class="admin-exam-item">
          <div>
            <span>${escapeHtml(exam.subjectName || subjectNames[exam.subjectId] || "Môn học")} · ${escapeHtml(exam.year || new Date().getFullYear())}</span>
            <h3>${escapeHtml(exam.title)}</h3>
            <small>${escapeHtml(examType)} · ${escapeHtml(duration)}</small>
          </div>
          <div class="admin-item-actions">
            <button type="button" data-action="edit" data-id="${escapeHtml(exam.id)}">Sửa</button>
            <button type="button" class="admin-delete" data-action="delete" data-id="${escapeHtml(exam.id)}">Xóa</button>
          </div>
        </article>
      `;
    }).join("");
    listMessage.textContent = `Hiển thị ${filtered.length} đề thi.`;
  }

  function applyFilters() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const subject = subjectFilter?.value || "all";
    const status = statusFilter?.value || "all";

    const filtered = getExamCatalog().filter((exam) => {
      const matchesQuery = !query || `${exam.title} ${exam.subjectName || ""}`.toLowerCase().includes(query);
      const matchesSubject = subject === "all" || exam.subjectId === subject;
      const matchesStatus = status === "all" || (status === "featured" ? Boolean(exam.featured) : !exam.featured);
      return matchesQuery && matchesSubject && matchesStatus;
    });

    renderList(filtered);
  }

  function fillForm(exam) {
    state.editingId = exam.id;
    form.querySelector("#exam-action").value = "edit";
    document.querySelector("#form-title").textContent = "Chỉnh sửa đề thi";
    document.querySelector("#exam-id").value = exam.id;
    document.querySelector("#exam-id").readOnly = true;
    document.querySelector("#exam-title").value = exam.title || "";
    document.querySelector("#exam-subject").value = exam.subjectId || "toan";
    document.querySelector("#exam-year").value = exam.year || new Date().getFullYear();
    document.querySelector("#exam-type").value = exam.type || "minh-hoa";
    document.querySelector("#exam-difficulty").value = exam.difficulty || "medium";
    document.querySelector("#exam-duration").value = exam.durationMinutes || 60;
    document.querySelector("#exam-featured").checked = Boolean(exam.featured);
    document.querySelector("#exam-description").value = exam.description || "";
    fileInput.value = "";
    setMessage(formMessage, `Đang chỉnh sửa: ${exam.title}.`, true);
    document.querySelector("#exam-title").focus();
  }

  list.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const exam = getExamCatalog().find((item) => item.id === button.dataset.id);
    if (!exam) return;

    if (button.dataset.action === "edit") {
      fillForm(exam);
      return;
    }

    if (button.dataset.action === "delete") {
      const confirmed = window.confirm(`Bạn có chắc chắn muốn xóa đề thi "${exam.title}"?

Hành động này chỉ xóa bản ghi trong dữ liệu cục bộ của StudySphere.`);
      if (!confirmed) return;
      const customExams = getCustomExams().filter((item) => item.id !== exam.id);
      persistCustomExams(customExams);
      renderList(getExamCatalog());
      renderDashboard();
      if (state.editingId === exam.id) resetForm();
      setMessage(listMessage, `Đã xóa đề thi "${exam.title}".`, true);
    }
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    try {
      const { exam, file } = getFormPayload();
      const customExams = getCustomExams();
      const existingIndex = customExams.findIndex((item) => item.id === state.editingId);
      let successMessage;

      if (state.editingId) {
        const updatedList = customExams.map((item) => (item.id === state.editingId ? exam : item));
        if (existingIndex < 0) {
          updatedList.push(exam);
        }
        persistCustomExams(updatedList);
        successMessage = `Đã lưu thay đổi cho "${exam.title}".`;
      } else {
        customExams.push(exam);
        persistCustomExams(customExams);
        successMessage = `Đã tạo đề thi "${exam.title}".`;
      }

      state.pendingUpload = file ? { exam, file } : null;
      if (file) {
        const exportItems = getExamCatalog();
        exportSource.value = buildExportSource(exportItems);
        exportNote.textContent = "Đã lưu bản ghi nội dung. Bạn có thể tiếp tục lưu file PDF và cập nhật data/exams.js trong thư mục công việc nếu cần.";
        exportPanel.hidden = false;
        copyExportButton.disabled = false;
        downloadExportButton.disabled = false;
      }
      renderList(getExamCatalog());
      renderDashboard();
      resetForm({ preserveUpload: Boolean(file) });
      setMessage(formMessage, successMessage, true);
    } catch (error) {
      setMessage(formMessage, error.message);
    }
  });

  document.querySelector("#new-exam-button").addEventListener("click", resetForm);
  document.querySelector("#reset-form").addEventListener("click", resetForm);

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      fileInput.value = "";
      setMessage(formMessage, "Vui lòng chọn đúng file PDF.");
      return;
    }
    setMessage(formMessage, `Đã chọn ${file.name}. PDF sẽ được lưu vào thư mục documents chung sau khi tạo hoặc cập nhật đề.`, true);
  });

  saveToFolderButton.addEventListener("click", async () => {
    if (!state.pendingUpload) return;
    try {
      const root = await window.showDirectoryPicker({ mode: "readwrite" });
      const documents = await root.getDirectoryHandle("documents", { create: true });
      const dataDir = await root.getDirectoryHandle("data", { create: true });
      const pdfHandle = await documents.getFileHandle(`${state.pendingUpload.exam.id}.pdf`, { create: true });
      const pdfWriter = await pdfHandle.createWritable();
      await pdfWriter.write(state.pendingUpload.file);
      await pdfWriter.close();
      const dataHandle = await dataDir.getFileHandle("exams.js", { create: true });
      const dataWriter = await dataHandle.createWritable();
      await dataWriter.write(buildExportSource(getExamCatalog()));
      await dataWriter.close();
      setMessage(formMessage, "Đã lưu PDF và dữ liệu đề vào thư mục được chọn.", true);
    } catch (error) {
      if (error.name !== "AbortError") setMessage(formMessage, `Không lưu được vào thư mục: ${error.message}`);
    }
  });

  copyExportButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(exportSource.value || buildExportSource(getExamCatalog()));
      setMessage(formMessage, "Đã sao chép dữ liệu exams.js vào clipboard.", true);
    } catch {
      exportSource.select();
      document.execCommand("copy");
      setMessage(formMessage, "Đã chọn nội dung. Nhấn Ctrl+C để sao chép.");
    }
  });

  downloadExportButton.addEventListener("click", () => {
    const content = exportSource.value || buildExportSource(getExamCatalog());
    const file = new Blob([content], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = "exams.js";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  searchInput?.addEventListener("input", applyFilters);
  subjectFilter?.addEventListener("change", applyFilters);
  statusFilter?.addEventListener("change", applyFilters);

  renderDashboard();
  renderList(getExamCatalog());
  resetForm();
  exportSource.value = buildExportSource(getExamCatalog());
  document.querySelector("#exam-year").value = new Date().getFullYear();
}