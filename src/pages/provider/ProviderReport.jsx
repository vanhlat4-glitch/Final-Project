import { useMemo } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import Table from "../../components/ui/Table";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatVND } from "../../utils/formatCurrency";

export default function ProviderReport() {
  const { user } = useAuth();
  const { items: vehicles, loading } = useApi(RESOURCES.VEHICLES);
  const { items: orders } = useApi(RESOURCES.ORDERS);

  const myVehicles = useMemo(() => vehicles.filter((v) => String(v.providerId) === String(user.id)), [vehicles, user.id]);

  const rows = useMemo(
    () =>
      myVehicles.map((v) => {
        const vOrders = orders.filter((o) => o.vehicleId === v.id);
        const paid = vOrders.filter((o) => o.paymentStatus === "paid");
        return {
          id: v.id,
          name: v.name,
          totalOrders: vOrders.length,
          completedOrders: vOrders.filter((o) => o.status === "completed").length,
          revenue: paid.reduce((s, o) => s + Number(o.totalPrice || 0), 0),
        };
      }),
    [myVehicles, orders]
  );

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = rows.reduce((s, r) => s + r.totalOrders, 0);

  return (
    <DashboardLayout title="Báo cáo" subtitle="Doanh số, đơn hàng và hiệu quả kinh doanh theo từng xe">
      <div className="grid grid-3 mb-16">
        <StatCard label="Tổng doanh thu" value={formatVND(totalRevenue)} />
        <StatCard label="Tổng đơn hàng" value={totalOrders} />
        <StatCard label="Số xe đang kinh doanh" value={myVehicles.length} />
      </div>

      <Table
        loading={loading}
        rows={rows}
        emptyTitle="Chưa có dữ liệu báo cáo"
        columns={[
          { key: "name", label: "Xe", render: (r) => <strong>{r.name}</strong> },
          { key: "totalOrders", label: "Tổng đơn" },
          { key: "completedOrders", label: "Đã hoàn tất" },
          { key: "revenue", label: "Doanh thu", render: (r) => <span className="mono">{formatVND(r.revenue)}</span> },
        ]}
      />
    </DashboardLayout>
  );
}
