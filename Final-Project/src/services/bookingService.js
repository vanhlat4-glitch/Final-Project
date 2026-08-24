import api, { RESOURCES } from "./api";
import { ORDER_STATUS_FLOW } from "../constants/orderStatus";

export const listOrders = () => api.list(RESOURCES.ORDERS);
export const createOrder = (data) => api.create(RESOURCES.ORDERS, data);
export const updateOrder = (id, data) => api.update(RESOURCES.ORDERS, id, data);

export function nextOrderStatus(currentStatus) {
  const idx = ORDER_STATUS_FLOW.indexOf(currentStatus);
  return idx >= 0 && idx < ORDER_STATUS_FLOW.length - 1 ? ORDER_STATUS_FLOW[idx + 1] : null;
}

export async function advanceOrder(order) {
  const next = nextOrderStatus(order.status);
  if (!next) return order;
  return api.update(RESOURCES.ORDERS, order.id, {
    status: next,
    ...(next === "completed" ? { paymentStatus: "paid" } : {}),
  });
}

export const cancelOrder = (id) => api.update(RESOURCES.ORDERS, id, { status: "cancelled" });
