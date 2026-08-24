export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const ORDER_STATUS_LABEL = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  ongoing: "Đang thuê",
  completed: "Hoàn tất",
  cancelled: "Đã huỷ",
};

export const ORDER_STATUS_TONE = {
  pending: "warning",
  confirmed: "info",
  ongoing: "info",
  completed: "success",
  cancelled: "danger",
};

// Thứ tự tiến trình một đơn hàng đi qua (không tính "cancelled")
export const ORDER_STATUS_FLOW = ["pending", "confirmed", "ongoing", "completed"];
