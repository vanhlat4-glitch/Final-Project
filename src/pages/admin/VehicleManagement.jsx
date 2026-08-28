import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import FormFields from "../../components/ui/FormFields";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";
import { VEHICLE_STATUS, VEHICLE_STATUS_LABEL, VEHICLE_STATUS_TONE } from "../../constants/vehicleStatus";

const FIELDS = [
  { name: "name", label: "Tên xe", required: true },
  { row: [
    { name: "brand", label: "Hãng xe", required: true },
    { name: "type", label: "Loại xe", required: true },
  ] },
  { row: [
    { name: "pricePerHour", label: "Giá/giờ (₫)", type: "number", required: true },
    { name: "pricePerDay", label: "Giá/ngày (₫)", type: "number", required: true },
  ] },
  {
    name: "status",
    label: "Trạng thái xe",
    type: "select",
    required: true,
    options: [
      { value: VEHICLE_STATUS.APPROVED, label: "🟢 Đang cho thuê (Sẵn sàng)" },
      { value: VEHICLE_STATUS.MAINTENANCE, label: "🔧 Đang sửa chữa / Bảo trì" },
      { value: VEHICLE_STATUS.PAUSED, label: "⏸️ Tạm ngưng cho thuê" },
      { value: VEHICLE_STATUS.PENDING, label: "⏳ Chờ duyệt" },
      { value: VEHICLE_STATUS.REJECTED, label: "❌ Từ chối" },
    ],
  },
  { name: "location", label: "Khu vực" },
  { name: "description", label: "Mô tả", type: "textarea" },
];

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: VEHICLE_STATUS.APPROVED, label: "Đang cho thuê" },
  { key: VEHICLE_STATUS.MAINTENANCE, label: "Bảo trì" },
  { key: VEHICLE_STATUS.PAUSED, label: "Tạm ngưng" },
  { key: VEHICLE_STATUS.PENDING, label: "Chờ duyệt" },
  { key: VEHICLE_STATUS.REJECTED, label: "Từ chối" },
];

export default function VehicleManagement() {
  const { items, loading, update, remove } = useApi(RESOURCES.VEHICLES);
  const { items: providers } = useApi(RESOURCES.PROVIDERS);
  const [tab, setTab] = useState("all");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const providerName = (id) => providers.find((p) => String(p.id || p._id) === String(id))?.name || "—";

  const rows = useMemo(() => {
    if (tab === "all") return items;
    return items.filter((v) => v.status === tab);
  }, [items, tab]);

  async function handleSave() {
    setSaving(true);
    try {
      await update(modal.data.id || modal.data._id, modal.data);
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickStatus(row, newStatus) {
    await update(row.id || row._id, { status: newStatus });
  }

  async function handleDelete(row) {
    if (confirm(`Xoá xe "${row.name}" khỏi hệ thống?`)) await remove(row.id || row._id);
  }

  return (
    <DashboardLayout title="Danh sách xe" subtitle="Xem, chỉnh sửa trạng thái hoạt động/bảo trì và xoá xe của tất cả nhà cung cấp">
      <div className="section-head">
        <div>
          <h2>Toàn bộ xe trong hệ thống</h2>
          <p>{items.length} xe · cần duyệt xe mới? <Link to="/admin/vehicles/approval" className="link">Sang trang kiểm duyệt</Link></p>
        </div>
      </div>

      <div className="tabs mb-16">
        {TABS.map((t) => {
          const count = t.key === "all" ? items.length : items.filter((v) => v.status === t.key).length;
          return (
            <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <Table
        loading={loading}
        rows={rows}
        emptyTitle="Chưa có xe nào ở mục này"
        columns={[
          { key: "name", label: "Tên xe", render: (r) => <strong>{r.name}</strong> },
          { key: "brand", label: "Hãng", render: (r) => <span>{r.brand || "—"}</span> },
          { key: "provider", label: "Nhà cung cấp", render: (r) => providerName(r.providerId) },
          { key: "type", label: "Loại" },
          {
            key: "price",
            label: "Giá thuê",
            render: (r) => (
              <div>
                <span className="mono" style={{ color: "var(--signal-dark)", fontWeight: 600 }}>{formatVND(r.pricePerHour || Math.round(r.pricePerDay / 9))}/h</span>
                <span className="text-muted text-sm"> · {formatVND(r.pricePerDay)}/ngày</span>
              </div>
            ),
          },
          {
            key: "status",
            label: "Trạng thái",
            render: (r) => (
              <Badge tone={VEHICLE_STATUS_TONE[r.status] || "neutral"}>
                {VEHICLE_STATUS_LABEL[r.status] || r.status}
              </Badge>
            ),
          },
        ]}
        renderActions={(row) => (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {row.status === VEHICLE_STATUS.APPROVED && (
              <button
                className="btn btn-outline btn-sm"
                title="Bảo trì sửa chữa"
                onClick={() => handleQuickStatus(row, VEHICLE_STATUS.MAINTENANCE)}
              >
                🔧 Bảo trì
              </button>
            )}
            {(row.status === VEHICLE_STATUS.MAINTENANCE || row.status === VEHICLE_STATUS.PAUSED) && (
              <button
                className="btn btn-signal btn-sm"
                title="Mở cho thuê"
                onClick={() => handleQuickStatus(row, VEHICLE_STATUS.APPROVED)}
              >
                🟢 Mở thuê
              </button>
            )}
            <button className="btn btn-outline btn-sm" onClick={() => setModal({ data: row })}>Sửa</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>Xoá</button>
          </div>
        )}
      />

      <Modal
        open={!!modal}
        title="Chỉnh sửa thông tin và trạng thái xe"
        onClose={() => setModal(null)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
            <button className="btn btn-signal" disabled={saving} onClick={handleSave}>{saving ? "Đang lưu..." : "Lưu"}</button>
          </>
        }
      >
        {modal && <FormFields fields={FIELDS} values={modal.data} onChange={(data) => setModal({ data })} />}
      </Modal>
    </DashboardLayout>
  );
}

