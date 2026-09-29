import { defineUpcomingTests } from "./practice-tests-catalog.js";

export const englishUpcomingTests = defineUpcomingTests("tieng-anh", "Tiếng Anh", [
  { id: "tieng-anh-10-tu-vung-chu-de", grade: 10, title: "Tiếng Anh 10 · Từ vựng theo chủ đề", description: "Đề cương từ vựng và ngữ cảnh giao tiếp quen thuộc.", examType: "topic-review", difficulty: "basic", durationMinutes: 30 },
  { id: "tieng-anh-10-ngu-phap-nen-tang", grade: 10, title: "Tiếng Anh 10 · Ngữ pháp nền tảng", description: "Đề cương cấu trúc câu và các thì cơ bản.", examType: "topic-review", difficulty: "medium", durationMinutes: 30 },
  { id: "tieng-anh-11-doc-hieu", grade: 11, title: "Tiếng Anh 11 · Đọc hiểu", description: "Đề cương đọc lấy ý chính và thông tin chi tiết.", examType: "topic-review", difficulty: "medium", durationMinutes: 35 },
  { id: "tieng-anh-11-cau-dieu-kien", grade: 11, title: "Tiếng Anh 11 · Câu điều kiện và mệnh đề", description: "Đề cương cấu trúc câu và vận dụng ngữ pháp.", examType: "topic-review", difficulty: "upper", durationMinutes: 35 },
  { id: "tieng-anh-12-doc-hieu", grade: 12, title: "Tiếng Anh 12 · Đọc hiểu tổng hợp", description: "Đề cương đọc hiểu theo chủ đề học thuật phổ thông.", examType: "topic-review", difficulty: "upper", durationMinutes: 40 },
  { id: "tieng-anh-12-ngu-phap-tu-vung", grade: 12, title: "Tiếng Anh 12 · Ngữ pháp và từ vựng", description: "Đề cương vận dụng ngữ pháp và kết hợp từ.", examType: "integrated-review", difficulty: "medium", durationMinutes: 40 },
  { id: "tieng-anh-12-mo-phong-tot-nghiep-01", grade: 12, title: "Tiếng Anh 12 · Định hướng tốt nghiệp mô phỏng số 01", description: "Đề cương trắc nghiệm nhiều lựa chọn theo định hướng hiện hành.", examType: "graduation-practice", difficulty: "upper", durationMinutes: 50 },
  { id: "tieng-anh-12-mo-phong-tot-nghiep-02", grade: 12, title: "Tiếng Anh 12 · Định hướng tốt nghiệp mô phỏng số 02", description: "Đề cương phân hóa kỹ năng, đang được biên soạn.", examType: "graduation-practice", difficulty: "advanced", durationMinutes: 50 },
]);