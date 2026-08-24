# Morent — Hệ thống cho thuê xe ô tô

Web app React (Vite) cho hệ thống "Car rent Morent" — 3 vai trò Admin / Nhà cung cấp xe /
Khách hàng, dựng đúng theo sơ đồ cấu trúc thư mục bạn gửi.

## 1. Chạy dự án

```bash
npm install
npm run dev
```

Mở `http://localhost:5173`.

## 2. Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | admin@morent.vn | admin123 |
| Nhà cung cấp | provider1@morent.vn | 123456 |
| Khách hàng | customer1@morent.vn | 123456 |

Có thể bấm **Đăng ký** để tạo tài khoản Khách hàng / Nhà cung cấp mới.

## 3. Kết nối API — đọc trước khi demo

`src/services/api.js` được cấu hình sẵn để gọi tới:

```
BASE_URL = https://mindx-mockup-server.vercel.app
API_KEY  = 6a8304e926e7101a09135205
```

theo quy ước REST phổ biến của mock-server: `GET/POST/PUT/DELETE /api/{apiKey}/{resource}`.

**Mình không mở được trang `/database` của bạn** (môi trường sandbox của mình không có quyền
truy cập domain `vercel.app`), nên **chưa xác nhận được chính xác** tên bảng / đường dẫn thật
server của bạn dùng. Vì vậy `api.js` có cơ chế tự vệ: nếu gọi API thật thất bại (sai endpoint,
chưa tạo bảng, lỗi CORS...), app **tự động chuyển sang lưu localStorage** (đã seed sẵn dữ liệu
mẫu) để bạn luôn demo được đầy đủ chức năng. Trạng thái kết nối hiện ở cuối sidebar:

- 🟢 API kết nối trực tiếp — đang đọc/ghi server thật.
- 🟡 Chế độ offline (local) — đang dùng dữ liệu cục bộ trên trình duyệt.

**Để nối đúng API thật:** mở `src/services/api.js`, sửa hàm `buildUrl()` và object `RESOURCES`
cho khớp với server thật của bạn. Toàn bộ trang khác đều gọi qua `useApi(resource)` hoặc các
service trong `src/services/`, nên sửa 1 chỗ là dùng được toàn app.

## 4. Cấu trúc thư mục

```
src/
├── assets/
├── components/
│   ├── common/    Header, Sidebar, Loading, ProtectedRoute, DashboardLayout
│   └── ui/         Button, Card, Modal, Table, Input, Badge (+ FormFields, EmptyState, StatCard hỗ trợ)
├── constants/      roles.js, orderStatus.js, vehicleStatus.js, paymentStatus.js
├── context/        AuthContext.jsx — giữ state phiên đăng nhập
├── hooks/          useAuth.js, useApi.js
├── pages/
│   ├── auth/       Login, Register
│   ├── admin/      Dashboard, ProviderManagement, CustomerManagement, VehicleManagement,
│   │                VehicleApproval, OrderManagement, PaymentManagement, ReviewManagement,
│   │                PromotionManagement, NotificationManagement, SupportManagement,
│   │                FinancialManagement, Report, AccessControl
│   ├── provider/   Dashboard, PostCar, CarList, ProviderOrders, ProviderPayments,
│   │                ProviderReviews, ProviderPromotions, ProviderSupport, ProviderReport,
│   │                ProviderFinance
│   └── customer/   Home, SearchVehicle, VehicleDetail, Booking, Payment, OrderHistory,
│                    OrderDetail, Review, Profile, Support, Promotion, VehicleTracking
├── services/       api.js (lớp gọi API gốc + fallback), authService, vehicleService,
│                    bookingService, paymentService, userService, seedData
├── utils/          formatCurrency.js, formatDate.js, validation.js
├── App.jsx, index.css, main.jsx
```

## 5. Luồng đặt xe (Customer)

`Home` → `SearchVehicle` (lọc/tìm) → `VehicleDetail` (xem chi tiết) → `Booking` (chọn ngày +
mã khuyến mãi) → `Payment` (chọn phương thức, xác nhận) → `OrderDetail` (huỷ đơn / theo dõi /
đánh giá) → `VehicleTracking` (theo dõi tiến trình thuê xe theo từng bước trạng thái).

## 6. Giao diện

Theme "đường & biển số xe": nền tối kiểu nhựa đường cho sidebar, điểm nhấn vàng tín hiệu (đèn
xi-nhan), vạch kẻ đường đứt nét làm dải phân cách, font Space Grotesk cho tiêu đề và IBM Plex
Mono cho số liệu/mã đơn.

## 7. Đã cài đặt đầy đủ

Toàn bộ các trang trong sơ đồ đều có dữ liệu thật (qua API/localStorage), CRUD hoạt động, và
build production (`npm run build`) đã chạy sạch không lỗi.
