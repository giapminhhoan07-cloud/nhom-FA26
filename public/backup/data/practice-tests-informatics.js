import { defineUpcomingTests } from "./practice-tests-catalog.js";

export const informaticsUpcomingTests = defineUpcomingTests("tin-hoc", "Tin học", [
  { id: "tin-hoc-10-du-lieu-thong-tin", grade: 10, title: "Tin học 10 · Thông tin và dữ liệu", description: "Đề cương biểu diễn, lưu trữ và xử lý thông tin số.", examType: "topic-review", difficulty: "basic", durationMinutes: 30 },
  { id: "tin-hoc-10-an-toan-so", grade: 10, title: "Tin học 10 · An toàn trong môi trường số", description: "Đề cương quyền riêng tư, bảo mật tài khoản và ứng xử số.", examType: "topic-review", difficulty: "medium", durationMinutes: 30 },
  { id: "tin-hoc-11-thuat-toan", grade: 11, title: "Tin học 11 · Thuật toán và cấu trúc điều khiển", description: "Đề cương mô tả thuật toán, rẽ nhánh và lặp.", examType: "topic-review", difficulty: "medium", durationMinutes: 35 },
  { id: "tin-hoc-11-lap-trinh-co-ban", grade: 11, title: "Tin học 11 · Kiểu dữ liệu và lập trình", description: "Đề cương biến, biểu thức, hàm và kiểm thử chương trình.", examType: "topic-review", difficulty: "upper", durationMinutes: 40 },
  { id: "tin-hoc-12-cau-truc-du-lieu", grade: 12, title: "Tin học 12 · Dữ liệu và cấu trúc dữ liệu", description: "Đề cương tổ chức dữ liệu và lựa chọn cấu trúc phù hợp.", examType: "topic-review", difficulty: "medium", durationMinutes: 40 },
  { id: "tin-hoc-12-tong-hop", grade: 12, title: "Tin học 12 · Ôn tập tổng hợp", description: "Đề cương kết nối thuật toán, dữ liệu và an toàn số.", examType: "integrated-review", difficulty: "upper", durationMinutes: 50 },
  { id: "tin-hoc-12-mo-phong-tot-nghiep-01", grade: 12, title: "Tin học 12 · Định hướng tốt nghiệp mô phỏng số 01", description: "Đề cương năng lực số theo chương trình phổ thông.", examType: "graduation-practice", difficulty: "upper", durationMinutes: 50 },
  { id: "tin-hoc-12-mo-phong-tot-nghiep-02", grade: 12, title: "Tin học 12 · Định hướng tốt nghiệp mô phỏng số 02", description: "Đề cương thuật toán và phân tích dữ liệu, đang biên soạn.", examType: "graduation-practice", difficulty: "advanced", durationMinutes: 50 },
]);