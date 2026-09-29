import { defineUpcomingTests } from "./practice-tests-catalog.js";

export const economicsLawUpcomingTests = defineUpcomingTests("gdkp", "Giáo dục kinh tế và pháp luật", [
  { id: "gdkp-10-thi-truong", grade: 10, title: "GDKT&PL 10 · Thị trường và cơ chế thị trường", description: "Đề cương cung cầu, giá cả và các chủ thể kinh tế.", examType: "topic-review", difficulty: "basic", durationMinutes: 30 },
  { id: "gdkp-10-phap-luat-doi-song", grade: 10, title: "GDKT&PL 10 · Pháp luật trong đời sống", description: "Đề cương vai trò, đặc trưng và thực hiện pháp luật.", examType: "topic-review", difficulty: "medium", durationMinutes: 30 },
  { id: "gdkp-11-canh-tranh", grade: 11, title: "GDKT&PL 11 · Cạnh tranh và cung cầu", description: "Đề cương vận dụng quy luật thị trường trong tình huống.", examType: "topic-review", difficulty: "medium", durationMinutes: 35 },
  { id: "gdkp-11-quyen-nghia-vu-cong-dan", grade: 11, title: "GDKT&PL 11 · Quyền và nghĩa vụ công dân", description: "Đề cương quyền bình đẳng và trách nhiệm công dân.", examType: "topic-review", difficulty: "upper", durationMinutes: 40 },
  { id: "gdkp-12-tang-truong-phat-trien", grade: 12, title: "GDKT&PL 12 · Tăng trưởng và phát triển kinh tế", description: "Đề cương chỉ tiêu, chính sách và phát triển bền vững.", examType: "topic-review", difficulty: "medium", durationMinutes: 40 },
  { id: "gdkp-12-tong-hop", grade: 12, title: "GDKT&PL 12 · Ôn tập tổng hợp", description: "Đề cương liên hệ kiến thức lớp 10, 11 và 12.", examType: "integrated-review", difficulty: "upper", durationMinutes: 50 },
  { id: "gdkp-12-mo-phong-tot-nghiep-01", grade: 12, title: "GDKT&PL 12 · Định hướng tốt nghiệp mô phỏng số 01", description: "Đề cương vận dụng tình huống theo định hướng chương trình.", examType: "graduation-practice", difficulty: "upper", durationMinutes: 50 },
  { id: "gdkp-12-mo-phong-tot-nghiep-02", grade: 12, title: "GDKT&PL 12 · Định hướng tốt nghiệp mô phỏng số 02", description: "Đề cương phân tích tình huống, đang được biên soạn.", examType: "graduation-practice", difficulty: "advanced", durationMinutes: 50 },
]);