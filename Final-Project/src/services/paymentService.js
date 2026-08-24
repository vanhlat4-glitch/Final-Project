import api, { RESOURCES } from "./api";

// Trong hệ thống này, mỗi đơn hàng đồng thời là một giao dịch thanh toán
// (trường paymentStatus / paymentMethod nằm ngay trên bản ghi order).
export async function listPayments() {
  const orders = await api.list(RESOURCES.ORDERS);
  return orders.map((o) => ({
    id: o.id,
    orderId: o.id,
    vehicleId: o.vehicleId,
    customerId: o.customerId,
    amount: o.totalPrice,
    method: o.paymentMethod || "card",
    status: o.paymentStatus || "unpaid",
    createdAt: o.createdAt,
  }));
}

export const markPaid = (orderId) => api.update(RESOURCES.ORDERS, orderId, { paymentStatus: "paid" });
export const markRefunded = (orderId) => api.update(RESOURCES.ORDERS, orderId, { paymentStatus: "refunded" });
