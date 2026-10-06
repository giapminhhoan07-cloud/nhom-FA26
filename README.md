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
- Tự động lưu lịch sử làm bài vào localStorage
- Xem lại bài làm chi tiết: đúng/sai/bỏ qua
- Đánh dấu câu sai để ôn tập hiệu quả
- Giao diện thân thiện, dễ sử dụng trên máy tính và điện thoại
- Trung tâm hỗ trợ với FAQ tìm kiếm theo từ khóa và biểu mẫu liên hệ phía giao diện

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
