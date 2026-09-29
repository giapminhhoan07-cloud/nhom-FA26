import { defineUpcomingTests } from "./practice-tests-catalog.js";

export const biologyUpcomingTests = defineUpcomingTests("sinh-hoc", "Sinh học", [
  { id: "sinh-hoc-10-te-bao", grade: 10, title: "Sinh học 10 · Tế bào", description: "Đề cương cấu trúc tế bào và vai trò các bào quan.", examType: "topic-review", difficulty: "basic", durationMinutes: 30 },
  { id: "sinh-hoc-10-chuyen-hoa", grade: 10, title: "Sinh học 10 · Chuyển hóa vật chất và năng lượng", description: "Đề cương enzyme, chuyển hóa và năng lượng tế bào.", examType: "topic-review", difficulty: "medium", durationMinutes: 35 },
  { id: "sinh-hoc-11-trao-doi-chat", grade: 11, title: "Sinh học 11 · Trao đổi chất ở thực vật", description: "Đề cương hấp thụ nước, khoáng và vận chuyển ở thực vật.", examType: "topic-review", difficulty: "medium", durationMinutes: 35 },
  { id: "sinh-hoc-11-dieu-hoa", grade: 11, title: "Sinh học 11 · Điều hòa và cân bằng nội môi", description: "Đề cương cơ chế điều hòa hoạt động sống.", examType: "topic-review", difficulty: "upper", durationMinutes: 40 },
  { id: "sinh-hoc-12-di-truyen", grade: 12, title: "Sinh học 12 · Di truyền phân tử", description: "Đề cương DNA, gene và cơ chế biểu hiện thông tin di truyền.", examType: "topic-review", difficulty: "medium", durationMinutes: 40 },
  { id: "sinh-hoc-12-tong-hop", grade: 12, title: "Sinh học 12 · Ôn tập tổng hợp", description: "Đề cương kết nối các cấp tổ chức sống và sinh thái.", examType: "integrated-review", difficulty: "upper", durationMinutes: 50 },
  { id: "sinh-hoc-12-mo-phong-tot-nghiep-01", grade: 12, title: "Sinh học 12 · Định hướng tốt nghiệp mô phỏng số 01", description: "Đề cương tổng hợp theo định hướng hiện hành.", examType: "graduation-practice", difficulty: "upper", durationMinutes: 50 },
  { id: "sinh-hoc-12-mo-phong-tot-nghiep-02", grade: 12, title: "Sinh học 12 · Định hướng tốt nghiệp mô phỏng số 02", description: "Đề cương phân hóa, đang được biên soạn.", examType: "graduation-practice", difficulty: "advanced", durationMinutes: 50 },
]);