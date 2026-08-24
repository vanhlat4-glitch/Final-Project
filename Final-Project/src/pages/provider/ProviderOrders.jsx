import { useMemo } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatVND } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { ORDER_STATUS_LABEL, ORDER_STATUS_FLOW } from "../../constants/orderStatus";

const STATUS_TONE = { pending: "warning", confirmed: "info", ongoing: "info", completed: "success", cancelled: "danger" };

export default function ProviderOrders() {
  const { user } = useAuth();
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);
  const { items: orders, loading, update } = useApi(RESOURCES.ORDERS);
  const { items: customers } = useApi(RESOURCES.CUSTOMERS);

  const myVehicleIds = useMemo(() => vehicles.filter((v) => String(v.providerId) === String(user.id)).map((v) => v.id), [vehicles, user.id]);
  const myOrders = useMemo(() => orders.filter((o) => myVehicleIds.includes(o.vehicleId)), [orders, myVehicleIds]);

  const vehicleName = (id) => vehicles.find((v) => String(v.id) === String(id))?.name || "—";
  const customerName = (id) => customers.find((c) => String(c.id) === String(id))?.name || "—";

  async function advance(row) {
    const idx = ORDER_STATUS_FLOW.indexOf(row.status);
    const next = ORDER_STATUS_FLOW[idx + 1];
    if (!next) return;
    await update(row.id, { status: next, ...(next === "completed" ? { paymentStatus: "paid" } : {}) });
  }

  return (
    <DashboardLayout title="Đơn hàng" subtitle="Xử lý các đơn hàng thuê xe từ khách hàng cho xe của bạn">
      <Table
        loading={loading}
        rows={myOrders}
        emptyTitle="Chưa có đơn hàng nào"
        columns={[
          { key: "id", label: "Mã đơn", render: (r) => <span className="mono">#{String(r.id).slice(-6)}</span> },
          { key: "vehicle", label: "Xe", render: (r) => vehicleName(r.vehicleId) },
          { key: "customer", label: "Khách hàng", render: (r) => customerName(r.customerId) },
          { key: "period", label: "Thời gian", render: (r) => `${formatDate(r.startDate)} → ${formatDate(r.endDate)}` },
          { key: "totalPrice", label: "Tổng tiền", render: (r) => <span className="mono">{formatVND(r.totalPrice)}</span> },
          { key: "status", label: "Trạng thái", render: (r) => <Badge tone={STATUS_TONE[r.status]}>{ORDER_STATUS_LABEL[r.status]}</Badge> },
        ]}
        renderActions={(row) =>
          ORDER_STATUS_FLOW.indexOf(row.status) < ORDER_STATUS_FLOW.length - 1 && row.status !== "cancelled" ? (
            <button className="btn btn-signal btn-sm" onClick={() => advance(row)}>
              → {ORDER_STATUS_LABEL[ORDER_STATUS_FLOW[ORDER_STATUS_FLOW.indexOf(row.status) + 1]]}
            </button>
          ) : (
            <span className="text-muted text-sm">—</span>
          )
        }
      />
    </DashboardLayout>
  );
}
