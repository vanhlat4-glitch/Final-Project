import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

export default function AdminPromotionManagement() {
  const { items, loading, remove } = useApi(RESOURCES.PROMOTIONS);
  const { items: providers } = useApi(RESOURCES.PROVIDERS);

  const providerName = (id) => providers.find((p) => String(p.id) === String(id))?.name || "—";

  async function handleDelete(row) {
    if (confirm(`Gỡ chương trình khuyến mãi "${row.code}"?`)) await remove(row.id);
  }

  return (
    <DashboardLayout title="Quản lý khuyến mãi" subtitle="Theo dõi các chương trình khuyến mãi do nhà cung cấp tạo">
      <Table
        loading={loading}
        rows={items}
        emptyTitle="Chưa có chương trình khuyến mãi nào"
        columns={[
          { key: "code", label: "Mã", render: (r) => <span className="mono">{r.code}</span> },
          { key: "provider", label: "Nhà cung cấp", render: (r) => providerName(r.providerId) },
          { key: "discountPercent", label: "Giảm giá", render: (r) => <Badge tone="warning">-{r.discountPercent}%</Badge> },
          { key: "description", label: "Mô tả" },
          { key: "expiryDate", label: "Hết hạn", render: (r) => formatDate(r.expiryDate) },
        ]}
        renderActions={(row) => (
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>Gỡ bỏ</button>
        )}
      />
    </DashboardLayout>
  );
}
