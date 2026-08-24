import { useMemo } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import Table from "../../components/ui/Table";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatVND } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const COMMISSION_RATE = 0.1;

export default function ProviderFinance() {
  const { user } = useAuth();
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);
  const { items: orders, loading } = useApi(RESOURCES.ORDERS);

  const myVehicleIds = useMemo(() => vehicles.filter((v) => String(v.providerId) === String(user.id)).map((v) => v.id), [vehicles, user.id]);
  const paidOrders = useMemo(
    () => orders.filter((o) => myVehicleIds.includes(o.vehicleId) && o.paymentStatus === "paid"),
    [orders, myVehicleIds]
  );

  const vehicleName = (id) => vehicles.find((v) => String(v.id) === String(id))?.name || "—";

  const gross = paidOrders.reduce((s, o) => s + Number(o.totalPrice || 0), 0);
  const commission = Math.round(gross * COMMISSION_RATE);
  const net = gross - commission;

  return (
    <DashboardLayout title="Tài chính" subtitle="Theo dõi và quản lý tài chính của bạn trên Morent">
      <div className="grid grid-3 mb-16">
        <StatCard label="Doanh thu gộp" value={formatVND(gross)} hint={`${paidOrders.length} đơn đã thanh toán`} />
        <StatCard label={`Phí nền tảng (${COMMISSION_RATE * 100}%)`} value={formatVND(commission)} />
        <StatCard label="Thực nhận" value={formatVND(net)} />
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, marginBottom: 14 }}>Chi tiết giao dịch</h3>
        <Table
          loading={loading}
          rows={paidOrders}
          emptyTitle="Chưa có giao dịch nào"
          columns={[
            { key: "id", label: "Mã đơn", render: (r) => <span className="mono">#{String(r.id).slice(-6)}</span> },
            { key: "vehicle", label: "Xe", render: (r) => vehicleName(r.vehicleId) },
            { key: "totalPrice", label: "Số tiền", render: (r) => <span className="mono">{formatVND(r.totalPrice)}</span> },
            { key: "createdAt", label: "Ngày", render: (r) => formatDate(r.createdAt) },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
