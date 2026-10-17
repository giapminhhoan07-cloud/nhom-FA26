# StudySphere

StudySphere là một ứng dụng web luyện thi trực tuyến giúp người dùng:
- làm bài trắc nghiệm theo từng đề
- lưu lịch sử làm bài
- xem lại bài làm sau khi nộp
- ôn tập các câu sai và câu chưa làm
- quản lý đề yêu thích

## Tính năng chính

- Bài kiểm tra theo môn và chủ đề
- Bài làm với thời gian đếm ngược
- Ôn theo phạm vi: lọc câu theo môn/lớp/chủ đề, chọn số lượng và rút ngẫu nhiên không trùng; tiến độ giữ nguyên khi tiếp tục bài
- Làm đề hoàn chỉnh giữ nguyên số lượng và thứ tự câu hỏi của đề
- Mỗi bài kiểm tra hiện có thêm 5 câu trả lời ngắn
- Đồng bộ lịch sử, tài khoản và kho đề qua JSON-server khi API hoạt động; giữ dữ liệu theo tài khoản trên thiết bị làm phương án dự phòng
- Xem lại bài làm chi tiết: đúng/sai/bỏ qua
- Gợi ý nội dung ôn theo môn, lớp và chủ đề dựa trên câu sai/bỏ trống trong lịch sử đã lưu; hiển thị lý do và chỉ liên kết tới câu hỏi hiện có trong kho
- Bảng xếp hạng XP theo 7 ngày gần nhất hoặc toàn thời gian để khuyến khích học đều
- Đánh dấu câu sai để ôn tập hiệu quả
- Giao diện thân thiện, dễ sử dụng trên máy tính và điện thoại
- Trung tâm hỗ trợ với FAQ tìm kiếm theo từ khóa và biểu mẫu liên hệ phía giao diện

## Dữ liệu đề thi và ôn tập theo phạm vi

Kho câu hỏi trực tuyến lấy từ `public/backup/tests/data/practice-tests.js` và các câu bổ sung trong `public/backup/tests/data/questionAdditions.js`; 8 bộ Ngữ văn mẫu nằm trong `public/backup/data/practice-tests-literature.js`, còn các bộ mẫu bù những tổ hợp môn/lớp còn thiếu nằm trong `public/backup/tests/data/scopedSampleTests.js`. Bộ lọc ôn tập chuẩn hóa dữ liệu và gắn các trường môn, lớp, chủ đề, đáp án, độ khó trong `public/backup/js/practiceScopes.js`. Khi thêm câu hỏi mới, có thể khai báo trực tiếp `topic` hoặc `topics`; nếu chưa khai báo, bộ chuẩn hóa dùng phân loại theo nội dung hiện có.

Trang lịch sử tổng hợp kết quả câu hỏi từ các lần làm đã lưu và đề xuất ôn tập theo quy tắc JavaScript trong `public/backup/js/studyRecommendations.js`. Hệ thống nêu số câu sai/bỏ trống, đề xuất luyện theo phạm vi có câu hỏi thật trong kho và liên kết tới đề sẵn có cùng môn/lớp/chủ đề (ưu tiên đề người học chưa làm). Cần tối thiểu 3 câu hỏi có kết quả trả lời đã lưu để phân tích; nếu chưa đủ dữ liệu, trang sẽ hướng dẫn học sinh làm thêm bài. Kết quả làm bài mới lưu môn, lớp và chủ đề để các lần phân tích sau chính xác hơn. Đây là gợi ý theo luật, không phải phân tích của mô hình AI.

Tại lần kiểm kê hiện tại, có 36 bộ luyện tập với 250 câu hỏi cho cả 10 môn và lớp 10–12. Trong đó, 24 bộ/120 câu là dữ liệu mẫu tự biên soạn, bổ sung các tổ hợp môn-lớp còn trống; mỗi bộ được đánh dấu `isSample` và câu hỏi có môn, lớp, chủ đề, độ khó, đáp án, giải thích. Các bộ Ngữ văn mẫu hiện hữu cũng được gắn nhãn mẫu. Dữ liệu lớp 12 trước đó được giữ lại. Đây là dữ liệu mẫu để người học thử luồng lọc/luyện tập, không phải bản chép của các đề thi chính thức. Thư viện đề THPT và danh sách đề cương là các danh mục riêng; bản PDF không đồng nghĩa với một bài thi trực tuyến đã có câu hỏi/đáp án. Hiện dữ liệu chưa có ngày cập nhật đáng tin cậy nên giao diện không gắn nhãn “mới nhất” cho đề.

## Study AI

Study AI hiển thị trên trang chủ và các trang dành cho người học; trong lúc làm bài, widget nhận ngữ cảnh câu hỏi hiện tại. Trình duyệt chỉ gọi same-origin `POST /api/study-ai`; backend gọi Gemini API bằng khóa được giữ trong môi trường server. Khóa không được gửi tới frontend. API giới hạn kích thước yêu cầu và tốc độ gửi, đồng thời giữ nguyên các biện pháp bảo vệ câu trả lời trong bài đánh giá có tính điểm.

Backend dùng SDK chính thức `@google/genai` và model alias hiện tại `gemini-flash-latest`, theo ví dụ Gemini API của Google. Model được cố định ở server để biến cấu hình cũ không làm endpoint gọi nhầm model đã ngừng hỗ trợ. Package `@google/genai` được cài trong dependencies. Chỉ cần thêm khóa Gemini vào `.env.local` ở thư mục gốc (không ghi đè các biến hiện có):

```dotenv
GEMINI_API_KEY=your_gemini_api_key
```

Không khai báo `GEMINI_MODEL`; backend chủ động dùng model alias hiện hành.

`.env.local` đã được Git ignore. Không đặt khóa trong mã frontend hoặc chia sẻ khóa công khai. Sau khi lưu khóa, khởi động lại Vite:

```powershell
npm run dev
```

Mở `http://localhost:5173/`, chọn **✨ Study AI** và thử hỏi “Giải thích cho mình 2 + 2 bằng cách dễ hiểu.” Các câu trả lời có ngữ cảnh từ bài quiz/result vẫn dùng chung endpoint. Nếu chưa khai báo khóa hoặc Gemini từ chối yêu cầu, chat hiển thị lỗi dễ hiểu và backend chỉ ghi mã trạng thái để chẩn đoán, không trả khóa ra trình duyệt.

## Công nghệ sử dụng

- HTML
- CSS
- JavaScript
- JSON-server làm Fake API tại `http://localhost:3000`
- LocalStorage theo tài khoản để dự phòng khi API ngoại tuyến

--------------------------------------------------------------------------------------------

## Cài đặt và chạy

Chạy hai dịch vụ trong hai terminal riêng:

```bash
npm install
npm run api
```

Terminal thứ hai chạy website:

```bash
npm run dev
```

JSON-server giữ cổng `3000`; Vite chạy website ở `5173` và tự chọn cổng khác nếu cổng đó đang bận. Nếu JSON-server đã chạy ở cổng 3000, không khởi động thêm một tiến trình API khác. Các endpoint hiện dùng gồm `/users`, `/exams`, `/attempts`, `/userAchievements` và `/feedback`; dữ liệu gốc nằm trong `db.json` và không bị reset khi chạy lệnh.

Bảng xếp hạng tại `public/backup/pages/leaderboard.html` cần JSON-server dùng chung để tải học sinh và kết quả làm bài. Mỗi lần hoàn thành bài luyện tập tính 50 XP trong mục 7 ngày; mục toàn thời gian dùng XP đã lưu trên tài khoản. Tài khoản quản trị và tài khoản bị khóa không xuất hiện.

Kiểm tra dự án bằng `npm test` và `npm run build`.

JSON-server chỉ là Fake API dành cho demo local, không có xác thực/phân quyền an toàn và không nên mở công khai trên mạng. Mật khẩu lưu trong JSON-server là dữ liệu thử nghiệm. Website Vercel không thể truy cập API `localhost` trên máy của bạn; muốn đồng bộ trên môi trường deploy cần một API được host riêng và cấu hình `window.STUDYSPHERE_API_URL`. Khi API không khả dụng, ứng dụng giữ fallback trên trình duyệt hiện tại, không đồng bộ giữa các thiết bị.

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
