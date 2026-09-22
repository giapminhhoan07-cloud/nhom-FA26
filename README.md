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

## Công nghệ sử dụng

- HTML
- CSS
- JavaScript
- LocalStorage để lưu dữ liệu người dùng

## Cấu trúc thư mục

```bash
nhom-FA26/
├── api/
│   ├── auth.php
│   └── database.php
├── css/
├── data/
├── database/
├── js/
├── pages/
├── index.html
├── README.md
└── ...

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

## Tác giả

Dự án StudySphere được phát triển trong nhóm FA26.

## Update code

git add .
git commit -m "Update ..." (update thêm phần nào thì ghi tên vào dấu ... cho dễ quản lý)
git push origin main

VD: git add .
git commit -m "Update README.md"
git push origin main

## Tránh xung đột code

Mỗi lần vào code thì ấn :
git push origin main
để up lại code trên github, tránh trường hợp code bị mất do xung đột với các thành viên khác.

## Đồng bộ code trên Github
Mỗi lần vào code thì ấn :
git pull origin main --rebase

