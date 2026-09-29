import { defineUpcomingTests } from "./practice-tests-catalog.js";

export const mathUpcomingTests = defineUpcomingTests("toan", "Toán", [
  { id: "toan-10-ham-so-bac-hai", grade: 10, title: "Toán 10 · Hàm số bậc hai", description: "Ôn tập đồ thị, giá trị và dấu của tam thức bậc hai.", examType: "topic-review", difficulty: "basic", durationMinutes: 30 },
  { id: "toan-10-he-thuc-tam-giac", grade: 10, title: "Toán 10 · Hệ thức lượng tam giác", description: "Luyện hệ thức lượng, định lý sin và định lý cosin.", examType: "topic-review", difficulty: "medium", durationMinutes: 30 },
  { id: "toan-11-day-so-cap-so", grade: 11, title: "Toán 11 · Dãy số và cấp số", description: "Ôn quy luật dãy số, cấp số cộng và cấp số nhân.", examType: "topic-review", difficulty: "medium", durationMinutes: 30 },
  { id: "toan-11-ham-so-luong-giac", grade: 11, title: "Toán 11 · Hàm số lượng giác", description: "Luyện tập giá trị, chu kỳ và đồ thị các hàm lượng giác.", examType: "topic-review", difficulty: "upper", durationMinutes: 30 },
  { id: "toan-12-dao-ham-bien-thien", grade: 12, title: "Toán 12 · Đạo hàm và khảo sát biến thiên", description: "Ôn đạo hàm, cực trị và đọc bảng biến thiên.", examType: "topic-review", difficulty: "medium", durationMinutes: 45 },
  { id: "toan-12-nguyen-ham-tich-phan", grade: 12, title: "Toán 12 · Nguyên hàm và tích phân", description: "Luyện nguyên hàm, tích phân xác định và ứng dụng cơ bản.", examType: "topic-review", difficulty: "upper", durationMinutes: 45 },
  { id: "toan-12-giua-hoc-ky", grade: 12, title: "Toán 12 · Ôn tập giữa học kỳ", description: "Đề cương ôn tập kiến thức trọng tâm học kỳ.", examType: "midterm", difficulty: "medium", durationMinutes: 60 },
  { id: "toan-12-cuoi-hoc-ky", grade: 12, title: "Toán 12 · Ôn tập cuối học kỳ", description: "Đề cương tổng hợp các mạch kiến thức học kỳ.", examType: "final", difficulty: "upper", durationMinutes: 90 },
  { id: "toan-12-mo-phong-tot-nghiep-02", grade: 12, title: "Toán 12 · Ôn thi tốt nghiệp mô phỏng số 02", description: "Đề cương mô phỏng theo các chủ đề trọng tâm lớp 12.", examType: "graduation-practice", difficulty: "advanced", durationMinutes: 90 },
  { id: "toan-12-mo-phong-tot-nghiep-03", grade: 12, title: "Toán 12 · Ôn thi tốt nghiệp mô phỏng số 03", description: "Đề cương vận dụng tổng hợp, đang được biên soạn.", examType: "graduation-practice", difficulty: "advanced", durationMinutes: 90 },
]);