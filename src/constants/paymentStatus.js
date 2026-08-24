export const PAYMENT_STATUS = {
  UNPAID: "unpaid",
  PAID: "paid",
  REFUNDED: "refunded",
};

export const PAYMENT_STATUS_LABEL = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán",
  refunded: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_TONE = {
  unpaid: "neutral",
  paid: "success",
  refunded: "warning",
};

export const PAYMENT_METHODS = [
  { value: "card", label: "Thẻ tín dụng / ghi nợ" },
  { value: "wallet", label: "Ví điện tử" },
  { value: "cash", label: "Tiền mặt khi nhận xe" },
];
