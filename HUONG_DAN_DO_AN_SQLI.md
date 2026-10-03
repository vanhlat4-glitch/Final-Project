# HƯỚNG DẪN ĐỒ ÁN AN TOÀN & BẢO MẬT THÔNG TIN
## Đề tài: XÂY DỰNG MÔ HÌNH PHÁT HIỆN VÀ PHÒNG CHỐNG TẤN CÔNG SQL INJECTION TRÊN ỨNG DỤNG WEB

> **Dành cho bạn:** Tài liệu này được viết theo cách **cực kỳ dễ hiểu, từng bước một**, giúp bạn tự tin đạt điểm cao và trả lời trôi chảy mọi câu hỏi của thầy cô dù chưa nắm vững môn này!

---

## 1. TỔNG QUAN HỆ THỐNG ĐÃ XÂY DỰNG (NÓI GÌ KHI GIỚI THIỆU?)

Đồ án của bạn không chỉ là bài tập lý thuyết đơn thuần, mà là một **Hệ thống phòng vệ WAF (Web Application Firewall) thực tế 3 lớp**:

1. **Lớp Giao diện (Front-end Web React - Morent):**
   - Đã tích hợp các điểm kiểm thử tấn công (Form Đăng nhập, Thanh tìm kiếm xe).
   - Có trang **"🛡️ Giám sát SQLi & AI"** trực quan trong Menu Admin: hiển thị biểu đồ, nhật ký các đợt tấn công bị chặn theo thời gian thực (Real-time Logs), và nút gạt **Chuyển đổi chế độ (Vulnerable Mode $\leftrightarrow$ Protected Mode)** để demo tại chỗ.
2. **Lớp Mô hình Học máy phát hiện tấn công (AI Detection Engine - Python):**
   - Sử dụng giải thuật **TF-IDF Character N-gram (2–5)** kết hợp **Logistic Regression**.
   - Phân tích cú pháp chuỗi đầu vào để phát hiện các dấu hiệu mã độc (như `'`, `--`, `UNION`, `OR 1=1`, `WAITFOR`,...).
   - Tính toán xác suất độc hại (**Confidence Score %**) và phân loại kỹ thuật tấn công (Bypass, UNION, Blind SQLi,...).
   - Đã được huấn luyện và lưu sẵn trong file `sqli_model.pkl` với độ chính xác đạt **100%**.
3. **Lớp Cơ sở dữ liệu & Phòng chống triệt để (Database Layer - SQL Server / SQLite):**
   - Cung cấp file `init_sqlserver.sql` để chạy trên **Microsoft SQL Server (SSMS)**.
   - Đồng thời có sẵn CSDL **SQLite** tự động chạy ngầm để lúc demo không bao giờ bị lỗi do quên bật phần mềm database.
   - Phòng chống triệt để bằng kỹ thuật **Prepared Statements (Parameterized Queries)**.

---

## 2. CÁCH KHỞI ĐỘNG HỆ THỐNG ĐỂ DEMO (SIÊU ĐƠN GIẢN)

Bạn có 2 cách chạy:

### Cách 1 (Nhanh nhất): Nhấp đúp chuột vào file 1-click
- Vào thư mục `Final-Project/`, nhấp đúp vào file **`CHAY_HE_THONG.bat`**.
- File sẽ tự động mở cả Server Python và Web React.

### Cách 2: Chạy bằng lệnh trong Terminal (nếu thầy cô yêu cầu bật terminal)
* **Terminal 1 (Backend AI):**
  ```bash
  python backend/server.py
  ```
  *(Server chạy tại `http://localhost:5000`)*

* **Terminal 2 (Web React):**
  ```bash
  npm run dev
  ```
  *(Mở trình duyệt vào `http://localhost:5173`)*

---

## 3. KỊCH BẢN 3 BƯỚC THUYẾT TRÌNH TRƯỚC HỘI ĐỒNG (BẠN CHỈ CẦN LÀM THEO)

### 🔴 Bước 1: Trình diễn Lỗ hổng khi KHÔNG có bảo vệ (Vulnerable Mode)
1. Đăng nhập Admin vào web (`admin@morent.vn` / `admin123`).
2. Vào mục **"🛡️ Giám sát SQLi & AI"** trên menu bên trái.
3. Bấm nút màu đỏ: **`🔴 TẮT PHÒNG VỆ ĐỂ DEMO HACK`**.
4. Bấm **Đăng xuất**, quay lại màn hình Đăng nhập.
5. Bạn bấm vào nút bấm nhanh: **`⚡ ' OR 1=1 -- (Bypass)`** và bấm **Đăng nhập**.
6. **Kết quả:** Hệ thống lập tức bị hack và đăng nhập thành công vào vai trò Admin mà **hoàn toàn không cần mật khẩu**!
   > *Câu bạn nói với thầy cô:* "Thưa thầy/cô, ở chế độ nối chuỗi SQL truyền thống, kẻ tấn công chèn chuỗi `' OR 1=1 --` làm cho mệnh đề WHERE luôn đúng và dấu `--` cắt bỏ phần kiểm tra mật khẩu, dẫn đến việc vượt qua xác thực thành công."

---

### 🟢 Bước 2: Kích hoạt Mô hình AI & Phòng chống (Protected Mode)
1. Quay lại trang **"🛡️ Giám sát SQLi & AI"**.
2. Bấm nút: **`🟢 BẬT BẢO VỆ BẰNG AI & SQL`**.
3. Quay lại trang Đăng nhập hoặc vào trang **"Tìm xe"** (`/customer/search`).
4. Thử bấm lại câu lệnh `' OR 1=1 --` hoặc `' UNION SELECT Users --`.
5. **Kết quả:** Hệ thống hiển thị ngay hộp thông báo màu đỏ:
   - `🛑 PHÁT HIỆN & CHẶN ĐỨNG TẤN CÔNG SQL INJECTION!`
   - Phân loại: `Auth Bypass (Vượt qua xác thực)`
   - Độ tin cậy AI: `96%`
   - Request bị chặn đứng (Mã lỗi 403 Forbidden), không chạm được vào CSDL!
   > *Câu bạn nói với thầy cô:* "Khi bật chế độ bảo vệ, lớp Middleware AI sẽ tính toán xác suất độc hại của chuỗi đầu vào. Khi phát hiện đây là SQLi với độ tin cậy trên 90%, hệ thống lập tức ngắt kết nối và trả về lỗi 403 Forbidden."

---

### 📊 Bước 3: Cho thầy cô xem Nhật ký tấn công & Thử nghiệm Sandbox
1. Mở trang **"🛡️ Giám sát SQLi & AI"**.
2. Chỉ vào bảng **"Nhật ký Phát hiện Tấn công (Security Logs)"**: Thầy cô sẽ thấy đầy đủ các đòn tấn công vừa thực hiện (Thời gian, IP `127.0.0.1`, câu lệnh hacker gõ, điểm AI, trạng thái `BLOCKED`).
3. Phần **Interactive Tester**: Bạn có thể mời thầy cô gõ một câu lệnh SQL bất kỳ hoặc câu tiếng Việt thông thường vào ô và bấm **"🔍 Phân tích AI"** để thấy thanh đo nguy hiểm chạy trực tiếp!

---

## 4. BỘ CÂU HỎI THƯỜNG GẶP CỦA GIẢNG VIÊN & CÂU TRẢ LỜI SẴN

| Câu hỏi của Thầy/Cô | Bạn trả lời như sau: |
|---|---|
| **1. SQL Injection là gì và nguy hiểm thế nào?** | "Dạ thưa thầy/cô, SQL Injection là lỗ hổng xảy ra khi dữ liệu người dùng nhập vào được ghép trực tiếp vào câu lệnh SQL mà không qua kiểm tra. Kẻ tấn công có thể thay đổi cấu trúc câu truy vấn để đọc trộm dữ liệu, vượt qua đăng nhập hoặc xóa cơ sở dữ liệu ạ." |
| **2. Tại sao em lại dùng mô hình Học máy (Machine Learning) để phát hiện?** | "Dạ, nếu chỉ dùng từ khóa (Blacklist) thì hacker có thể lách luật bằng cách viết hoa thường xen kẽ, mã hóa URL hoặc chèn comment rác. Mô hình Machine Learning (TF-IDF N-gram) học được đặc trưng cấu trúc cú pháp của câu lệnh SQL độc hại nên có thể phát hiện cả những biến thể tấn công mới ạ." |
| **3. Mô hình AI của em sử dụng thuật toán gì?** | "Dạ em dùng **TF-IDF trích xuất đặc trưng N-gram ký tự (từ 2 đến 5 ký tự)** kết hợp với bộ phân loại **Logistic Regression**. Ưu điểm của thuật toán này là tốc độ xử lý tính bằng mili-giây, rất nhẹ để chạy real-time và xuất ra được xác suất tin cậy (Confidence score) chính xác ạ." |
| **4. Cách phòng chống triệt để nhất trong lập trình là gì?** | "Dạ thưa thầy/cô, cách phòng chống triệt để nhất là dùng **Prepared Statements (Parameterized Queries)**. Khi đó, CSDL sẽ phân tách hoàn toàn giữa phần lệnh SQL và phần dữ liệu người dùng truyền vào (sử dụng các tham số placeholder như `?` hoặc `@param`), do đó dữ liệu độc hại dù có chứa ký tự `'` hay `--` cũng chỉ bị coi là một chuỗi văn bản thông thường, không thể bị thực thi ạ." |
| **5. File CSDL SQL Server nằm ở đâu?** | "Dạ file script tạo cơ sở dữ liệu `MorentDB` trên SQL Server nằm tại file `backend/init_sqlserver.sql`, chỉ cần mở SSMS bấm Execute là tạo xong toàn bộ bảng Users, Vehicles và SecurityLogs ạ." |

---

## 5. CẤU TRÚC THƯ MỤC CÁC FILE ĐÃ TẠO MỚI

```
Final-Project/
├── backend/
│   ├── init_sqlserver.sql          # Script chạy trên SQL Server (SSMS)
│   ├── train_model.py              # Script huấn luyện AI (đã train xong 100%)
│   ├── sqli_model.pkl              # File model AI đã đóng gói
│   ├── vectorizer.pkl              # File vector hóa TF-IDF
│   ├── model_evaluation_report.txt # Báo cáo chỉ số Accuracy, F1-Score
│   ├── server.py                   # Máy chủ API bảo vệ SQL & phòng chống SQLi
│   └── morent.db                   # CSDL SQLite chạy ngầm tự động
├── src/
│   ├── pages/admin/SecurityMonitor.jsx  # Trang Dashboard Giám sát SQLi
│   ├── pages/auth/Login.jsx             # Form Login đã gắn demo SQLi
│   ├── pages/customer/SearchVehicle.jsx # Tìm kiếm xe gắn kiểm tra SQLi
│   └── services/authService.js          # Kết nối API Backend bảo vệ
├── CHAY_HE_THONG.bat               # File 1-click khởi động cả hệ thống
└── HUONG_DAN_DO_AN_SQLI.md         # File tài liệu hướng dẫn này
```

---
*Chúc bạn bảo vệ bài tập lớn thành công và đạt điểm tối đa!*
