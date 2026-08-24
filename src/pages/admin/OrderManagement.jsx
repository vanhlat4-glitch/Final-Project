import { useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ORDER_STATUS_LABEL, ORDER_STATUS_FLOW } from "../../constants/orderStatus";
import { PAYMENT_STATUS_LABEL } from "../../constants/paymentStatus";

const STATUS_TONE = { pending: "warning", confirmed: "info", ongoing: "info", completed: "success", cancelled: "danger" };

export default function OrderManagement() {
  const { items, loading, update } = useApi(RESOURCES.ORDERS);
  const { items: customers } = useApi(RESOURCES.CUSTOMERS);
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);
  const [statusFilter, setStatusFilter] = useState("all");

  const customerName = (id) => customers.find((c) => String(c.id) === String(id))?.name || "—";
  const vehicleName = (id) => vehicles.find((v) => String(v.id) === String(id))?.name || "—";

  const rows = useMemo(
    () => (statusFilter === "all" ? items : items.filter((o) => o.status === statusFilter)),
    [items, statusFilter]
  );

  async function advance(row) {
    const idx = ORDER_STATUS_FLOW.indexOf(row.status);
    const next = ORDER_STATUS_FLOW[idx + 1];
    if (!next) return;
    await update(row.id, { status: next, ...(next === "completed" ? { paymentStatus: "paid" } : {}) });
  }

  async function cancelOrder(row) {
    if (confirm("Huỷ đơn hàng này?")) await update(row.id, { status: "cancelled" });
  }

  return (
    <DashboardLayout title="Quản lý đơn hàng" subtitle="Xem và xử lý các đơn hàng thuê xe từ khách hàng">
      <div className="filters-bar">
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {Object.entries(ORDER_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      <Table
        loading={loading}
        rows={rows}
        emptyTitle="Không có đơn hàng nào"
        columns={[
          { key: "id", label: "Mã đơn", render: (r) => <span className="mono">#{String(r.id).slice(-6)}</span> },
          { key: "customer", label: "Khách hàng", render: (r) => customerName(r.customerId) },
          { key: "vehicle", label: "Xe", render: (r) => vehicleName(r.vehicleId) },
          { key: "period", label: "Thời gian thuê", render: (r) => `${formatDate(r.startDate)} → ${formatDate(r.endDate)}` },
          { key: "totalPrice", label: "Tổng tiền", render: (r) => <span className="mono">{formatVND(r.totalPrice)}</span> },
          { key: "paymentStatus", label: "Thanh toán", render: (r) => <Badge tone={r.paymentStatus === "paid" ? "success" : "neutral"}>{PAYMENT_STATUS_LABEL[r.paymentStatus] || "—"}</Badge> },
          { key: "status", label: "Trạng thái", render: (r) => <Badge tone={STATUS_TONE[r.status]}>{ORDER_STATUS_LABEL[r.status]}</Badge> },
        ]}
        renderActions={(row) => (
          <>
            {ORDER_STATUS_FLOW.indexOf(row.status) < ORDER_STATUS_FLOW.length - 1 && row.status !== "cancelled" && (
              <button className="btn btn-signal btn-sm" onClick={() => advance(row)}>
                → {ORDER_STATUS_LABEL[ORDER_STATUS_FLOW[ORDER_STATUS_FLOW.indexOf(row.status) + 1]]}
              </button>
            )}
            {row.status !== "completed" && row.status !== "cancelled" && (
              <button className="btn btn-danger btn-sm" onClick={() => cancelOrder(row)}>Huỷ</button>
            )}
          </>
        )}
      />
    </DashboardLayout>
  );
}
