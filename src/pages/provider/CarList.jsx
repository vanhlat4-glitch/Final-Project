import { useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import FormFields from "../../components/ui/FormFields";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatVND } from "../../utils/formatCurrency";
import { VEHICLE_STATUS, VEHICLE_STATUS_LABEL, VEHICLE_STATUS_TONE } from "../../constants/vehicleStatus";

const EDIT_FIELDS = [
  { name: "name", label: "Tên xe", required: true },
  { row: [
    { name: "pricePerHour", label: "Giá thuê / giờ (₫)", type: "number", required: true },
    { name: "pricePerDay", label: "Giá thuê / ngày (₫)", type: "number", required: true },
  ] },
  {
    name: "status",
    label: "Trạng thái xe",
    type: "select",
    options: [
      { value: VEHICLE_STATUS.APPROVED, label: "🟢 Đang cho thuê (Sẵn sàng)" },
      { value: VEHICLE_STATUS.MAINTENANCE, label: "🔧 Đang sửa chữa / Bảo trì" },
      { value: VEHICLE_STATUS.PAUSED, label: "⏸️ Tạm ngưng cho thuê" },
    ],
  },
  { name: "location", label: "Khu vực", required: true },
  { name: "description", label: "Mô tả", type: "textarea" },
];

const TABS = [
  { key: "all", label: "Tất cả" },
  { key: VEHICLE_STATUS.APPROVED, label: "Đang cho thuê" },
  { key: VEHICLE_STATUS.MAINTENANCE, label: "Đang bảo trì" },
  { key: VEHICLE_STATUS.PAUSED, label: "Tạm ngưng" },
  { key: VEHICLE_STATUS.PENDING, label: "Chờ duyệt" },
];

export default function CarList() {
  const { user } = useAuth();
  const { items, loading, update, remove } = useApi(RESOURCES.VEHICLES);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("all");

  const myVehicles = useMemo(() => items.filter((v) => String(v.providerId) === String(user.id)), [items, user.id]);

  const filteredVehicles = useMemo(() => {
    if (tab === "all") return myVehicles;
    return myVehicles.filter((v) => v.status === tab);
  }, [myVehicles, tab]);

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
    if (confirm(`Gỡ tin đăng "${row.name}" khỏi hệ thống?`)) await remove(row.id || row._id);
  }

  return (
    <DashboardLayout title="Xe của tôi" subtitle="Quản lý danh sách xe, trạng thái cho thuê và bảo trì sửa chữa">
      <div className="tabs mb-16">
        {TABS.map((t) => {
          const count = t.key === "all" ? myVehicles.length : myVehicles.filter((v) => v.status === t.key).length;
          return (
            <button key={t.key} className={tab === t.key ? "active" : ""} onClick={() => setTab(t.key)}>
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <Table
        loading={loading}
        rows={filteredVehicles}
        emptyTitle="Không có xe nào ở mục này"
        emptyHint="Vào mục “Đăng tin cho thuê” để thêm xe mới."
        columns={[
          { key: "img", label: "", render: (r) => <img src={r.image} alt="" style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6 }} /> },
          { key: "name", label: "Tên xe", render: (r) => <strong>{r.name}</strong> },
          { key: "type", label: "Loại" },
          {
            key: "pricing",
            label: "Giá thuê",
            render: (r) => (
              <div>
                <div className="mono text-sm" style={{ color: "var(--signal-dark)", fontWeight: 600 }}>{formatVND(r.pricePerHour || Math.round(r.pricePerDay / 9))}/h</div>
                <div className="mono text-sm text-muted">{formatVND(r.pricePerDay)}/ngày</div>
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
              <>
                <button
                  className="btn btn-outline btn-sm"
                  title="Chuyển sang trạng thái đang sửa chữa/bảo dưỡng"
                  onClick={() => handleQuickStatus(row, VEHICLE_STATUS.MAINTENANCE)}
                >
                  🔧 Bảo trì
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  title="Tạm ngưng cho thuê xe này"
                  onClick={() => handleQuickStatus(row, VEHICLE_STATUS.PAUSED)}
                >
                  ⏸️ Tạm ngưng
                </button>
              </>
            )}

            {(row.status === VEHICLE_STATUS.MAINTENANCE || row.status === VEHICLE_STATUS.PAUSED) && (
              <button
                className="btn btn-signal btn-sm"
                title="Mở cho thuê xe trở lại"
                onClick={() => handleQuickStatus(row, VEHICLE_STATUS.APPROVED)}
              >
                🟢 Mở cho thuê
              </button>
            )}

            <button className="btn btn-outline btn-sm" onClick={() => setModal({ data: row })}>Sửa</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>Xoá</button>
          </div>
        )}
      />

      <Modal
        open={!!modal}
        title="Chỉnh sửa xe"
        onClose={() => setModal(null)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
            <button className="btn btn-signal" disabled={saving} onClick={handleSave}>{saving ? "Đang lưu..." : "Lưu"}</button>
          </>
        }
      >
        {modal && (
          <FormFields
            fields={
              modal.data.status === VEHICLE_STATUS.PENDING || modal.data.status === VEHICLE_STATUS.REJECTED
                ? EDIT_FIELDS.filter((f) => f.name !== "status")
                : EDIT_FIELDS
            }
            values={modal.data}
            onChange={(data) => setModal({ data })}
          />
        )}
      </Modal>
    </DashboardLayout>
  );
}

