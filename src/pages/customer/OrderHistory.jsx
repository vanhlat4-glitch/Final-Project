import { useMemo } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Loading from "../../components/common/Loading";
import EmptyState from "../../components/ui/EmptyState";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { useLanguage } from "../../hooks/useLanguage";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatVND } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "../../constants/orderStatus";

export default function OrderHistory() {
  const { user } = useAuth();
  const { t, isEn } = useLanguage();
  const { items: orders, loading } = useApi(RESOURCES.ORDERS);
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);

  const myOrders = useMemo(() => orders.filter((o) => String(o.customerId) === String(user.id)), [orders, user.id]);
  const vehicleName = (id) => vehicles.find((v) => String(v.id) === String(id))?.name || "—";
  const vehicleImage = (id) => vehicles.find((v) => String(v.id) === String(id))?.image;

  return (
    <DashboardLayout
      title={t("Đơn của tôi", "My Orders")}
      subtitle={t("Danh sách và trạng thái các đơn thuê xe đã đặt", "List and status of your rental bookings")}
    >
      {loading ? (
        <Loading />
      ) : myOrders.length === 0 ? (
        <EmptyState
          title={isEn ? "You have no rental orders yet" : "Bạn chưa có đơn thuê nào"}
          hint={isEn ? "Find and book a car to get started." : "Tìm và đặt một chiếc xe để bắt đầu."}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {myOrders.map((o) => (
            <Link to={`/customer/orders/${o.id}`} key={o.id} className="card" style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <img src={vehicleImage(o.vehicleId)} alt="" style={{ width: 72, height: 54, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="flex-between">
                  <strong>{vehicleName(o.vehicleId)}</strong>
                  <Badge tone={ORDER_STATUS_TONE[o.status]}>{t(ORDER_STATUS_LABEL[o.status])}</Badge>
                </div>
                <div className="flex-between text-sm mt-8">
                  <span className="text-muted">{formatDate(o.startDate)} → {formatDate(o.endDate)} · <span className="mono">#{String(o.id).slice(-6)}</span></span>
                  <span className="mono">{formatVND(o.totalPrice)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
