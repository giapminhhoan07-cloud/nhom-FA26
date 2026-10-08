# StudySphere

StudySphere là một ứng dụng web luyện thi trực tuyến giúp người dùng:
- làm bài trắc nghiệm theo từng đề
- lưu lịch sử làm bài
- xem lại bài làm sau khi nộp
- ôn tập các câu sai và câu chưa làm
- quản lý đề yêu thích

## Tính năng chính

- Kho đề thi theo từng môn/đề
- Bài làm với thời gian đếm ngược
- Ôn theo phạm vi: lọc câu theo môn/lớp/chủ đề, chọn số lượng và rút ngẫu nhiên không trùng; tiến độ giữ nguyên khi tiếp tục bài
- Làm đề hoàn chỉnh giữ nguyên số lượng và thứ tự câu hỏi của đề
- Mỗi bài kiểm tra hiện có thêm 5 câu trả lời ngắn
- Tự động lưu lịch sử làm bài vào localStorage
- Xem lại bài làm chi tiết: đúng/sai/bỏ qua
- Đánh dấu câu sai để ôn tập hiệu quả
- Giao diện thân thiện, dễ sử dụng trên máy tính và điện thoại
- Trung tâm hỗ trợ với FAQ tìm kiếm theo từ khóa và biểu mẫu liên hệ phía giao diện

## Dữ liệu đề thi và ôn tập theo phạm vi

Kho câu hỏi trực tuyến lấy từ `public/backup/tests/data/practice-tests.js` và các câu bổ sung trong `public/backup/tests/data/questionAdditions.js`; 8 bộ Ngữ văn mẫu nằm trong `public/backup/data/practice-tests-literature.js`, còn các bộ mẫu bù những tổ hợp môn/lớp còn thiếu nằm trong `public/backup/tests/data/scopedSampleTests.js`. Bộ lọc ôn tập chuẩn hóa dữ liệu và gắn các trường môn, lớp, chủ đề, đáp án, độ khó trong `public/backup/js/practiceScopes.js`. Khi thêm câu hỏi mới, có thể khai báo trực tiếp `topic` hoặc `topics`; nếu chưa khai báo, bộ chuẩn hóa dùng phân loại theo nội dung hiện có.

Tại lần kiểm kê hiện tại, có 36 bộ luyện tập với 250 câu hỏi cho cả 10 môn và lớp 10–12. Trong đó, 24 bộ/120 câu là dữ liệu mẫu tự biên soạn, bổ sung các tổ hợp môn-lớp còn trống; mỗi bộ được đánh dấu `isSample` và câu hỏi có môn, lớp, chủ đề, độ khó, đáp án, giải thích. Các bộ Ngữ văn mẫu hiện hữu cũng được gắn nhãn mẫu. Dữ liệu lớp 12 trước đó được giữ lại. Đây là dữ liệu mẫu để người học thử luồng lọc/luyện tập, không phải bản chép của các đề thi chính thức. Thư viện đề THPT và danh sách đề cương là các danh mục riêng; bản PDF không đồng nghĩa với một bài thi trực tuyến đã có câu hỏi/đáp án. Hiện dữ liệu chưa có ngày cập nhật đáng tin cậy nên giao diện không gắn nhãn “mới nhất” cho đề.

## Study AI

Study AI hiển thị trên các trang dành cho người học và nhận ngữ cảnh câu hỏi hiện tại trong lúc làm bài. Endpoint backend là `POST /api/study-ai`; endpoint chỉ chấp nhận same-origin, giới hạn đầu vào và tốc độ gửi, gọi dịch vụ tương thích OpenAI Chat Completions ở phía server. Khóa API không được đưa vào JavaScript hoặc HTML frontend.

Biến môi trường:

- `STUDY_AI_API_KEY` — bắt buộc; API key do nhà cung cấp AI cấp.
- `STUDY_AI_API_URL` — tùy chọn; mặc định `https://api.openai.com/v1/chat/completions`.
- `STUDY_AI_MODEL` — tùy chọn; mặc định `gpt-4o-mini`.

Chạy local: lưu các biến cần thiết trong `.env.local` ở thư mục gốc (file này đã được Git ignore), rồi chạy `npm run dev`. Vite chuyển tiếp `POST /api/study-ai` đến cùng handler dùng trên Vercel. Không commit `.env.local` và không đặt API key với tiền tố `VITE_`.

Trên Vercel, mở **Project → Settings → Environment Variables**, thêm `STUDY_AI_API_KEY` (và tùy chọn `STUDY_AI_API_URL`, `STUDY_AI_MODEL`) cho các môi trường cần dùng rồi deploy lại. Vercel tự triển khai `api/study-ai.js` thành serverless function. Nếu chưa cấu hình key, widget vẫn mở được nhưng API trả thông báo cấu hình còn thiếu.

## Công nghệ sử dụng

- HTML
- CSS
- JavaScript
- LocalStorage để lưu dữ liệu người dùng

--------------------------------------------------------------------------------------------

## Cài đặt và chạy

1. Clone repository:

```bash
git clone https://github.com/giapminhhoan07-cloud/nhom-FA26.git
```

2. Chạy trên máy local bằng XAMPP, Laragon hoặc trình duyệt trực tiếp.

3. Nếu cần chạy PHP local backend, khởi động Apache/PHP trong môi trường của bạn.

## Lưu ý

Dự án này đang sử dụng localStorage để lưu trạng thái người dùng, lịch sử làm bài và kết quả bài làm. Vì vậy dữ liệu sẽ được lưu trong trình duyệt của người dùng.

## Trung tâm hỗ trợ

- Trang hỗ trợ: `public/backup/pages/contact.html`
- FAQ và thông tin email/giờ hỗ trợ: `public/backup/data/supportFaq.js`
- Từ đồng nghĩa dùng trong tìm kiếm: `public/backup/js/supportSearch.js`

Để thêm câu hỏi, thêm một phần tử `{ question, answer, keywords }` vào `questions` của chủ đề phù hợp trong `supportFaq.js`. `keywords` là các từ/cụm từ người dùng có thể nhập để tìm câu hỏi. Có thể thêm chủ đề bằng cách thêm một mục `{ id, category, questions }` vào `faqData`. Nếu muốn tìm các cách diễn đạt tương đương ở nhiều câu hỏi, cập nhật nhóm từ khóa trong `supportSearch.js`.

Email và thời gian hỗ trợ được cấu hình trong `supportContact` ở `supportFaq.js`. Yêu cầu từ biểu mẫu được lưu trong `localStorage` với các phản hồi khác và hiển thị tại trang quản trị `admin-feedback.html`. Dữ liệu chỉ có trên trình duyệt/thiết bị đã gửi; hiện chưa có máy chủ nên không được đồng bộ cho quản trị viên ở thiết bị khác. Để gửi yêu cầu thực tế qua thiết bị, hãy liên hệ email hỗ trợ.

Chạy giao diện bằng `npm run dev`; kiểm tra bằng `npm test` và `npm run build`.

## Đặt lại mật khẩu (bản demo)

Trang đăng nhập có luồng `Quên mật khẩu?` dành riêng cho tài khoản demo lưu trong `localStorage` của trình duyệt hiện tại. Người dùng nhập email tài khoản và mật khẩu mới để cập nhật dữ liệu local; phiên đăng nhập hiện tại của tài khoản đó sẽ bị xóa.

Luồng này không gửi email, không xác minh danh tính và không thể đổi mật khẩu tài khoản lưu ở backend hoặc trên thiết bị khác. Không dùng làm cơ chế khôi phục tài khoản thật; để triển khai an toàn cần backend, token dùng một lần có hạn sử dụng và dịch vụ email.

## Tác giả

Dự án StudySphere được phát triển trong nhóm FA26.
