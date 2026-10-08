const buildQuestion = (testId, subjectId, subjectName, grade, [topic, question, options, answerIndex, explanation], index) => {
  const answerPosition = index % options.length;
  const correctOption = options[answerIndex];
  const rotatedOptions = [...options.slice(answerPosition), ...options.slice(0, answerPosition)];
  const correctAnswer = rotatedOptions.indexOf(correctOption);

  return {
    id: `${testId}-q${index + 1}`,
    question,
    content: question,
    options: rotatedOptions,
    correctAnswer,
    explanation,
    subject: subjectName,
    subjectId,
    grade,
    topic,
    difficulty: "medium",
    difficultyName: "Thông hiểu",
    type: "multiple_choice",
  };
};

const defineSampleTest = (subjectId, subjectName, grade, questions) => {
  const id = `sample-${subjectId}-${grade}`;
  return {
    id,
    subjectId,
    subjectName,
    grade,
    title: `Bộ câu hỏi mẫu ${subjectName} ${grade}`,
    description: `Dữ liệu mẫu tự biên soạn để luyện tập ${subjectName} lớp ${grade}; mỗi câu có chủ đề, đáp án và giải thích.`,
    examType: "topic-review",
    examTypeName: "Ôn tập theo chủ đề",
    difficulty: "medium",
    difficultyName: "Trung bình",
    durationMinutes: 15,
    isSample: true,
    status: "available",
    questions: questions.map((question, index) => buildQuestion(id, subjectId, subjectName, grade, question, index)),
  };
};

export const scopedSampleTests = [
  defineSampleTest("toan", "Toán", 10, [
    ["Mệnh đề", "Mệnh đề nào sau đây đúng với mọi số nguyên n?", ["n là số chẵn thì n² là số chẵn", "n² luôn là số lẻ", "n luôn dương", "n² < n"], 0, "Nếu n = 2k thì n² = 4k², là số chẵn."],
    ["Tập hợp", "Cho A = {1, 2, 3} và B = {2, 3, 4}. Tập A ∩ B là", ["{1, 4}", "{2, 3}", "{1, 2, 3, 4}", "{ }"], 1, "Giao của hai tập gồm các phần tử cùng thuộc A và B."],
    ["Bất phương trình", "Nghiệm của bất phương trình 2x - 4 > 0 là", ["x > 2", "x < 2", "x > -2", "x < -2"], 0, "Cộng 4 hai vế rồi chia cho 2 được x > 2."],
    ["Hàm số bậc hai", "Đồ thị y = x² - 4x + 3 có trục đối xứng là", ["x = -2", "x = 2", "y = 2", "x = 4"], 1, "Với a = 1, b = -4, trục đối xứng là x = -b/(2a) = 2."],
    ["Vectơ", "Nếu A, B, C thẳng hàng và B nằm giữa A, C thì đẳng thức vectơ nào đúng?", ["AB + BC = AC", "AB + AC = BC", "BC + AC = AB", "AB = BC + AC"], 0, "Quy tắc ba điểm cho vectơ AB + BC = AC."],
  ]),
  defineSampleTest("tieng-anh", "Tiếng Anh", 10, [
    ["Từ vựng", "Choose the word closest in meaning to “generous”.", ["Kind and willing to give", "Feeling very tired", "Unable to speak", "Afraid of water"], 0, "“Generous” describes someone willing to give or share."],
    ["Ngữ pháp", "Choose the correct form: “My sister ___ to school by bus every day.”", ["go", "goes", "going", "gone"], 1, "With a singular subject in the present simple, use “goes”."],
    ["Thì hiện tại", "Choose the correct sentence.", ["They are studying now.", "They study now yesterday.", "They studying now.", "They is study now."], 0, "The present continuous uses am/is/are + verb-ing for an action happening now."],
    ["Đọc hiểu", "Read: “Mai waters the small garden every morning. She grows tomatoes and herbs.” What does Mai grow?", ["Tomatoes and herbs", "Rice and corn", "Only flowers", "Fruit trees"], 0, "The passage directly says Mai grows tomatoes and herbs."],
    ["Giao tiếp", "Choose the most suitable response: “Would you like some tea?”", ["Yes, please. Thank you.", "I am fifteen.", "It is behind the school.", "Never mind yesterday."], 0, "“Yes, please. Thank you.” is a polite response to an offer."],
  ]),
  defineSampleTest("vat-ly", "Vật lý", 10, [
    ["Đo lường", "Đơn vị đo độ dài trong hệ SI là", ["kilôgam (kg)", "mét (m)", "giây (s)", "ampe (A)"], 1, "Mét là đơn vị cơ bản đo độ dài trong hệ SI."],
    ["Chuyển động thẳng", "Một xe đi được 120 m trong 10 s. Tốc độ trung bình của xe là", ["12 m/s", "10 m/s", "1200 m/s", "0,12 m/s"], 0, "Tốc độ trung bình bằng quãng đường chia thời gian: 120/10 = 12 m/s."],
    ["Lực", "Theo định luật II Newton, nếu khối lượng không đổi và hợp lực tăng gấp đôi thì gia tốc", ["giảm một nửa", "không đổi", "tăng gấp đôi", "bằng không"], 2, "Từ F = ma, khi m không đổi thì gia tốc tỉ lệ thuận với hợp lực."],
    ["Năng lượng", "Một vật được nâng lên cao hơn so với mặt đất thì thế năng trọng trường của vật", ["tăng", "giảm về 0", "luôn không đổi", "đổi thành khối lượng"], 0, "Thế năng trọng trường gần mặt đất tăng theo độ cao."],
    ["Động lượng", "Động lượng của vật khối lượng 2 kg chuyển động với vận tốc 3 m/s có độ lớn", ["1,5 kg·m/s", "5 kg·m/s", "6 kg·m/s", "9 kg·m/s"], 2, "Động lượng p = mv = 2 × 3 = 6 kg·m/s."],
  ]),
  defineSampleTest("hoa-hoc", "Hóa học", 10, [
    ["Nguyên tử", "Hạt mang điện tích dương trong hạt nhân nguyên tử là", ["electron", "proton", "neutron", "phân tử"], 1, "Proton mang điện tích dương và nằm trong hạt nhân."],
    ["Bảng tuần hoàn", "Các nguyên tố trong cùng một chu kì của bảng tuần hoàn có cùng số", ["electron hóa trị", "lớp electron", "proton", "neutron"], 1, "Số thứ tự chu kì cho biết số lớp electron của nguyên tử."],
    ["Liên kết hóa học", "Liên kết ion thường hình thành do", ["sự dùng chung electron giữa hai nguyên tử", "lực hút tĩnh điện giữa ion trái dấu", "sự dùng chung proton", "các hạt nhân nhập lại"], 1, "Liên kết ion là lực hút tĩnh điện giữa các ion mang điện trái dấu."],
    ["Phản ứng hóa học", "Trong phản ứng hóa học, tổng khối lượng các chất được bảo toàn theo", ["định luật bảo toàn khối lượng", "định luật Ohm", "định luật phản xạ", "quy tắc bàn tay phải"], 0, "Trong hệ kín, tổng khối lượng chất tham gia bằng tổng khối lượng sản phẩm."],
    ["Mol", "Số mol có trong 18 g nước (H₂O, M = 18 g/mol) là", ["0,5 mol", "1 mol", "18 mol", "324 mol"], 1, "n = m/M = 18/18 = 1 mol."],
  ]),
  defineSampleTest("sinh-hoc", "Sinh học", 10, [
    ["Tế bào", "Bào quan nào là nơi chủ yếu diễn ra hô hấp tế bào ở sinh vật nhân thực?", ["Ribosome", "Ti thể", "Không bào", "Lưới nội chất"], 1, "Ti thể là nơi diễn ra phần lớn quá trình hô hấp tế bào hiếu khí."],
    ["Màng sinh chất", "Màng sinh chất có vai trò quan trọng nào?", ["Điều khiển trao đổi chất giữa tế bào và môi trường", "Tạo ra mọi thông tin di truyền", "Thay thế hoàn toàn nhân tế bào", "Chỉ nâng đỡ cơ thể"], 0, "Màng sinh chất có tính thấm chọn lọc và điều hòa trao đổi chất."],
    ["Trao đổi chất", "Enzyme làm tăng tốc độ phản ứng sinh học chủ yếu bằng cách", ["làm giảm năng lượng hoạt hóa", "làm tăng khối lượng sản phẩm", "thay đổi cân bằng vật chất", "bị tiêu hao hoàn toàn"], 0, "Enzyme xúc tác phản ứng bằng cách làm giảm năng lượng hoạt hóa."],
    ["Phân bào", "Kết quả của nguyên phân từ một tế bào mẹ lưỡng bội bình thường là", ["hai tế bào con có bộ nhiễm sắc thể như tế bào mẹ", "bốn giao tử đơn bội", "một tế bào con không có DNA", "hai tế bào con khác hẳn về bộ nhiễm sắc thể"], 0, "Nguyên phân tạo hai tế bào con giữ nguyên số lượng nhiễm sắc thể."],
    ["Sinh thái học", "Sinh vật sản xuất trong hệ sinh thái thường là", ["thực vật xanh", "động vật ăn thịt", "nấm phân giải", "vi khuẩn gây bệnh"], 0, "Thực vật xanh tự tổng hợp chất hữu cơ nhờ năng lượng ánh sáng."],
  ]),
  defineSampleTest("lich-su", "Lịch sử", 10, [
    ["Văn minh cổ đại", "Một thành tựu tiêu biểu của cư dân Ai Cập cổ đại là", ["chữ tượng hình", "máy in hơi nước", "động cơ điện", "mạng Internet"], 0, "Cư dân Ai Cập cổ đại sáng tạo chữ tượng hình và nhiều thành tựu khác."],
    ["Hy Lạp cổ đại", "Thành bang nào của Hy Lạp cổ đại nổi tiếng với mô hình dân chủ chủ nô?", ["Athens", "Sparta", "Babylon", "Memphis"], 0, "Athens là thành bang tiêu biểu với hình thức dân chủ chủ nô."],
    ["La Mã cổ đại", "Ngôn ngữ Latin có ảnh hưởng trực tiếp đến sự hình thành của nhiều ngôn ngữ thuộc nhóm", ["Rôman", "German", "Slavơ", "Hán-Tạng"], 0, "Các ngôn ngữ Rôman như Italy, Pháp, Tây Ban Nha phát triển từ Latin."],
    ["Lịch sử trung đại", "Con đường tơ lụa thời cổ-trung đại có vai trò nổi bật trong việc", ["kết nối giao thương và giao lưu văn hóa Á-Âu", "chỉ vận chuyển quân đội đường biển", "ngăn cản mọi trao đổi hàng hóa", "thay thế toàn bộ nông nghiệp"], 0, "Con đường tơ lụa kết nối các khu vực qua thương mại và giao lưu văn hóa."],
    ["Lịch sử Việt Nam", "Nhà nước Văn Lang gắn với thời đại các vua", ["Hùng", "Đinh", "Lý", "Trần"], 0, "Theo truyền thống lịch sử, Văn Lang do các vua Hùng đứng đầu."],
  ]),
  defineSampleTest("dia-li", "Địa lí", 10, [
    ["Bản đồ", "Tỉ lệ bản đồ 1:100 000 có nghĩa là 1 cm trên bản đồ ứng với ngoài thực địa", ["100 m", "1 km", "10 km", "100 km"], 1, "100 000 cm bằng 1 000 m, tức 1 km."],
    ["Trái Đất", "Đường xích đạo chia Trái Đất thành", ["bán cầu Bắc và bán cầu Nam", "bán cầu Đông và bán cầu Tây", "các múi giờ", "các lục địa"], 0, "Xích đạo là đường vĩ tuyến lớn nhất, chia Trái Đất thành hai bán cầu Bắc-Nam."],
    ["Khí quyển", "Tầng khí quyển tập trung phần lớn hiện tượng thời tiết là", ["tầng đối lưu", "tầng bình lưu", "tầng giữa", "tầng nhiệt"], 0, "Mây, mưa và các hiện tượng thời tiết chủ yếu xảy ra trong tầng đối lưu."],
    ["Thủy quyển", "Quá trình nước bốc hơi, ngưng tụ và rơi xuống tạo thành", ["tuần hoàn nước", "kiến tạo mảng", "phong hóa cơ học", "xâm thực băng hà"], 0, "Bốc hơi, ngưng tụ và giáng thủy là các bước cơ bản của vòng tuần hoàn nước."],
    ["Dân cư", "Mật độ dân số được tính bằng", ["dân số chia cho diện tích", "diện tích chia cho dân số", "dân số nhân độ cao", "diện tích trừ dân số"], 0, "Mật độ dân số = tổng dân số / diện tích lãnh thổ."],
  ]),
  defineSampleTest("tin-hoc", "Tin học", 10, [
    ["Thông tin và dữ liệu", "Trong máy tính số, dữ liệu được biểu diễn cơ bản bằng", ["hai kí hiệu 0 và 1", "mười kí hiệu A đến J", "chỉ các chữ cái", "âm thanh liên tục không mã hóa"], 0, "Máy tính số biểu diễn dữ liệu bằng các bit có giá trị 0 hoặc 1."],
    ["Thuật toán", "Một thuật toán cần có tính chất nào để giải bài toán?", ["các bước rõ ràng và hữu hạn", "không có điểm kết thúc", "mỗi lần chạy cho kết quả tùy ý", "chỉ mô tả bằng hình ảnh"], 0, "Thuật toán gồm các bước xác định và kết thúc sau hữu hạn bước."],
    ["Lập trình", "Trong Python, phép toán lấy phần dư là", ["//", "%", "**", "=="], 1, "Toán tử % trả về phần dư của phép chia."],
    ["Mạng máy tính", "Thiết bị thường dùng để kết nối nhiều thiết bị trong mạng LAN là", ["switch", "máy quét", "loa", "máy chiếu"], 0, "Switch chuyển tiếp dữ liệu giữa các thiết bị trong mạng cục bộ."],
    ["An toàn số", "Cách nào an toàn nhất khi nhận liên kết đăng nhập bất ngờ qua tin nhắn?", ["Không mở vội; kiểm tra địa chỉ qua kênh chính thức", "Nhập mật khẩu ngay", "Chuyển tiếp cho mọi người", "Tắt phần mềm bảo vệ"], 0, "Liên kết bất ngờ có thể là lừa đảo; cần xác minh qua trang/kênh chính thức."],
  ]),
  defineSampleTest("gdkp", "Giáo dục kinh tế và pháp luật", 10, [
    ["Kinh tế và lựa chọn", "Do nguồn lực có hạn, khi lựa chọn sử dụng một nguồn lực, cá nhân thường phải", ["cân nhắc phương án và chi phí cơ hội", "đáp ứng đồng thời mọi nhu cầu", "loại bỏ mọi nhu cầu", "không cần lập kế hoạch"], 0, "Nguồn lực khan hiếm khiến lựa chọn một phương án đồng nghĩa bỏ qua phương án khác."],
    ["Thị trường", "Trong thị trường cạnh tranh, giá cả thường chịu tác động trực tiếp của", ["quan hệ cung và cầu", "màu sắc hàng hóa", "ngày sinh người bán", "khoảng cách đến xích đạo"], 0, "Cung và cầu là các yếu tố cơ bản tác động đến giá thị trường."],
    ["Tiêu dùng", "Trước khi mua hàng trực tuyến, người tiêu dùng nên", ["kiểm tra người bán, thông tin sản phẩm và điều kiện giao dịch", "cung cấp mã OTP cho người bán", "bỏ qua giá và nguồn gốc", "dùng mọi mật khẩu đang có"], 0, "Kiểm tra thông tin giúp giảm rủi ro và đưa ra quyết định tiêu dùng có trách nhiệm."],
    ["Quyền và nghĩa vụ", "Khi tham gia giao thông, công dân có trách nhiệm", ["tuân thủ quy tắc và pháp luật giao thông", "chỉ tuân thủ khi có người giám sát", "tự đặt tín hiệu riêng", "nhường quyền điều khiển cho người chưa đủ điều kiện"], 0, "Tuân thủ pháp luật giao thông là trách nhiệm của người tham gia giao thông."],
    ["Pháp luật", "Quy tắc xử sự chung do Nhà nước ban hành và bảo đảm thực hiện được gọi là", ["pháp luật", "sở thích", "phong tục cá nhân", "lời khuyên"], 0, "Pháp luật là hệ thống quy tắc xử sự chung có tính bắt buộc do Nhà nước ban hành/bảo đảm."],
  ]),
  defineSampleTest("toan", "Toán", 11, [
    ["Hàm số lượng giác", "Giá trị của sin(π/6) là", ["0", "1/2", "√2/2", "1"], 1, "sin(π/6) = 1/2."],
    ["Phương trình lượng giác", "Nghiệm của phương trình sin x = 0 trên đoạn [0, 2π] là", ["0, π, 2π", "π/2, 3π/2", "π/6, 5π/6", "π/4, 7π/4"], 0, "sin x = 0 khi x = kπ; trên đoạn đã cho là 0, π, 2π."],
    ["Dãy số", "Dãy số có số hạng tổng quát uₙ = 2n + 1 có u₃ bằng", ["5", "6", "7", "8"], 2, "Thay n = 3 được u₃ = 2×3 + 1 = 7."],
    ["Cấp số cộng", "Cấp số cộng có u₁ = 3, công sai d = 2. Số hạng u₅ bằng", ["9", "11", "13", "15"], 1, "u₅ = u₁ + 4d = 3 + 8 = 11."],
    ["Giới hạn", "Giới hạn của (3n + 1)/n khi n tiến ra vô cùng là", ["0", "1", "3", "vô cùng"], 2, "(3n + 1)/n = 3 + 1/n, tiến tới 3."],
  ]),
  defineSampleTest("tieng-anh", "Tiếng Anh", 11, [
    ["Từ vựng", "Choose the word closest in meaning to “conserve” in “conserve energy”.", ["Save and use carefully", "Waste quickly", "Make louder", "Forget completely"], 0, "“Conserve” means to protect or use something carefully."],
    ["Ngữ pháp", "Choose the correct form: “If it rains tomorrow, we ___ at home.”", ["stay", "will stay", "stayed", "would stayed"], 1, "The first conditional uses if + present simple, followed by will + base verb."],
    ["Câu bị động", "Choose the correct passive form: “People speak English in many countries.”", ["English is spoken in many countries.", "English speaks in many countries.", "English was speak in many countries.", "People are spoken English."], 0, "Present simple passive: subject + am/is/are + past participle."],
    ["Đọc hiểu", "Read: “The school started a bike-sharing program to reduce short car trips.” Why did the school start it?", ["To reduce short car trips", "To increase traffic", "To replace all lessons", "To close the library"], 0, "The purpose is stated directly in the sentence."],
    ["Giao tiếp", "Choose the best response: “I think we should recycle more paper.”", ["That sounds like a good idea.", "I am reading yesterday.", "It is ten kilometers tall.", "Never mind the window."], 0, "This response appropriately expresses agreement with a suggestion."],
  ]),
  defineSampleTest("vat-ly", "Vật lý", 11, [
    ["Dao động điều hòa", "Trong dao động điều hòa, gia tốc luôn", ["cùng chiều và tỉ lệ với li độ", "ngược chiều và tỉ lệ với li độ", "không phụ thuộc li độ", "luôn bằng vận tốc"], 1, "Gia tốc dao động điều hòa a = -ω²x, ngược chiều với li độ."],
    ["Sóng cơ", "Hai điểm gần nhau nhất trên phương truyền sóng dao động cùng pha cách nhau", ["λ/4", "λ/2", "λ", "2λ"], 2, "Khoảng cách giữa hai điểm cùng pha gần nhất là một bước sóng λ."],
    ["Âm học", "Độ cao của âm phụ thuộc chủ yếu vào", ["tần số", "biên độ", "khối lượng nguồn âm", "khoảng cách đến nguồn"], 0, "Tần số càng lớn thì âm nghe càng cao."],
    ["Dòng điện", "Đơn vị đo cường độ dòng điện trong hệ SI là", ["vôn (V)", "ôm (Ω)", "ampe (A)", "jun (J)"], 2, "Ampe là đơn vị đo cường độ dòng điện."],
    ["Nhiệt học", "Vật nhận nhiệt lượng nhưng không thực hiện công thì nội năng của vật", ["tăng", "giảm", "luôn bằng 0", "không thể xác định chiều biến đổi"], 0, "Theo nguyên lí I nhiệt động lực học, nhiệt truyền vào làm nội năng tăng khi không có công."],
  ]),
  defineSampleTest("hoa-hoc", "Hóa học", 11, [
    ["Cân bằng hóa học", "Khi tăng nồng độ chất tham gia trong một hệ đang cân bằng, cân bằng thường chuyển dịch theo chiều", ["làm giảm nồng độ chất vừa thêm", "tạo thêm chất vừa thêm", "không bao giờ thay đổi", "dừng mọi phản ứng"], 0, "Theo nguyên lí Le Chatelier, hệ chuyển dịch theo chiều chống lại tác động tăng nồng độ."],
    ["Acid và base", "Dung dịch có pH = 2 ở 25°C có môi trường", ["acid", "trung tính", "base", "không có ion"], 0, "Ở 25°C, pH nhỏ hơn 7 biểu thị môi trường acid."],
    ["Nitrogen", "Trong phân tử N₂, hai nguyên tử nitrogen liên kết với nhau bằng", ["liên kết đơn", "liên kết đôi", "liên kết ba", "liên kết ion"], 2, "Phân tử N₂ có liên kết ba bền giữa hai nguyên tử nitrogen."],
    ["Sulfur", "Khí SO₂ có thể được tạo ra khi đốt cháy sulfur trong oxygen theo phản ứng", ["S + O₂ → SO₂", "S + H₂ → H₂S", "S + Na → Na₂S", "S + Cl₂ → SCl₂"], 0, "Sulfur cháy trong oxygen tạo sulfur dioxide."],
    ["Hóa học hữu cơ", "Đặc điểm thường gặp của hợp chất hữu cơ là", ["có khung carbon, trừ một số hợp chất đơn giản của carbon", "luôn tan tốt trong nước", "chỉ chứa một nguyên tố", "không thể cháy"], 0, "Hợp chất hữu cơ chủ yếu là hợp chất của carbon, có một số ngoại lệ vô cơ."],
  ]),
  defineSampleTest("sinh-hoc", "Sinh học", 11, [
    ["Trao đổi nước ở thực vật", "Phần lớn nước thoát ra khỏi lá cây qua", ["khí khổng", "mạch gỗ ở rễ", "lông hút", "hạt phấn"], 0, "Thoát hơi nước chủ yếu qua khí khổng trên lá."],
    ["Quang hợp", "Pha sáng của quang hợp diễn ra chủ yếu ở", ["màng thylakoid", "chất nền ti thể", "nhân tế bào", "thành tế bào"], 0, "Các hệ sắc tố và chuỗi truyền electron pha sáng nằm trên màng thylakoid."],
    ["Tuần hoàn", "Ở người, tâm thất trái bơm máu vào", ["động mạch chủ", "tĩnh mạch chủ", "động mạch phổi", "tĩnh mạch phổi"], 0, "Tâm thất trái đưa máu giàu oxygen vào động mạch chủ và vòng tuần hoàn lớn."],
    ["Miễn dịch", "Kháng thể được tạo ra chủ yếu bởi", ["tế bào plasma phát triển từ lympho B", "hồng cầu trưởng thành", "tiểu cầu", "tế bào thần kinh"], 0, "Lympho B biệt hóa thành tế bào plasma tiết kháng thể."],
    ["Sinh trưởng và phát triển", "Hormone thực vật auxin thường kích thích", ["sự kéo dài tế bào ở chồi", "đông máu", "tạo kháng thể", "phân giải hemoglobin"], 0, "Auxin thúc đẩy kéo dài tế bào, đặc biệt ở thân và chồi non."],
  ]),
  defineSampleTest("lich-su", "Lịch sử", 11, [
    ["Cách mạng công nghiệp", "Cuộc cách mạng công nghiệp lần thứ nhất khởi đầu ở", ["Anh", "Nhật Bản", "Brazil", "Ai Cập"], 0, "Cách mạng công nghiệp lần thứ nhất bắt đầu ở Anh vào thế kỉ XVIII."],
    ["Cách mạng tư sản", "Tuyên ngôn Độc lập của Hoa Kỳ được công bố năm", ["1776", "1789", "1815", "1848"], 0, "Tuyên ngôn Độc lập Hoa Kỳ được thông qua ngày 4/7/1776."],
    ["Chủ nghĩa đế quốc", "Cuối thế kỉ XIX, các nước tư bản đẩy mạnh", ["xâm chiếm thuộc địa", "giải thể mọi đế quốc", "chấm dứt công nghiệp", "hạn chế cạnh tranh bằng cách đóng cửa"], 0, "Các nước đế quốc cạnh tranh thị trường và thuộc địa."],
    ["Phong trào giải phóng dân tộc", "Mục tiêu chung của nhiều phong trào giải phóng dân tộc ở châu Á đầu thế kỉ XX là", ["giành độc lập dân tộc", "khôi phục chế độ phong kiến ở châu Âu", "mở rộng thuộc địa", "xóa bỏ mọi hoạt động giáo dục"], 0, "Các phong trào hướng tới chống ách thống trị và giành độc lập."],
    ["Lịch sử Việt Nam", "Phong trào Cần Vương cuối thế kỉ XIX gắn với lời kêu gọi", ["giúp vua cứu nước", "đông du sang Mỹ", "thành lập ASEAN", "đổi mới kinh tế năm 1986"], 0, "Phong trào Cần Vương hưởng ứng chiếu Cần Vương, giúp vua cứu nước."],
  ]),
  defineSampleTest("dia-li", "Địa lí", 11, [
    ["Toàn cầu hóa", "Một biểu hiện của toàn cầu hóa kinh tế là", ["các dòng vốn và hàng hóa tăng cường lưu chuyển giữa các nước", "mọi nước ngừng giao thương", "các nền kinh tế không còn liên hệ", "chỉ sản xuất trong phạm vi gia đình"], 0, "Toàn cầu hóa thúc đẩy liên kết và trao đổi kinh tế xuyên biên giới."],
    ["Dân số thế giới", "Tỉ suất gia tăng dân số tự nhiên được xác định chủ yếu từ", ["tỉ suất sinh trừ tỉ suất tử", "tỉ suất nhập cư trừ diện tích", "mật độ dân số cộng đô thị hóa", "tổng dân số chia GDP"], 0, "Gia tăng tự nhiên bằng tỉ suất sinh thô trừ tỉ suất tử thô."],
    ["Đô thị hóa", "Một tác động thường gặp của đô thị hóa nhanh nhưng thiếu quy hoạch là", ["áp lực lên nhà ở và hạ tầng", "xóa bỏ hoàn toàn nhu cầu giao thông", "giảm mọi loại chất thải về 0", "làm biến mất dân cư"], 0, "Đô thị hóa nhanh có thể gây quá tải nhà ở, giao thông và dịch vụ."],
    ["Nông nghiệp", "Nông nghiệp hàng hóa thường hướng tới", ["sản xuất gắn với nhu cầu thị trường", "chỉ tự cung tự cấp", "không sử dụng trao đổi", "sản xuất không cần đầu vào"], 0, "Sản xuất hàng hóa tạo sản phẩm để trao đổi, tiêu thụ trên thị trường."],
    ["Môi trường", "Phát triển bền vững đòi hỏi kết hợp hài hòa giữa", ["kinh tế, xã hội và môi trường", "sản lượng và khai thác vô hạn", "đô thị và dân số mà không xét môi trường", "giao thông và thương mại mà không quan tâm xã hội"], 0, "Phát triển bền vững cân bằng ba trụ cột kinh tế, xã hội, môi trường."],
  ]),
  defineSampleTest("tin-hoc", "Tin học", 11, [
    ["Kiểu dữ liệu", "Trong Python, kiểu dữ liệu phù hợp để lưu chuỗi ký tự là", ["str", "int", "bool", "float"], 0, "str là kiểu dữ liệu chuỗi trong Python."],
    ["Danh sách", "Với a = [4, 7, 9] trong Python, giá trị của a[1] là", ["4", "7", "9", "1"], 1, "Chỉ số danh sách bắt đầu từ 0 nên a[1] là phần tử thứ hai, bằng 7."],
    ["Hàm", "Từ khóa dùng để định nghĩa hàm trong Python là", ["def", "function", "method", "make"], 0, "Cú pháp định nghĩa hàm trong Python bắt đầu bằng từ khóa def."],
    ["Dữ liệu số", "Trong bảng tính, công thức thường bắt đầu bằng ký tự", ["=", "#", "@", "&"], 0, "Công thức trong các ứng dụng bảng tính thường bắt đầu bằng dấu bằng."],
    ["Mạng và web", "HTTPS giúp bảo vệ kết nối web chủ yếu bằng cách", ["mã hóa dữ liệu truyền giữa trình duyệt và máy chủ", "xóa mọi virus khỏi máy", "ẩn hoàn toàn danh tính người dùng", "bảo đảm mọi trang đều đáng tin"], 0, "HTTPS mã hóa dữ liệu truyền tải, nhưng không đảm bảo nội dung trang luôn an toàn."],
  ]),
  defineSampleTest("gdkp", "Giáo dục kinh tế và pháp luật", 11, [
    ["Tăng trưởng kinh tế", "Tăng trưởng kinh tế thường được phản ánh bằng sự gia tăng", ["quy mô sản lượng của nền kinh tế", "số ngày nghỉ trong năm", "diện tích lãnh thổ", "số điều luật"], 0, "Tăng trưởng kinh tế phản ánh mức tăng sản lượng/thu nhập trong một thời kì."],
    ["Lạm phát", "Lạm phát là tình trạng", ["mức giá chung tăng liên tục trong một thời gian", "mọi hàng hóa miễn phí", "giá một mặt hàng giảm một lần", "tiền tệ không còn được sử dụng"], 0, "Lạm phát là sự tăng lên liên tục của mức giá chung."],
    ["Thất nghiệp", "Người được xem là thất nghiệp thường là người", ["trong độ tuổi lao động, có khả năng và nhu cầu làm việc nhưng chưa có việc", "đang học phổ thông và không tìm việc", "đã nghỉ hưu và không muốn làm việc", "đang làm việc toàn thời gian"], 0, "Khái niệm thất nghiệp gắn với khả năng, nhu cầu làm việc và chưa có việc làm."],
    ["Ngân sách nhà nước", "Nguồn thu quan trọng của ngân sách nhà nước là", ["thuế và các khoản thu theo quy định", "tiền tiết kiệm cá nhân tự nguyện", "mọi khoản vay không hoàn trả", "tiền phạt do doanh nghiệp tự đặt"], 0, "Thuế là nguồn thu chủ yếu, quan trọng của ngân sách nhà nước."],
    ["Pháp luật kinh doanh", "Cá nhân kinh doanh có trách nhiệm", ["thực hiện nghĩa vụ thuế và tuân thủ quy định liên quan", "tự miễn mọi nghĩa vụ pháp luật", "chỉ tuân thủ khi có khách hàng", "công khai dữ liệu cá nhân của khách"], 0, "Hoạt động kinh doanh phải tuân thủ pháp luật, gồm nghĩa vụ thuế."],
  ]),
  defineSampleTest("tieng-anh", "Tiếng Anh", 12, [
    ["Từ vựng", "Choose the word closest in meaning to “sustainable”.", ["Able to continue without exhausting resources", "Happening only once", "Extremely expensive", "Impossible to measure"], 0, "“Sustainable” describes something that can continue over time without depleting resources."],
    ["Ngữ pháp", "Choose the correct form: “By the time we arrived, the film ___.”", ["starts", "has started", "had started", "will start"], 2, "The past perfect describes an action completed before another past action."],
    ["Mệnh đề quan hệ", "Choose the correct sentence.", ["The scientist who led the project received an award.", "The scientist which led the project received an award.", "The scientist where led the project received an award.", "The scientist whose led the project received an award."], 0, "Use who for a person acting as the subject of a relative clause."],
    ["Đọc hiểu", "Read: “Online courses allow learners to study flexibly, but they require self-discipline.” What is one challenge mentioned?", ["They require self-discipline.", "They cannot be accessed online.", "They always take less than a day.", "They prevent flexible study."], 0, "The passage explicitly says online courses require self-discipline."],
    ["Giao tiếp", "Choose the best response: “Could you clarify what you mean by ‘renewable energy’?”", ["Of course. It comes from sources naturally replenished.", "I have been there last year.", "It is the tallest building.", "No, I am not hungry."], 0, "The response directly clarifies the meaning of renewable energy."],
  ]),
  defineSampleTest("vat-ly", "Vật lý", 12, [
    ["Dao động điện từ", "Trong mạch LC lí tưởng, năng lượng điện từ toàn phần", ["được bảo toàn", "tăng vô hạn", "luôn bằng 0", "chỉ tồn tại trong cuộn cảm"], 0, "Mạch LC lí tưởng trao đổi năng lượng giữa tụ điện và cuộn cảm, tổng năng lượng không đổi."],
    ["Sóng điện từ", "Sóng điện từ truyền được trong", ["chân không", "chỉ chất rắn", "chỉ chất lỏng", "chỉ môi trường có không khí"], 0, "Sóng điện từ không cần môi trường vật chất và truyền được trong chân không."],
    ["Lượng tử ánh sáng", "Theo thuyết lượng tử, năng lượng photon được tính bằng", ["E = hf", "E = mc", "E = U/I", "E = pV"], 0, "Năng lượng photon bằng h nhân tần số f."],
    ["Hạt nhân nguyên tử", "Hai hạt nhân có cùng số proton nhưng khác số neutron là", ["đồng vị", "đồng phân", "ion cùng điện tích", "photon"], 0, "Các đồng vị có cùng số proton nhưng khác số neutron."],
    ["Vật lý hạt nhân", "Trong phản ứng phân hạch hạt nhân nặng, hạt nhân ban đầu", ["tách thành các hạt nhân nhẹ hơn và có thể giải phóng năng lượng", "luôn biến thành một electron", "không thể biến đổi", "chỉ phát ra ánh sáng nhìn thấy"], 0, "Phân hạch là sự vỡ hạt nhân nặng thành các hạt nhân nhẹ hơn, thường kèm giải phóng năng lượng."],
  ]),
  defineSampleTest("hoa-hoc", "Hóa học", 12, [
    ["Ester", "Sản phẩm hữu cơ thường tạo thành khi acid carboxylic phản ứng với alcohol là", ["ester", "amine", "alkane", "amino acid"], 0, "Phản ứng ester hóa giữa acid carboxylic và alcohol tạo ester và nước."],
    ["Polymer", "Polyethylene được tạo thành từ phản ứng trùng hợp monomer", ["ethylene", "ethanol", "ethanoic acid", "glucose"], 0, "Polyethylene là polymer tạo từ các phân tử ethylene."],
    ["Điện hóa", "Trong pin điện hóa đang phát điện, tại anode xảy ra quá trình", ["oxidation", "reduction", "trung hòa neutron", "ngưng tụ"], 0, "Anode là điện cực xảy ra quá trình oxi hóa."],
    ["Kim loại", "Kim loại phản ứng với dung dịch acid giải phóng H₂ khi kim loại đứng trước hydrogen trong", ["dãy hoạt động hóa học", "bảng tuần hoàn theo khối lượng", "dãy điện môi", "thang pH"], 0, "Các kim loại đứng trước H thường đẩy được hydrogen khỏi dung dịch acid loãng thích hợp."],
    ["Amino acid", "Amino acid trong phân tử thường đồng thời có nhóm", ["–NH₂ và –COOH", "–OH và –CHO", "–NO₂ và –Cl", "–COO– và –O–"], 0, "Amino acid chứa nhóm amino và nhóm carboxyl."],
  ]),
  defineSampleTest("sinh-hoc", "Sinh học", 12, [
    ["Di truyền học", "Trong phép lai Aa × Aa với trội hoàn toàn, xác suất kiểu hình lặn ở đời con là", ["1/4", "1/2", "3/4", "1"], 0, "Tỉ lệ kiểu gen là 1AA:2Aa:1aa; kiểu hình lặn aa chiếm 1/4."],
    ["DNA", "Trong DNA mạch kép, adenine liên kết bổ sung với", ["thymine", "guanine", "cytosine", "uracil"], 0, "Trong DNA, A bắt cặp với T; G bắt cặp với C."],
    ["Tiến hóa", "Chọn lọc tự nhiên tác động trực tiếp lên", ["kiểu hình của cá thể", "nhu cầu của loài", "đột biến có định hướng", "môi trường địa chất"], 0, "Chọn lọc tự nhiên phân hóa khả năng sống sót và sinh sản dựa trên kiểu hình."],
    ["Sinh thái học", "Trong chuỗi thức ăn, sinh vật tiêu thụ bậc một thường ăn", ["sinh vật sản xuất", "sinh vật phân giải duy nhất", "động vật ăn thịt đầu bảng", "chất vô cơ"], 0, "Sinh vật tiêu thụ bậc một thường là động vật ăn thực vật, sử dụng sinh vật sản xuất."],
    ["Công nghệ sinh học", "Enzyme cắt giới hạn trong công nghệ gene được dùng để", ["cắt DNA tại những trình tự đặc hiệu", "tạo năng lượng ánh sáng", "dịch mã protein trực tiếp", "làm biến mất mọi gene"], 0, "Enzyme cắt giới hạn nhận biết và cắt DNA tại các trình tự nucleotide đặc hiệu."],
  ]),
  defineSampleTest("tin-hoc", "Tin học", 12, [
    ["Cơ sở dữ liệu", "Trong cơ sở dữ liệu quan hệ, khóa chính dùng để", ["xác định duy nhất mỗi bản ghi", "mã hóa màn hình", "thay thế mọi bảng", "lưu mật khẩu dưới dạng văn bản thường"], 0, "Khóa chính phân biệt duy nhất các bản ghi trong một bảng."],
    ["SQL", "Câu lệnh SQL nào lấy các hàng từ bảng Students?", ["SELECT * FROM Students;", "DELETE Students;", "DROP ROW Students;", "OPEN Students;"], 0, "SELECT ... FROM dùng để truy vấn dữ liệu từ bảng."],
    ["Thuật toán", "Độ phức tạp thời gian O(n) thường có nghĩa số bước tăng", ["tỉ lệ tuyến tính với kích thước đầu vào n", "theo bình phương của n", "không phụ thuộc đầu vào trong mọi trường hợp", "theo giai thừa n"], 0, "O(n) biểu thị tốc độ tăng tuyến tính theo kích thước dữ liệu."],
    ["Trí tuệ nhân tạo", "Một hệ thống học máy cần dữ liệu huấn luyện để", ["học các mẫu phục vụ dự đoán hoặc phân loại", "tự động bảo đảm mọi kết quả đúng", "thay thế hoàn toàn việc đánh giá", "xóa bỏ nhu cầu kiểm tra dữ liệu"], 0, "Mô hình học máy rút ra mẫu từ dữ liệu huấn luyện; chất lượng cần được đánh giá."],
    ["An toàn thông tin", "Xác thực đa yếu tố giúp tăng an toàn tài khoản bằng cách", ["yêu cầu thêm yếu tố xác minh ngoài mật khẩu", "dùng chung một mật khẩu cho mọi dịch vụ", "tắt mã hóa", "công khai mã khôi phục"], 0, "MFA yêu cầu từ hai yếu tố xác minh độc lập trở lên."],
  ]),
  defineSampleTest("gdkp", "Giáo dục kinh tế và pháp luật", 12, [
    ["Quyền công dân", "Quyền bình đẳng trước pháp luật có nghĩa là", ["mọi người đều được pháp luật bảo vệ và áp dụng theo quy định", "một số người được đứng ngoài pháp luật", "mọi hành vi đều không bị xử lý", "chỉ người có chức vụ mới có quyền"], 0, "Bình đẳng trước pháp luật yêu cầu quyền, nghĩa vụ và trách nhiệm được xác định theo pháp luật."],
    ["Pháp luật lao động", "Thỏa thuận về công việc, tiền lương và điều kiện làm việc giữa người lao động và người sử dụng lao động thường được ghi trong", ["hợp đồng lao động", "hóa đơn bán lẻ", "điều lệ trường học", "giấy khai sinh"], 0, "Hợp đồng lao động ghi nhận thỏa thuận cơ bản giữa các bên trong quan hệ lao động."],
    ["Kinh doanh", "Doanh nghiệp phải thực hiện nghĩa vụ thuế theo", ["quy định pháp luật hiện hành", "thỏa thuận miệng với khách hàng", "sở thích của chủ doanh nghiệp", "mức do từng nhân viên tự chọn"], 0, "Nghĩa vụ thuế được xác định và thực hiện theo pháp luật."],
    ["Quyền sở hữu", "Tôn trọng quyền sở hữu tài sản của người khác có nghĩa là", ["không tự ý chiếm giữ hoặc sử dụng trái phép tài sản", "có thể lấy tài sản nếu thấy cần", "chỉ cần trả lại khi bị phát hiện", "được công khai thông tin riêng của chủ tài sản"], 0, "Tài sản của người khác được pháp luật bảo vệ; việc sử dụng cần có căn cứ/đồng ý hợp pháp."],
    ["Công dân và cộng đồng", "Khi phát hiện thông tin có dấu hiệu lừa đảo, cách ứng xử phù hợp là", ["kiểm chứng, không phát tán và báo cho kênh có trách nhiệm", "chia sẻ ngay để tăng lượt xem", "gửi mã xác thực cho người đăng", "xóa mọi bằng chứng"], 0, "Kiểm chứng và báo cáo giúp hạn chế thiệt hại, tránh lan truyền thông tin sai."],
  ]),
];
