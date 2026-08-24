// Dữ liệu mẫu để khởi tạo hệ thống lần đầu chạy (khi API/local rỗng)
export const seedProviders = [
  {
    id: "p1",
    name: "Hanoi Auto Rentals",
    email: "provider1@morent.vn",
    password: "123456",
    phone: "0901234567",
    status: "active",
    createdAt: "2026-01-10",
  },
  {
    id: "p2",
    name: "Saigon Wheels Co.",
    email: "provider2@morent.vn",
    password: "123456",
    phone: "0912345678",
    status: "active",
    createdAt: "2026-02-14",
  },
];

export const seedCustomers = [
  {
    id: "c1",
    name: "Nguyễn Việt Anh",
    email: "customer1@morent.vn",
    password: "123456",
    phone: "0987654321",
    address: "Thanh Xuân, Hà Nội",
    createdAt: "2026-03-01",
  },
];

export const seedVehicles = [
  {
    id: "v1",
    providerId: "p1",
    name: "Toyota Vios 2023",
    brand: "Toyota",
    type: "Sedan",
    seats: 5,
    transmission: "Số tự động",
    fuel: "Xăng",
    pricePerDay: 700000,
    image: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600",
    location: "Hà Nội",
    description: "Xe gia đình tiết kiệm xăng, phù hợp di chuyển trong thành phố.",
    status: "approved",
    rating: 4.6,
  },
  {
    id: "v2",
    providerId: "p1",
    name: "Honda CR-V 2022",
    brand: "Honda",
    type: "SUV",
    seats: 7,
    transmission: "Số tự động",
    fuel: "Xăng",
    pricePerDay: 1200000,
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600",
    location: "Hà Nội",
    description: "SUV 7 chỗ rộng rãi, phù hợp đi du lịch xa.",
    status: "approved",
    rating: 4.8,
  },
  {
    id: "v3",
    providerId: "p2",
    name: "Mazda 3 2023",
    brand: "Mazda",
    type: "Sedan",
    seats: 5,
    transmission: "Số tự động",
    fuel: "Xăng",
    pricePerDay: 800000,
    image: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600",
    location: "TP. Hồ Chí Minh",
    description: "Thiết kế thể thao, vận hành êm ái.",
    status: "pending",
    rating: 0,
  },
  {
    id: "v4",
    providerId: "p2",
    name: "VinFast VF8 2024",
    brand: "VinFast",
    type: "SUV điện",
    seats: 5,
    transmission: "Số tự động",
    fuel: "Điện",
    pricePerDay: 1500000,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600",
    location: "TP. Hồ Chí Minh",
    description: "SUV điện hiện đại, tiết kiệm chi phí nhiên liệu.",
    status: "approved",
    rating: 4.5,
  },
];

export const seedOrders = [
  {
    id: "o1",
    customerId: "c1",
    vehicleId: "v1",
    startDate: "2026-08-25",
    endDate: "2026-08-27",
    totalPrice: 1400000,
    status: "completed",
    paymentStatus: "paid",
    createdAt: "2026-08-15",
  },
];

export const seedPromotions = [
  {
    id: "pr1",
    providerId: "p1",
    code: "MORENT10",
    discountPercent: 10,
    description: "Giảm 10% cho đơn thuê từ 3 ngày trở lên",
    expiryDate: "2026-12-31",
  },
];

export const seedNotifications = [
  {
    id: "n1",
    audience: "provider",
    title: "Chào mừng đến với Morent",
    message: "Cảm ơn bạn đã tham gia làm nhà cung cấp xe trên hệ thống Morent.",
    createdAt: "2026-08-10",
  },
];

export const seedSupportTickets = [
  {
    id: "s1",
    fromRole: "customer",
    fromId: "c1",
    subject: "Không nhận được xác nhận đơn hàng",
    message: "Tôi đã đặt xe nhưng chưa thấy email xác nhận.",
    status: "open",
    reply: "",
    createdAt: "2026-08-16",
  },
];

export const seedStaff = [
  { id: "st1", name: "Admin gốc", email: "admin@morent.vn", permission: "full", createdAt: "2026-01-01" },
];

export const seedReviews = [
  {
    id: "r1",
    customerId: "c1",
    vehicleId: "v1",
    orderId: "o1",
    rating: 5,
    comment: "Xe sạch sẽ, chủ xe nhiệt tình. Sẽ thuê lại!",
    providerReply: "",
    createdAt: "2026-08-28",
  },
];
