import { useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";
import { VEHICLE_STATUS_LABEL } from "../../constants/vehicleStatus";

const TABS = [
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Đã duyệt" },
  { key: "rejected", label: "Từ chối" },
  { key: "all", label: "Tất cả" },
];

export default function VehicleApproval() {
  const { items, loading, update } = useApi(RESOURCES.VEHICLES);
  const { items: providers } = useApi(RESOURCES.PROVIDERS);
  const [tab, setTab] = useState("pending");
  const [preview, setPreview] = useState(null);

  const providerName = (id) => providers.find((p) => String(p.id) === String(id))?.name || "—";

  const rows = useMemo(() => (tab === "all" ? items : items.filter((v) => v.status === tab)), [items, tab]);

  async function setStatus(row, status) {
    await update(row.id, { status });
    setPreview(null);
  }

  return (
    <DashboardLayout title="Kiểm duyệt xe" subtitle="Xem chi tiết và kiểm duyệt các xe được đăng tin cho thuê">
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
            {t.label} {t.key !== "all" && `(${items.filter((v) => v.status === t.key).length})`}
          </button>
        ))}
      </div>

      <Table
        loading={loading}
        rows={rows}
        emptyTitle="Không có xe nào ở trạng thái này"
        columns={[
          { key: "name", label: "Tên xe", render: (r) => <strong>{r.name}</strong> },
          { key: "provider", label: "Nhà cung cấp", render: (r) => providerName(r.providerId) },
          { key: "type", label: "Loại xe" },
          { key: "pricePerDay", label: "Giá/ngày", render: (r) => <span className="mono">{formatVND(r.pricePerDay)}</span> },
          {
            key: "status",
            label: "Trạng thái",
            render: (r) => (
              <Badge tone={r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warning"}>
                {VEHICLE_STATUS_LABEL[r.status]}
              </Badge>
            ),
          },
        ]}
        renderActions={(row) => (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setPreview(row)}>Xem</button>
            {row.status !== "approved" && (
              <button className="btn btn-signal btn-sm" onClick={() => setStatus(row, "approved")}>Duyệt</button>
            )}
            {row.status !== "rejected" && (
              <button className="btn btn-danger btn-sm" onClick={() => setStatus(row, "rejected")}>Từ chối</button>
            )}
          </>
        )}
      />

      <Modal open={!!preview} title={preview?.name} onClose={() => setPreview(null)}>
        {preview && (
          <div>
            <img src={preview.image} alt={preview.name} style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 8, marginBottom: 14 }} />
            <div className="kpi-row mb-16">
              <div><strong>{preview.seats}</strong><span className="text-muted text-sm">Số chỗ</span></div>
              <div><strong>{preview.transmission}</strong><span className="text-muted text-sm">Hộp số</span></div>
              <div><strong>{preview.fuel}</strong><span className="text-muted text-sm">Nhiên liệu</span></div>
              <div><strong>{formatVND(preview.pricePerDay)}</strong><span className="text-muted text-sm">Giá/ngày</span></div>
            </div>
            <p className="text-sm">{preview.description}</p>
            <div className="flex gap-8 mt-16">
              <button className="btn btn-signal" onClick={() => setStatus(preview, "approved")}>Duyệt xe này</button>
              <button className="btn btn-danger" onClick={() => setStatus(preview, "rejected")}>Từ chối</button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
