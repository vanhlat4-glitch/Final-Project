import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { listPayments } from "../../services/paymentService";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatVND } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { PAYMENT_STATUS_LABEL, PAYMENT_STATUS_TONE } from "../../constants/paymentStatus";

export default function ProviderPayments() {
  const { user } = useAuth();
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);
  const { items: customers } = useApi(RESOURCES.CUSTOMERS);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listPayments().then((data) => {
      setPayments(data);
      setLoading(false);
    });
  }, []);

  const myVehicleIds = useMemo(() => vehicles.filter((v) => String(v.providerId) === String(user.id)).map((v) => v.id), [vehicles, user.id]);
  const myPayments = useMemo(() => payments.filter((p) => myVehicleIds.includes(p.vehicleId)), [payments, myVehicleIds]);

  const vehicleName = (id) => vehicles.find((v) => String(v.id) === String(id))?.name || "—";
  const customerName = (id) => customers.find((c) => String(c.id) === String(id))?.name || "—";

  return (
    <DashboardLayout title="Thanh toán" subtitle="Theo dõi và xử lý các giao dịch thanh toán cho xe của bạn">
      <Table
        loading={loading}
        rows={myPayments}
        emptyTitle="Chưa có giao dịch nào"
        columns={[
          { key: "id", label: "Mã đơn", render: (r) => <span className="mono">#{String(r.orderId).slice(-6)}</span> },
          { key: "vehicle", label: "Xe", render: (r) => vehicleName(r.vehicleId) },
          { key: "customer", label: "Khách hàng", render: (r) => customerName(r.customerId) },
          { key: "amount", label: "Số tiền", render: (r) => <span className="mono">{formatVND(r.amount)}</span> },
          { key: "status", label: "Trạng thái", render: (r) => <Badge tone={PAYMENT_STATUS_TONE[r.status]}>{PAYMENT_STATUS_LABEL[r.status]}</Badge> },
          { key: "createdAt", label: "Ngày", render: (r) => formatDate(r.createdAt) },
        ]}
      />
    </DashboardLayout>
  );
}
