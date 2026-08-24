import { useEffect, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { listPayments, markPaid, markRefunded } from "../../services/paymentService";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE, PAYMENT_METHODS } from "../../constants/paymentStatus";

export default function PaymentManagement() {
  const { items: customers } = useApi(RESOURCES.CUSTOMERS);
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setPayments(await listPayments());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const customerName = (id) => customers.find((c) => String(c.id) === String(id))?.name || "—";
  const vehicleName = (id) => vehicles.find((v) => String(v.id) === String(id))?.name || "—";
  const methodLabel = (v) => PAYMENT_METHODS.find((m) => m.value === v)?.label || v;

  async function handleMarkPaid(row) {
    await markPaid(row.orderId);
    load();
  }
  async function handleRefund(row) {
    if (confirm("Xác nhận hoàn tiền cho giao dịch này?")) {
      await markRefunded(row.orderId);
      load();
    }
  }

  return (
    <DashboardLayout title="Quản lý thanh toán" subtitle="Theo dõi và xử lý các giao dịch thanh toán trong hệ thống">
      <Table
        loading={loading}
        rows={payments}
        emptyTitle="Chưa có giao dịch nào"
        columns={[
          { key: "id", label: "Mã đơn", render: (r) => <span className="mono">#{String(r.orderId).slice(-6)}</span> },
          { key: "customer", label: "Khách hàng", render: (r) => customerName(r.customerId) },
          { key: "vehicle", label: "Xe", render: (r) => vehicleName(r.vehicleId) },
          { key: "amount", label: "Số tiền", render: (r) => <span className="mono">{formatVND(r.amount)}</span> },
          { key: "method", label: "Phương thức", render: (r) => methodLabel(r.method) },
          { key: "status", label: "Trạng thái", render: (r) => <Badge tone={PAYMENT_STATUS_TONE[r.status]}>{PAYMENT_STATUS_LABEL[r.status]}</Badge> },
          { key: "createdAt", label: "Ngày tạo", render: (r) => formatDate(r.createdAt) },
        ]}
        renderActions={(row) => (
          <>
            {row.status === "unpaid" && (
              <button className="btn btn-signal btn-sm" onClick={() => handleMarkPaid(row)}>Đánh dấu đã trả</button>
            )}
            {row.status === "paid" && (
              <button className="btn btn-outline btn-sm" onClick={() => handleRefund(row)}>Hoàn tiền</button>
            )}
          </>
        )}
      />
    </DashboardLayout>
  );
}
