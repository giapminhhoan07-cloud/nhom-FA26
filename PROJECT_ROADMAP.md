# StudySphere - Project Roadmap

> **Tên đề tài:** Website tổng hợp đề thi THPT - StudySphere  
> **Thời lượng:** 4 tuần  
> **Nhân sự:** 4 thành viên  
> **Công nghệ bắt buộc:** HTML5, CSS3, JavaScript thuần, JSON/LocalStorage  
> **Không sử dụng:** PHP, MySQL, Node.js, React, Vue, Angular hoặc backend

## 1. Tổng quan và phạm vi

### 1.1 Mục tiêu

StudySphere là website tĩnh có tính tương tác, giúp học sinh THPT:

- Tìm kiếm và lọc đề thi theo môn, năm, loại đề và mức độ.
- Xem thông tin chi tiết của đề.
- Làm bài trắc nghiệm trực tiếp trên trình duyệt.
- Nhận điểm tự động, xem đáp án và giải thích.
- Lưu lịch sử, điểm số và đề yêu thích bằng LocalStorage.
- Sử dụng tốt trên máy tính, máy tính bảng và điện thoại.

### 1.2 Người dùng mục tiêu

| Nhóm | Nhu cầu chính |
|---|---|
| Học sinh THPT | Luyện đề nhanh, biết điểm ngay, theo dõi tiến bộ |
| Học sinh lớp 12 | Ôn thi tốt nghiệp THPT theo môn và năm |
| Người tự học/ôn thi | Tìm nguồn đề được phân loại rõ ràng |
| Giáo viên/người biên soạn | Có thể dùng kho đề mẫu để tham khảo trong bản demo |

### 1.3 Vấn đề cần giải quyết

- Đề thi nằm rải rác, khó tìm theo tiêu chí cụ thể.
- Người học thiếu công cụ luyện tập và chấm điểm ngay.
- Khó theo dõi các lần làm bài nếu không có tài khoản.
- Tài liệu trên màn hình nhỏ thường khó sử dụng.

### 1.4 Điểm nổi bật

- Kho đề có bộ lọc rõ ràng và tìm kiếm tức thời.
- Quy trình từ chọn đề đến xem kết quả nằm trong một luồng thống nhất.
- Không cần đăng nhập hoặc máy chủ: dữ liệu mẫu chạy hoàn toàn trên trình duyệt.
- Dashboard nhỏ về điểm trung bình, số lần làm và đề đã lưu.
- Giao diện học tập hiện đại, tập trung vào khả năng đọc và thao tác.

### 1.5 Phạm vi phù hợp trong 1 tháng

- Dùng dữ liệu mẫu khoảng 20-30 đề, 5-10 đề có thể làm trực tiếp.
- Ưu tiên câu hỏi trắc nghiệm một đáp án.
- Không làm tài khoản thật, đồng bộ nhiều thiết bị hoặc quản trị nội dung.
- Có thể mở rộng dữ liệu bằng cách thêm object JSON, không đổi logic chính.

## 2. Hệ thống chức năng

### 2.1 Phân loại chức năng

| Mức | Chức năng | Ghi chú triển khai |
|---|---|---|
| **MVP bắt buộc** | Trang chủ | Điều hướng, thống kê nhanh, đề nổi bật |
| **MVP bắt buộc** | Kho đề thi | Render card từ dữ liệu JavaScript/JSON |
| **MVP bắt buộc** | Tìm kiếm | Lọc theo tên đề, môn, từ khóa |
| **MVP bắt buộc** | Bộ lọc | Môn, năm, loại đề, mức độ |
| **MVP bắt buộc** | Chi tiết đề | Mô tả, thời gian, số câu, mức độ, nút bắt đầu |
| **MVP bắt buộc** | Làm trắc nghiệm | Chọn đáp án, chuyển câu, đánh dấu câu |
| **MVP bắt buộc** | Đồng hồ đếm ngược | Tự nộp khi hết giờ |
| **MVP bắt buộc** | Tự động chấm điểm | So sánh đáp án người dùng với đáp án chuẩn |
| **MVP bắt buộc** | Kết quả và đáp án | Điểm, đúng/sai, đáp án đúng, giải thích |
| **MVP bắt buộc** | Lưu LocalStorage | Lịch sử làm bài, đề yêu thích, thiết lập cơ bản |
| **MVP bắt buộc** | Responsive | Mobile-first, không vỡ layout |
| **Nên có** | Trang lịch sử | Lọc/xem lại các lần làm bài |
| **Nên có** | Theo dõi điểm số | Điểm trung bình, cao nhất, số câu đúng |
| **Nên có** | Đề yêu thích | Lưu/bỏ lưu bằng biểu tượng trái tim |
| **Nên có** | Tiếp tục bài đang làm | Lưu tạm trạng thái trong cùng trình duyệt |
| **Nên có** | Phân trang hoặc tải thêm | Hữu ích khi dữ liệu tăng |
| **Nên có** | Chế độ xem đáp án | Xem toàn bộ câu sau khi nộp |
| **Nâng cao** | Biểu đồ tiến bộ | CSS/Canvas hoặc thư viện không cần thiết; chỉ làm nếu còn thời gian |
| **Nâng cao** | Chế độ ngẫu nhiên câu hỏi | Shuffle có seed hoặc lưu trạng thái |
| **Nâng cao** | PWA/offline | Service Worker, chỉ triển khai sau khi MVP ổn định |
| **Nâng cao** | Xuất kết quả | In kết quả bằng `window.print()` |
| **Nâng cao** | Dark mode | Lưu lựa chọn bằng LocalStorage |

### 2.2 Quy tắc nghiệp vụ chính

- Chỉ cho nộp bài khi đề đã tải thành công.
- Câu chưa trả lời được tính là sai nhưng phải được thống kê riêng.
- Điểm mẫu: `số câu đúng / tổng số câu * 10`, làm tròn 2 chữ số.
- Hết giờ thì tự động nộp và hiển thị thông báo.
- Mỗi lịch sử có `attemptId`, không ghi đè các lần làm trước.
- LocalStorage phải có giá trị mặc định nếu dữ liệu chưa tồn tại hoặc bị lỗi.

## 3. Sitemap

| Trang | Đường dẫn dự kiến | Mục đích |
|---|---|---|
| Trang chủ | `index.html` | Giới thiệu ngắn, tìm nhanh, môn học, đề nổi bật, thống kê |
| Kho đề thi | `pages/exams.html` | Hiển thị toàn bộ đề, tìm kiếm và lọc |
| Chi tiết đề | `pages/exam-detail.html?id=...` | Xem metadata, mô tả, hướng dẫn và bắt đầu |
| Làm bài | `pages/quiz.html?id=...` | Trả lời câu hỏi, đồng hồ, tiến độ, nộp bài |
| Kết quả | `pages/result.html?attempt=...` | Điểm, thống kê, đáp án, giải thích, làm lại |
| Lịch sử | `pages/history.html` | Các lần làm bài, điểm, thời gian, xem kết quả |
| Đề đã lưu | `pages/favorites.html` | Danh sách đề yêu thích |
| Giới thiệu | `pages/about.html` | Mục tiêu, nhóm thực hiện, phạm vi đồ án |
| Liên hệ | `pages/contact.html` | Thông tin nhóm và form liên hệ giả lập; không gửi server |
| 404 tùy chọn | `pages/404.html` | Xử lý liên kết không tồn tại |

## 4. UI/UX

### 4.1 Định hướng hình ảnh

- **Phong cách:** hiện đại, sáng, tối giản, thân thiện nhưng có tính học thuật.
- **Bố cục:** nền sáng, nhiều khoảng thở, card góc 10-12px, đường viền nhẹ.
- **Màu chủ đạo:** xanh navy `#173B57` cho tiêu đề và điều hướng; teal `#16A6A1` cho CTA; vàng `#F4B942` cho điểm nhấn; nền `#F6F8FB`; màu cảnh báo `#D95D5D`.
- **Font:** `Be Vietnam Pro` cho tiếng Việt; khai báo fallback sans-serif. Có thể dùng Google Fonts khi có Internet, đồng thời kiểm tra fallback offline.
- **Nguyên tắc:** tương phản tốt, trạng thái focus rõ, nút chạm tối thiểu khoảng 44px trên mobile.

### 4.2 Thành phần giao diện

| Thành phần | Đề xuất |
|---|---|
| Header | Logo StudySphere, link Kho đề, Lịch sử, Đã lưu, menu mobile |
| Navbar | Sticky trên desktop; hamburger trên mobile |
| Footer | Tóm tắt, liên kết trang, thông tin nhóm, năm thực hiện |
| Sidebar | Bộ lọc trên desktop; drawer hoặc vùng accordion trên mobile |
| Card đề | Môn, năm, loại đề, mức độ, số câu, thời gian, nút Xem đề, nút yêu thích |
| Bộ lọc | Select/chip cho môn, năm, loại, mức độ; nút Xóa lọc |
| CTA | `Bắt đầu làm bài`, `Xem kết quả`, `Làm lại`; màu teal, trạng thái hover/focus |
| Trang làm bài | Header đề + timer; thanh tiến độ; một câu/khối câu rõ ràng; bảng số câu |
| Trang kết quả | Điểm lớn vừa phải, ring/progress đơn giản bằng CSS, thống kê đúng/sai/bỏ qua |
| Mobile | Một cột, bộ lọc đóng mở, nút nộp dễ chạm, không yêu cầu hover |

### 4.3 UX quan trọng

- Khi không có kết quả lọc, hiển thị trạng thái rỗng kèm nút Xóa lọc.
- Trước khi rời trang làm bài, cảnh báo nếu có câu đã trả lời.
- Timer đổi màu khi còn dưới 5 phút và dưới 1 phút.
- Sau khi nộp, không cho sửa câu trả lời trong màn hình kết quả.
- Dùng `aria-label`, label thật cho form, trạng thái lỗi dễ hiểu.

## 5. Phân công 4 thành viên

| Thành viên | Chức năng/phạm vi | Trang phụ trách | File liên quan | Công việc cụ thể | Đầu ra |
|---|---|---|---|---|---|
| **TV1 - PM/UI** | Thiết kế hệ thống giao diện và khung chung | `index.html`, `about.html`, `contact.html` | `css/base.css`, `css/layout.css`, `js/ui.js` | Chốt sitemap, wireframe, màu/font, header/footer, responsive shell, quy ước Git/tên file | Design checklist, layout dùng chung, 3 trang giới thiệu |
| **TV2 - Kho đề** | Dữ liệu đề và tìm kiếm/lọc | `exams.html`, `exam-detail.html` | `data/exams.js`, `data/subjects.js`, `js/exams.js`, `js/filters.js` | Tạo data mẫu, render card, query string `id`, filter kết hợp, empty state, yêu thích | Kho đề chạy đầy đủ, chi tiết đề, bộ lọc |
| **TV3 - Quiz** | Luồng làm bài và chấm điểm | `quiz.html`, `result.html` | `js/quiz.js`, `js/timer.js`, `js/scoring.js`, `css/quiz.css` | Render câu hỏi, chọn đáp án, điều hướng, timer, tự nộp, tính điểm, đáp án/giải thích | Làm bài end-to-end, kết quả chính xác |
| **TV4 - Dữ liệu cá nhân/QA** | LocalStorage, lịch sử, kiểm thử tích hợp | `history.html`, `favorites.html` | `js/storage.js`, `js/history.js`, `js/favorites.js`, `css/components.css` | API lưu/đọc/xóa, thống kê điểm, lịch sử, yêu thích, test responsive/cross-browser, hỗ trợ báo cáo | Lịch sử và đề lưu ổn định, test report |

**Cách phối hợp:** TV1 cung cấp component và token CSS trước cuối tuần 1; TV2 và TV3 thống nhất schema dữ liệu trước khi code; TV4 kiểm thử từng tính năng ngay khi có bản chạy được. Mỗi thành viên review ít nhất một PR/file của thành viên khác.

## 6. Timeline 4 tuần

### Tuần 1 - Phân tích, thiết kế, dựng giao diện

| Ngày | Công việc | Phụ trách | Sản phẩm đầu ra | Ưu tiên |
|---|---|---|---|---|
| T2 | Chốt mục tiêu, user flow, MVP, tiêu chí hoàn thành | Cả nhóm, TV1 điều phối | Scope 1 trang, backlog | Cao |
| T3 | Sitemap, wireframe desktop/mobile, phân công file | TV1 + cả nhóm | Sitemap và wireframe | Cao |
| T4 | Chốt màu, font, token CSS, quy ước dữ liệu | TV1 + TV2/TV3 | `base.css`, schema nháp | Cao |
| T5 | Dựng header, footer, layout responsive | TV1 | Shell dùng chung | Cao |
| T6 | Tạo dữ liệu mẫu đề/câu hỏi và trang chủ tĩnh | TV2 + TV1 | `data/`, `index.html` | Cao |
| T7 | Tích hợp shell, review giao diện, kiểm tra mobile | Cả nhóm, TV4 test | Prototype tuần 1 | Cao |
| CN | Nghỉ hoặc bù lỗi, cập nhật tài liệu | Cả nhóm | Backlog tuần 2 rõ ràng | Thấp |

### Tuần 2 - Xây dựng kho đề và điều hướng

| Ngày | Công việc | Phụ trách | Sản phẩm đầu ra | Ưu tiên |
|---|---|---|---|---|
| T2 | Render danh sách đề từ data | TV2 | Kho đề có card | Cao |
| T3 | Tìm kiếm theo từ khóa và lọc môn/năm | TV2 | Filter cơ bản | Cao |
| T4 | Lọc loại đề/mức độ, reset, empty state | TV2 + TV4 | Filter hoàn chỉnh | Cao |
| T5 | Chi tiết đề và query `id` | TV2 | Trang chi tiết | Cao |
| T6 | Header/nav/mobile menu và liên kết toàn site | TV1 | Điều hướng ổn định | Cao |
| T7 | Tích hợp kho đề, test 10-15 case lọc | TV2 + TV4 | Bản kho đề tích hợp | Cao |
| CN | Sửa lỗi và cập nhật ảnh/wireframe báo cáo | TV1 + TV4 | UI polish | Trung bình |

### Tuần 3 - Làm bài, chấm điểm, lưu dữ liệu

| Ngày | Công việc | Phụ trách | Sản phẩm đầu ra | Ưu tiên |
|---|---|---|---|---|
| T2 | Render câu hỏi, đáp án, chuyển câu | TV3 | Quiz cơ bản | Cao |
| T3 | Thanh tiến độ, đánh dấu câu, trạng thái đã trả lời | TV3 | Điều hướng quiz | Cao |
| T4 | Timer, cảnh báo, tự nộp khi hết giờ | TV3 + TV4 | Timer tin cậy | Cao |
| T5 | Chấm điểm, thống kê, đáp án và giải thích | TV3 | Result hoàn chỉnh | Cao |
| T6 | API LocalStorage cho history/favorites | TV4 | `storage.js` | Cao |
| T7 | Tích hợp lịch sử, yêu thích, dashboard điểm | TV4 + TV3 | Luồng end-to-end | Cao |
| CN | Kiểm thử dữ liệu hỏng, refresh, nộp bài nhiều lần | Cả nhóm, TV4 điều phối | Danh sách lỗi tuần 3 | Cao |

### Tuần 4 - Kiểm thử, hoàn thiện, báo cáo, thuyết trình

| Ngày | Công việc | Phụ trách | Sản phẩm đầu ra | Ưu tiên |
|---|---|---|---|---|
| T2 | Test chức năng theo checklist, sửa lỗi blocker | TV4 + chủ file | Không còn lỗi blocker | Cao |
| T3 | Test responsive 360px/768px/1440px và trình duyệt | TV1 + TV4 | Test report | Cao |
| T4 | Accessibility, nội dung, empty/error state, hiệu năng cơ bản | TV1 + TV4 | Bản release candidate | Cao |
| T5 | Hoàn thiện dữ liệu demo, ảnh, README, hướng dẫn chạy | TV2 + TV1 | Bộ demo hoàn chỉnh | Cao |
| T6 | Viết báo cáo: phân tích, thiết kế, cài đặt, kiểm thử | Cả nhóm | Báo cáo gần hoàn chỉnh | Cao |
| T7 | Soạn slide, kịch bản demo, diễn tập, đóng gói | Cả nhóm, TV1 điều phối | Slide + demo script | Cao |
| CN | Chốt phiên bản, backup, tổng duyệt, phân vai bảo vệ | Cả nhóm | Bản nộp cuối | Cao |

## 7. Cấu trúc thư mục

```text
StudySphere/
├── index.html
├── README.md
├── PROJECT_ROADMAP.md
├── pages/
│   ├── exams.html
│   ├── exam-detail.html
│   ├── quiz.html
│   ├── result.html
│   ├── history.html
│   ├── favorites.html
│   ├── about.html
│   └── contact.html
├── css/
│   ├── base.css          # reset, variables, typography
│   ├── layout.css        # header, footer, grid, responsive
│   ├── components.css    # card, button, form, modal, states
│   ├── quiz.css          # quiz/timer/result
│   └── pages.css         # style riêng của trang
├── js/
│   ├── app.js            # khởi tạo chung
│   ├── ui.js             # header, menu, toast, helpers
│   ├── exams.js          # render kho đề/chi tiết
│   ├── filters.js        # tìm kiếm và bộ lọc
│   ├── quiz.js           # trạng thái bài làm
│   ├── timer.js          # countdown
│   ├── scoring.js        # chấm điểm
│   ├── storage.js        # wrapper LocalStorage
│   ├── history.js        # lịch sử/thống kê
│   └── favorites.js      # đề yêu thích
├── data/
│   ├── exams.js
│   ├── subjects.js
│   └── questions.js
├── assets/
│   ├── icons/
│   └── logos/
└── images/
```

Mở `index.html` trực tiếp trong trình duyệt là đủ cho MVP. Nếu trình duyệt chặn `fetch()` khi chạy file cục bộ, dùng Live Server của VS Code để phục vụ file tĩnh; đây không phải backend của dự án.

## 8. Thiết kế dữ liệu

Khuyến nghị dùng JavaScript module/array trong `data/` để chạy đơn giản; JSON thuần có thể dùng khi nhóm muốn tách dữ liệu khỏi logic. Không lưu đáp án đúng trong HTML hiển thị trước khi nộp.

### 8.1 Một đề thi

```js
{
  id: "toan-2025-minh-hoa",
  title: "Đề minh họa tốt nghiệp THPT môn Toán 2025",
  subjectId: "toan",
  subjectName: "Toán",
  year: 2025,
  type: "minh-hoa",
  typeName: "Đề minh họa",
  difficulty: "medium",
  difficultyName: "Trung bình",
  durationMinutes: 90,
  questionCount: 10,
  description: "Bộ câu hỏi mẫu dùng để luyện tập.",
  questionIds: ["t25-01", "t25-02"],
  tags: ["THPT", "luyện thi"],
  featured: true
}
```

### 8.2 Một câu hỏi

```js
{
  id: "t25-01",
  examId: "toan-2025-minh-hoa",
  order: 1,
  content: "Giá trị của biểu thức ... là",
  options: [
    { id: "A", text: "1" },
    { id: "B", text: "2" },
    { id: "C", text: "3" },
    { id: "D", text: "4" }
  ],
  correctAnswer: "B",
  explanation: "Áp dụng công thức ... ta có kết quả 2.",
  topic: "Hàm số"
}
```

### 8.3 Một kết quả làm bài

```js
{
  attemptId: "attempt-20250914-001",
  examId: "toan-2025-minh-hoa",
  examTitle: "Đề minh họa tốt nghiệp THPT môn Toán 2025",
  startedAt: "2026-09-14T08:00:00.000Z",
  submittedAt: "2026-09-14T08:42:10.000Z",
  score: 7.5,
  totalQuestions: 10,
  correctCount: 8,
  wrongCount: 1,
  unansweredCount: 1,
  answers: {
    "t25-01": "B",
    "t25-02": null
  },
  durationSeconds: 2530
}
```

### 8.4 Người dùng giả lập (tùy chọn)

```js
{
  id: "local-user",
  displayName: "Bạn học",
  favoriteExamIds: ["toan-2025-minh-hoa"],
  settings: { theme: "light" }
}
```

### 8.5 Khóa LocalStorage

| Key | Giá trị |
|---|---|
| `studysphere_history` | Mảng kết quả làm bài |
| `studysphere_favorites` | Mảng `examId` |
| `studysphere_draft_{examId}` | Bài đang làm, nếu triển khai |
| `studysphere_user` | Người dùng giả lập, nếu cần |

## 9. User Flow

```text
Trang chủ
  -> Chọn môn hoặc nhập từ khóa
  -> Kho đề thi
  -> Lọc theo môn/năm/loại/mức độ
  -> Chọn một đề
  -> Xem chi tiết đề
  -> Bắt đầu làm bài
  -> Trả lời/chuyển/đánh dấu câu
  -> Nộp bài hoặc hết giờ tự nộp
  -> Tự động chấm điểm
  -> Xem kết quả
  -> Xem đáp án và giải thích
  -> Lưu lịch sử vào LocalStorage
  -> Làm lại, quay về kho đề hoặc xem tiến bộ
```

## 10. Ước lượng độ khó

| Chức năng | Độ khó | Thời gian | Phụ trách | Cần JS |
|---|---|---:|---|---|
| Layout/header/footer | Dễ | 1.5 ngày | TV1 | Một ít |
| Trang chủ | Dễ | 1 ngày | TV1 | Có, render thống kê tùy chọn |
| Dữ liệu mẫu | Dễ | 1.5 ngày | TV2 | Không |
| Kho đề/card | Trung bình | 1.5 ngày | TV2 | Có |
| Tìm kiếm/lọc kết hợp | Trung bình | 1.5 ngày | TV2 | Có |
| Chi tiết đề | Dễ | 0.5 ngày | TV2 | Có |
| Responsive | Trung bình | 1.5 ngày | TV1 + TV4 | Không |
| Render quiz | Trung bình | 2 ngày | TV3 | Có |
| Timer/tự nộp | Trung bình | 1 ngày | TV3 | Có |
| Chấm điểm/giải thích | Trung bình | 1 ngày | TV3 | Có |
| LocalStorage wrapper | Trung bình | 1 ngày | TV4 | Có |
| Lịch sử/thống kê | Trung bình | 1.5 ngày | TV4 | Có |
| Yêu thích | Dễ | 0.5 ngày | TV4 | Có |
| Accessibility/error state | Trung bình | 1 ngày | TV1 + TV4 | Một ít |
| Dark mode/biểu đồ/PWA | Khó với thời gian còn lại | 1-3 ngày mỗi mục | TV4 nếu còn thời gian | Có |

## 11. MVP dùng để demo và bảo vệ

MVP phải có một luồng hoàn chỉnh, không chỉ các trang tĩnh:

1. Trang chủ responsive có điều hướng.
2. Kho đề render từ dữ liệu mẫu.
3. Tìm kiếm và lọc theo môn, năm, loại đề, mức độ.
4. Trang chi tiết đề.
5. Làm bài trắc nghiệm trực tiếp.
6. Đồng hồ đếm ngược và tự nộp.
7. Tự động chấm điểm.
8. Hiển thị đáp án, giải thích, đúng/sai/bỏ qua.
9. Lưu và xem lịch sử bằng LocalStorage.
10. Lưu đề yêu thích.
11. Chạy tốt ở mobile và desktop.

**Kịch bản demo đề xuất:** vào trang chủ -> chọn Toán -> lọc đề 2025 -> mở chi tiết -> yêu thích -> làm bài -> cố ý để một câu trống -> nộp -> xem điểm/giải thích -> mở Lịch sử và Đã lưu.

## 12. Những chức năng không nên làm

| Chức năng | Lý do loại khỏi phạm vi |
|---|---|
| Đăng ký/đăng nhập thật | Cần backend, bảo mật và cơ sở dữ liệu |
| Đồng bộ dữ liệu nhiều thiết bị | Không thể đảm bảo chỉ với LocalStorage |
| Admin CRUD đề thi | Cần API/database hoặc hệ thống file phức tạp |
| Chat realtime/diễn đàn | Cần server, tài khoản và kiểm duyệt |
| AI giải bài/chấm tự luận | Vượt phạm vi công nghệ và thời gian |
| Thanh toán/gói thành viên | Cần backend và tích hợp cổng thanh toán |
| Kho PDF lớn có bản quyền | Tăng rủi ro pháp lý, dung lượng và quản lý nội dung |
| Chấm bài tự luận/nhận diện ảnh | Không phù hợp JS thuần MVP |
| Hệ thống xếp hạng toàn trường | Cần dữ liệu tập trung và chống gian lận |
| Ứng dụng native iOS/Android | Không thuộc phạm vi website HTML/CSS/JS |

## 13. Công nghệ và nguyên tắc kỹ thuật

| Hạng mục | Lựa chọn |
|---|---|
| Markup | HTML5 semantic: `header`, `nav`, `main`, `section`, `footer` |
| Styling | CSS3, Flexbox, Grid, media queries, custom properties |
| Logic | Vanilla JavaScript ES6 modules, DOM API, URLSearchParams |
| Dữ liệu | JavaScript object/array hoặc JSON mẫu |
| Lưu trữ | LocalStorage, không database |
| Kiểm thử | DevTools, kiểm tra thủ công theo checklist, nhiều kích thước màn hình |
| Công cụ | VS Code, trình duyệt hiện đại, Live Server tùy chọn |

## 14. Tiêu chí hoàn thành

- [ ] Tất cả link điều hướng chính hoạt động.
- [ ] Có tối thiểu 20 đề mẫu và 5 đề làm được.
- [ ] Bộ lọc kết hợp không làm mất trạng thái tìm kiếm ngoài ý muốn.
- [ ] Làm bài, timer, nộp bài và chấm điểm cho kết quả đúng.
- [ ] Câu bỏ trống, nộp sớm và hết giờ đều được xử lý.
- [ ] Đáp án/giải thích chỉ xuất hiện sau khi nộp.
- [ ] Reload trang vẫn giữ lịch sử và đề yêu thích.
- [ ] Responsive ở 360px, 768px và 1440px.
- [ ] Không có lỗi Console nghiêm trọng trong luồng demo.
- [ ] Có báo cáo, slide, kịch bản demo và phân công rõ ràng.

## 15. Rủi ro và phương án xử lý

| Rủi ro | Mức ảnh hưởng | Phương án |
|---|---|---|
| Phạm vi phình to | Cao | Khóa MVP cuối tuần 1; nâng cao chỉ làm sau khi checklist MVP đạt |
| Dữ liệu câu hỏi không thống nhất | Cao | Chốt schema, validate thủ công, dùng `id` duy nhất |
| Sai logic chấm điểm | Cao | Test đáp án đúng/sai/bỏ trống và nhiều lần nộp |
| Timer chạy sai khi chuyển tab | Trung bình | Tính thời gian dựa trên timestamp, không chỉ cộng từng giây |
| LocalStorage bị xóa/hỏng | Trung bình | Parse có `try/catch`, fallback mảng rỗng, thông báo người dùng |
| Xung đột khi tích hợp file | Trung bình | Quy ước module, review sớm, tích hợp mỗi ngày |
| Layout vỡ trên mobile | Cao | Test từ tuần 1, ưu tiên mobile-first, không đợi tuần 4 |
| Nội dung/ảnh có bản quyền | Trung bình | Dùng dữ liệu tự biên soạn hoặc nguồn được phép, ghi nguồn khi cần |
| Thiếu thời gian báo cáo | Cao | Ghi chép ảnh chụp và quyết định kỹ thuật mỗi tuần |

## 16. Bảng tổng hợp Project Roadmap

| Hạng mục | Cam kết của dự án |
|---|---|
| Mục tiêu | Tìm, lọc, luyện và theo dõi kết quả đề THPT trên trình duyệt |
| Chức năng | Kho đề, search/filter, chi tiết, quiz, timer, chấm điểm, đáp án, lịch sử, yêu thích, responsive |
| Sitemap | Home, Kho đề, Chi tiết, Làm bài, Kết quả, Lịch sử, Đã lưu, Giới thiệu, Liên hệ |
| Phân công | TV1 UI/shell; TV2 data/kho đề; TV3 quiz/chấm; TV4 storage/QA |
| Timeline | Tuần 1 thiết kế; tuần 2 kho đề; tuần 3 quiz + lưu dữ liệu; tuần 4 test + báo cáo |
| Cấu trúc | `pages/`, `css/`, `js/`, `data/`, `assets/`, `images/` |
| Công nghệ | HTML5, CSS3, Vanilla JS, JSON/JS data, LocalStorage |
| MVP | 11 mục trong phần MVP, đặc biệt một luồng demo end-to-end |
| Tiêu chí hoàn thành | Chức năng đúng, responsive, không lỗi nghiêm trọng, có tài liệu và demo |
| Rủi ro | Kiểm soát phạm vi, schema dữ liệu, test timer/chấm điểm, tích hợp sớm |

**Kết luận:** Nhóm nên xem phiên bản chạy ổn định của MVP là mốc bảo vệ chính. Các chức năng nâng cao chỉ được thực hiện khi toàn bộ luồng tìm đề -> làm bài -> chấm -> lưu lịch sử đã được kiểm thử trên cả desktop và mobile.
