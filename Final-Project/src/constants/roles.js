// Vai trò trong hệ thống
export const ROLES = {
  ADMIN: "admin",
  PROVIDER: "provider",
  CUSTOMER: "customer",
};

export const NAV_BY_ROLE = {
  admin: [
    { to: "/admin", label: "Tổng quan", end: true },
    { to: "/admin/providers", label: "Nhà cung cấp xe" },
    { to: "/admin/customers", label: "Khách hàng" },
    { to: "/admin/vehicles", label: "Danh sách xe" },
    { to: "/admin/vehicles/approval", label: "Kiểm duyệt xe" },
    { to: "/admin/orders", label: "Đơn hàng" },
    { to: "/admin/payments", label: "Thanh toán" },
    { to: "/admin/promotions", label: "Khuyến mãi" },
    { to: "/admin/reviews", label: "Đánh giá" },
    { to: "/admin/notifications", label: "Thông báo" },
    { to: "/admin/support", label: "Hỗ trợ" },
    { to: "/admin/finance", label: "Tài chính" },
    { to: "/admin/reports", label: "Báo cáo" },
    { to: "/admin/access-control", label: "Phân quyền" },
  ],
  provider: [
    { to: "/provider", label: "Tổng quan", end: true },
    { to: "/provider/post-car", label: "Đăng tin cho thuê" },
    { to: "/provider/cars", label: "Xe của tôi" },
    { to: "/provider/orders", label: "Đơn hàng" },
    { to: "/provider/payments", label: "Thanh toán" },
    { to: "/provider/promotions", label: "Khuyến mãi" },
    { to: "/provider/reviews", label: "Đánh giá" },
    { to: "/provider/support", label: "Hỗ trợ khách hàng" },
    { to: "/provider/finance", label: "Tài chính" },
    { to: "/provider/reports", label: "Báo cáo" },
  ],
  customer: [
    { to: "/customer", label: "Trang chủ", end: true },
    { to: "/customer/search", label: "Tìm xe" },
    { to: "/customer/orders", label: "Đơn của tôi" },
    { to: "/customer/reviews", label: "Đánh giá của tôi" },
    { to: "/customer/promotions", label: "Ưu đãi" },
    { to: "/customer/support", label: "Hỗ trợ" },
    { to: "/customer/profile", label: "Tài khoản" },
  ],
};

export const ROLE_LABEL = {
  admin: "Quản trị hệ thống",
  provider: "Nhà cung cấp xe",
  customer: "Khách hàng",
};
