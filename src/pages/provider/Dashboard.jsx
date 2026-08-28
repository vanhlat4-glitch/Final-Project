import { useMemo } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import Badge from "../../components/ui/Badge";
import Loading from "../../components/common/Loading";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatVND } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ORDER_STATUS_LABEL } from "../../constants/orderStatus";
import { VEHICLE_STATUS_LABEL, VEHICLE_STATUS_TONE } from "../../constants/vehicleStatus";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const { items: vehicles, loading: l1 } = useApi(RESOURCES.VEHICLES);
  const { items: orders, loading: l2 } = useApi(RESOURCES.ORDERS);
  const loading = l1 || l2;

  const myVehicles = useMemo(() => vehicles.filter((v) => String(v.providerId) === String(user.id)), [vehicles, user.id]);
  const myVehicleIds = myVehicles.map((v) => v.id);
  const myOrders = useMemo(() => orders.filter((o) => myVehicleIds.includes(o.vehicleId)), [orders, myVehicleIds]);
  const revenue = myOrders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + Number(o.totalPrice || 0), 0);
  const pending = myVehicles.filter((v) => v.status === "pending").length;

  return (
    <DashboardLayout title={`Chào ${user.name}`} subtitle="Tổng quan hoạt động cho thuê xe của bạn">
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-4 mb-16">
            <StatCard label="Xe đang đăng" value={myVehicles.length} hint={`${pending} xe chờ duyệt`} />
            <StatCard label="Tổng đơn hàng" value={myOrders.length} />
            <StatCard label="Doanh thu" value={formatVND(revenue)} hint="đơn đã thanh toán" />
            <StatCard label="Đánh giá TB" value={(myVehicles.reduce((s, v) => s + (v.rating || 0), 0) / (myVehicles.length || 1)).toFixed(1)} />
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h2 style={{ fontSize: 16, marginBottom: 14 }}>Xe mới nhất</h2>
              {myVehicles.length === 0 ? (
                <p className="text-muted text-sm">Bạn chưa đăng xe nào.</p>
              ) : (
                myVehicles.slice(0, 4).map((v) => (
                  <div key={v.id} className="flex-between" style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{v.name}</div>
                      <div className="text-muted text-sm mono">{formatVND(v.pricePerDay)}/ngày</div>
                    </div>
                    <Badge tone={VEHICLE_STATUS_TONE[v.status] || "neutral"}>
                      {VEHICLE_STATUS_LABEL[v.status] || v.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>

            <div className="card">
              <h2 style={{ fontSize: 16, marginBottom: 14 }}>Đơn hàng gần đây</h2>
              {myOrders.length === 0 ? (
                <p className="text-muted text-sm">Chưa có đơn hàng nào.</p>
              ) : (
                myOrders.slice(0, 4).map((o) => (
                  <div key={o.id} className="flex-between" style={{ padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }} className="mono">#{String(o.id).slice(-6)}</div>
                      <div className="text-muted text-sm">{formatDate(o.startDate)} → {formatDate(o.endDate)}</div>
                    </div>
                    <Badge tone={o.status === "completed" ? "success" : "warning"}>{ORDER_STATUS_LABEL[o.status]}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
