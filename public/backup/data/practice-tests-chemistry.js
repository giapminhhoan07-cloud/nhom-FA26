import { defineUpcomingTests } from "./practice-tests-catalog.js";

export const chemistryUpcomingTests = defineUpcomingTests("hoa-hoc", "Hóa học", [
  { id: "hoa-hoc-10-nguyen-tu", grade: 10, title: "Hóa học 10 · Cấu tạo nguyên tử", description: "Đề cương thành phần nguyên tử và cấu hình electron cơ bản.", examType: "topic-review", difficulty: "basic", durationMinutes: 30 },
  { id: "hoa-hoc-10-lien-ket", grade: 10, title: "Hóa học 10 · Liên kết hóa học", description: "Đề cương liên kết ion, liên kết cộng hóa trị và tính chất.", examType: "topic-review", difficulty: "medium", durationMinutes: 35 },
  { id: "hoa-hoc-11-can-bang", grade: 11, title: "Hóa học 11 · Cân bằng hóa học", description: "Đề cương phản ứng thuận nghịch và chuyển dịch cân bằng.", examType: "topic-review", difficulty: "medium", durationMinutes: 35 },
  { id: "hoa-hoc-11-nitrogen", grade: 11, title: "Hóa học 11 · Nitrogen và hợp chất", description: "Đề cương tính chất và ứng dụng của nitrogen, ammonia.", examType: "topic-review", difficulty: "upper", durationMinutes: 40 },
  { id: "hoa-hoc-12-ester", grade: 12, title: "Hóa học 12 · Ester và chất béo", description: "Đề cương cấu tạo, tính chất và phản ứng đặc trưng.", examType: "topic-review", difficulty: "medium", durationMinutes: 40 },
  { id: "hoa-hoc-12-tong-hop", grade: 12, title: "Hóa học 12 · Ôn tập tổng hợp", description: "Đề cương kết nối hóa hữu cơ và hóa vô cơ.", examType: "integrated-review", difficulty: "upper", durationMinutes: 50 },
  { id: "hoa-hoc-12-mo-phong-tot-nghiep-01", grade: 12, title: "Hóa học 12 · Định hướng tốt nghiệp mô phỏng số 01", description: "Đề cương tổng hợp theo định hướng hiện hành.", examType: "graduation-practice", difficulty: "upper", durationMinutes: 50 },
  { id: "hoa-hoc-12-mo-phong-tot-nghiep-02", grade: 12, title: "Hóa học 12 · Định hướng tốt nghiệp mô phỏng số 02", description: "Đề cương phân hóa, đang được biên soạn.", examType: "graduation-practice", difficulty: "advanced", durationMinutes: 50 },
]);