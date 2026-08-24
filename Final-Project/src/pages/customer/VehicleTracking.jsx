import { Link, useParams } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatDate } from "../../utils/formatDate";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABEL } from "../../constants/orderStatus";

const STEP_HINT = {
  pending: "Đơn hàng của bạn đang chờ nhà cung cấp xác nhận.",
  confirmed: "Nhà cung cấp đã xác nhận. Xe đang được chuẩn bị để bàn giao.",
  ongoing: "Bạn đang trong thời gian thuê xe. Chúc bạn có chuyến đi an toàn!",
  completed: "Chuyến thuê đã hoàn tất. Cảm ơn bạn đã sử dụng Morent.",
};

export default function VehicleTracking() {
  const { id } = useParams();
  const { items: orders, loading } = useApi(RESOURCES.ORDERS);
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);

  const order = orders.find((o) => String(o.id) === String(id));
  const vehicle = order ? vehicles.find((v) => String(v.id) === String(order.vehicleId)) : null;

  if (loading) {
    return (
      <DashboardLayout title="Theo dõi tình trạng xe">
        <Loading />
      </DashboardLayout>
    );
  }

  if (!order || !vehicle) {
    return (
      <DashboardLayout title="Không tìm thấy đơn hàng">
        <Link to="/customer/orders" className="link">← Quay lại danh sách đơn</Link>
      </DashboardLayout>
    );
  }

  const currentIdx = order.status === "cancelled" ? -1 : ORDER_STATUS_FLOW.indexOf(order.status);

  return (
    <DashboardLayout title="Theo dõi tình trạng xe" subtitle={`${vehicle.name} · #${String(order.id).slice(-6)}`}>
      <Link to={`/customer/orders/${order.id}`} className="link text-sm">← Quay lại chi tiết đơn</Link>

      <div className="card mt-16" style={{ maxWidth: 620 }}>
        {order.status === "cancelled" ? (
          <p className="text-sm">Đơn hàng này đã bị huỷ.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {ORDER_STATUS_FLOW.map((step, idx) => {
              const done = idx <= currentIdx;
              const active = idx === currentIdx;
              return (
                <div key={step} style={{ display: "flex", gap: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: done ? "var(--signal)" : "var(--paper)",
                        border: `2px solid ${done ? "var(--signal)" : "var(--line)"}`,
                        flexShrink: 0,
                      }}
                    />
                    {idx < ORDER_STATUS_FLOW.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 36, background: idx < currentIdx ? "var(--signal)" : "var(--line)" }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: 28 }}>
                    <div style={{ fontWeight: active ? 700 : 600, fontSize: 14 }}>{ORDER_STATUS_LABEL[step]}</div>
                    {active && <p className="text-muted text-sm mt-8">{STEP_HINT[step]}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="lane-divider mb-16" style={{ opacity: 0.4 }} />
        <div className="text-sm text-muted">
          Thời gian thuê: {formatDate(order.startDate)} → {formatDate(order.endDate)}
        </div>
      </div>
    </DashboardLayout>
  );
}
