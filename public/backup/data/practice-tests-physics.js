import { defineUpcomingTests } from "./practice-tests-catalog.js";

export const physicsUpcomingTests = defineUpcomingTests("vat-ly", "Vật lý", [
  { id: "vat-ly-10-chuyen-dong", grade: 10, title: "Vật lý 10 · Mô tả chuyển động", description: "Đề cương đồ thị, tốc độ và chuyển động thẳng.", examType: "topic-review", difficulty: "basic", durationMinutes: 30 },
  { id: "vat-ly-10-luc-va-dinh-luat-newton", grade: 10, title: "Vật lý 10 · Lực và định luật Newton", description: "Đề cương phân tích lực và chuyển động của vật.", examType: "topic-review", difficulty: "medium", durationMinutes: 35 },
  { id: "vat-ly-11-dien-truong", grade: 11, title: "Vật lý 11 · Điện trường", description: "Đề cương điện tích, cường độ điện trường và điện thế.", examType: "topic-review", difficulty: "medium", durationMinutes: 35 },
  { id: "vat-ly-11-mach-dien", grade: 11, title: "Vật lý 11 · Dòng điện và mạch điện", description: "Đề cương nguồn điện, định luật Ohm và công suất.", examType: "topic-review", difficulty: "upper", durationMinutes: 40 },
  { id: "vat-ly-12-dao-dong", grade: 12, title: "Vật lý 12 · Dao động cơ", description: "Đề cương đại lượng đặc trưng và năng lượng dao động.", examType: "topic-review", difficulty: "medium", durationMinutes: 40 },
  { id: "vat-ly-12-tong-hop", grade: 12, title: "Vật lý 12 · Ôn tập tổng hợp", description: "Đề cương kết nối các chủ đề vật lý lớp 12.", examType: "integrated-review", difficulty: "upper", durationMinutes: 50 },
  { id: "vat-ly-12-mo-phong-tot-nghiep-01", grade: 12, title: "Vật lý 12 · Định hướng tốt nghiệp mô phỏng số 01", description: "Đề cương nhiều lựa chọn và vận dụng theo định hướng hiện hành.", examType: "graduation-practice", difficulty: "upper", durationMinutes: 50 },
  { id: "vat-ly-12-mo-phong-tot-nghiep-02", grade: 12, title: "Vật lý 12 · Định hướng tốt nghiệp mô phỏng số 02", description: "Đề cương phân hóa, đang được biên soạn.", examType: "graduation-practice", difficulty: "advanced", durationMinutes: 50 },
]);