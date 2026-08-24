import { useMemo } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import StatCard from "../../components/ui/StatCard";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";

const COMMISSION_RATE = 0.1; // hoa hồng hệ thống thu trên mỗi đơn đã thanh toán

export default function FinancialManagement() {
  const { items: orders, loading } = useApi(RESOURCES.ORDERS);
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);

  const vehicleName = (id) => vehicles.find((v) => String(v.id) === String(id))?.name || "—";

  const paidOrders = useMemo(() => orders.filter((o) => o.paymentStatus === "paid"), [orders]);
  const refunded = useMemo(() => orders.filter((o) => o.paymentStatus === "refunded"), [orders]);
  const grossRevenue = paidOrders.reduce((s, o) => s + Number(o.totalPrice || 0), 0);
  const platformCommission = Math.round(grossRevenue * COMMISSION_RATE);
  const providerPayout = grossRevenue - platformCommission;
  const refundedAmount = refunded.reduce((s, o) => s + Number(o.totalPrice || 0), 0);

  return (
    <DashboardLayout title="Quản lý tài chính" subtitle="Theo dõi doanh thu, hoa hồng và chi phí của toàn hệ thống">
      <div className="grid grid-4 mb-16">
        <StatCard label="Doanh thu gộp" value={formatVND(grossRevenue)} hint={`${paidOrders.length} đơn đã thanh toán`} />
        <StatCard label={`Hoa hồng hệ thống (${COMMISSION_RATE * 100}%)`} value={formatVND(platformCommission)} />
        <StatCard label="Trả cho nhà cung cấp" value={formatVND(providerPayout)} />
        <StatCard label="Đã hoàn tiền" value={formatVND(refundedAmount)} hint={`${refunded.length} giao dịch`} />
      </div>

      <div className="card">
        <div className="section-head">
          <div>
            <h2>Sổ giao dịch</h2>
            <p>Toàn bộ đơn hàng đã thanh toán hoặc hoàn tiền</p>
          </div>
        </div>
        <Table
          loading={loading}
          rows={[...paidOrders, ...refunded]}
          emptyTitle="Chưa có giao dịch tài chính nào"
          columns={[
            { key: "id", label: "Mã đơn", render: (r) => <span className="mono">#{String(r.id).slice(-6)}</span> },
            { key: "vehicle", label: "Xe", render: (r) => vehicleName(r.vehicleId) },
            { key: "totalPrice", label: "Số tiền", render: (r) => <span className="mono">{formatVND(r.totalPrice)}</span> },
            { key: "paymentStatus", label: "Loại", render: (r) => <Badge tone={r.paymentStatus === "paid" ? "success" : "warning"}>{r.paymentStatus === "paid" ? "Doanh thu" : "Hoàn tiền"}</Badge> },
            { key: "createdAt", label: "Ngày", render: (r) => formatDate(r.createdAt) },
          ]}
        />
      </div>
    </DashboardLayout>
  );
}
