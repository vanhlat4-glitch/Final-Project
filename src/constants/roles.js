// Vai trò trong hệ thống
export const ROLES = {
  ADMIN: "admin",
  PROVIDER: "provider",
  CUSTOMER: "customer",
};

export const NAV_BY_ROLE = {
  admin: [
    { to: "/admin", key: "nav_admin_overview", label: "Tổng quan", icon: "dashboard", end: true },
    { to: "/admin/providers", key: "nav_admin_providers", label: "Nhà cung cấp xe", icon: "store" },
    { to: "/admin/customers", key: "nav_admin_customers", label: "Khách hàng", icon: "users" },
    { to: "/admin/vehicles", key: "nav_admin_vehicles", label: "Danh sách xe", icon: "car" },
    { to: "/admin/vehicles/approval", key: "nav_admin_approval", label: "Kiểm duyệt xe", icon: "shield_check" },
    { to: "/admin/orders", key: "nav_admin_orders", label: "Đơn hàng", icon: "clipboard" },
    { to: "/admin/payments", key: "nav_admin_payments", label: "Thanh toán", icon: "credit_card" },
    { to: "/admin/promotions", key: "nav_admin_promotions", label: "Khuyến mãi", icon: "ticket" },
    { to: "/admin/reviews", key: "nav_admin_reviews", label: "Đánh giá", icon: "star" },
    { to: "/admin/notifications", key: "nav_admin_notifications", label: "Thông báo", icon: "bell" },
    { to: "/admin/support", key: "nav_admin_support", label: "Hỗ trợ", icon: "help_circle" },
    { to: "/admin/finance", key: "nav_admin_finance", label: "Tài chính", icon: "trending_up" },
    { to: "/admin/reports", key: "nav_admin_reports", label: "Báo cáo", icon: "bar_chart" },
    { to: "/admin/access-control", key: "nav_admin_access", label: "Phân quyền", icon: "key" },
  ],
  provider: [
    { to: "/provider", key: "nav_provider_overview", label: "Tổng quan", icon: "dashboard", end: true },
    { to: "/provider/post-car", key: "nav_provider_post_car", label: "Đăng tin cho thuê", icon: "plus_circle" },
    { to: "/provider/cars", key: "nav_provider_cars", label: "Xe của tôi", icon: "car" },
    { to: "/provider/orders", key: "nav_provider_orders", label: "Đơn hàng", icon: "clipboard" },
    { to: "/provider/payments", key: "nav_provider_payments", label: "Thanh toán", icon: "credit_card" },
    { to: "/provider/promotions", key: "nav_provider_promotions", label: "Khuyến mãi", icon: "ticket" },
    { to: "/provider/reviews", key: "nav_provider_reviews", label: "Đánh giá", icon: "star" },
    { to: "/provider/support", key: "nav_provider_support", label: "Hỗ trợ khách hàng", icon: "help_circle" },
    { to: "/provider/finance", key: "nav_provider_finance", label: "Tài chính", icon: "trending_up" },
    { to: "/provider/reports", key: "nav_provider_reports", label: "Báo cáo", icon: "bar_chart" },
  ],
  customer: [
    { to: "/customer", key: "nav_customer_home", label: "Trang chủ", icon: "home", end: true },
    { to: "/customer/search", key: "nav_customer_search", label: "Tìm xe", icon: "search" },
    { to: "/customer/orders", key: "nav_customer_orders", label: "Đơn của tôi", icon: "calendar" },
    { to: "/customer/reviews", key: "nav_customer_reviews", label: "Đánh giá của tôi", icon: "star" },
    { to: "/customer/promotions", key: "nav_customer_promotions", label: "Ưu đãi", icon: "ticket" },
    { to: "/customer/support", key: "nav_customer_support", label: "Hỗ trợ", icon: "help_circle" },
    { to: "/customer/profile", key: "nav_customer_profile", label: "Tài khoản", icon: "user" },
  ],
};

export const ROLE_LABEL = {
  admin: "Quản trị hệ thống",
  provider: "Nhà cung cấp xe",
  customer: "Khách hàng",
};
