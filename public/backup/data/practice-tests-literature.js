import { defineUpcomingTests } from "./practice-tests-catalog.js";

export const literatureUpcomingTests = defineUpcomingTests("ngu-van", "Ngữ văn", [
  { id: "ngu-van-10-doc-hieu-tho", grade: 10, title: "Ngữ văn 10 · Đọc hiểu thơ", description: "Đề cương đọc hiểu hình ảnh, ngôn ngữ và mạch cảm xúc.", examType: "topic-review", difficulty: "basic", durationMinutes: 45 },
  { id: "ngu-van-10-nghi-luan-xa-hoi", grade: 10, title: "Ngữ văn 10 · Nghị luận về vấn đề xã hội", description: "Đề cương xác định luận điểm và xây dựng dẫn chứng.", examType: "topic-review", difficulty: "medium", durationMinutes: 45 },
  { id: "ngu-van-11-doc-hieu-truyen", grade: 11, title: "Ngữ văn 11 · Đọc hiểu truyện", description: "Đề cương phân tích điểm nhìn, nhân vật và chi tiết nghệ thuật.", examType: "topic-review", difficulty: "medium", durationMinutes: 45 },
  { id: "ngu-van-11-nghi-luan-van-hoc", grade: 11, title: "Ngữ văn 11 · Nghị luận văn học", description: "Đề cương lập luận và phân tích tác phẩm theo yêu cầu.", examType: "topic-review", difficulty: "upper", durationMinutes: 60 },
  { id: "ngu-van-12-doc-hieu-van-ban", grade: 12, title: "Ngữ văn 12 · Đọc hiểu văn bản", description: "Đề cương đọc hiểu văn bản văn học và văn bản thông tin.", examType: "topic-review", difficulty: "medium", durationMinutes: 60 },
  { id: "ngu-van-12-tong-hop", grade: 12, title: "Ngữ văn 12 · Ôn tập tổng hợp", description: "Đề cương đọc hiểu và viết, đang chờ hỗ trợ tự luận.", examType: "integrated-review", difficulty: "upper", durationMinutes: 120 },
  { id: "ngu-van-12-mo-phong-tot-nghiep-01", grade: 12, title: "Ngữ văn 12 · Định hướng tốt nghiệp mô phỏng số 01", description: "Đề cương tự luận theo định hướng hiện hành; chưa có quiz tự luận.", examType: "graduation-practice", difficulty: "upper", durationMinutes: 120 },
  { id: "ngu-van-12-mo-phong-tot-nghiep-02", grade: 12, title: "Ngữ văn 12 · Định hướng tốt nghiệp mô phỏng số 02", description: "Đề cương tự luận đang được biên soạn.", examType: "graduation-practice", difficulty: "advanced", durationMinutes: 120 },
]);