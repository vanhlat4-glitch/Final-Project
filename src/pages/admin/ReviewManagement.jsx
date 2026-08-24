import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

export default function ReviewManagement() {
  const { items, loading, remove } = useApi(RESOURCES.REVIEWS);
  const { items: customers } = useApi(RESOURCES.CUSTOMERS);
  const { items: vehicles } = useApi(RESOURCES.VEHICLES);

  const customerName = (id) => customers.find((c) => String(c.id) === String(id))?.name || "Ẩn danh";
  const vehicleName = (id) => vehicles.find((v) => String(v.id) === String(id))?.name || "—";

  async function handleDelete(row) {
    if (confirm("Gỡ đánh giá này khỏi hệ thống?")) await remove(row.id);
  }

  return (
    <DashboardLayout title="Quản lý đánh giá" subtitle="Xem và kiểm duyệt đánh giá từ khách hàng về nhà cung cấp và xe">
      <Table
        loading={loading}
        rows={items}
        emptyTitle="Chưa có đánh giá nào"
        columns={[
          { key: "vehicle", label: "Xe", render: (r) => vehicleName(r.vehicleId) },
          { key: "customer", label: "Khách hàng", render: (r) => customerName(r.customerId) },
          { key: "rating", label: "Điểm", render: (r) => <span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span> },
          { key: "comment", label: "Nội dung" },
          { key: "createdAt", label: "Ngày gửi", render: (r) => formatDate(r.createdAt) },
        ]}
        renderActions={(row) => (
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>Gỡ bỏ</button>
        )}
      />
    </DashboardLayout>
  );
}
