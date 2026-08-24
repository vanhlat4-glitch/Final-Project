import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import FormFields from "../../components/ui/FormFields";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatVND } from "../../utils/formatCurrency";
import { VEHICLE_STATUS_LABEL, VEHICLE_STATUS_TONE } from "../../constants/vehicleStatus";

const FIELDS = [
  { name: "name", label: "Tên xe", required: true },
  { row: [
    { name: "type", label: "Loại xe", required: true },
    { name: "pricePerDay", label: "Giá/ngày (₫)", type: "number", required: true },
  ] },
  { name: "location", label: "Khu vực" },
  { name: "description", label: "Mô tả", type: "textarea" },
];

export default function VehicleManagement() {
  const { items, loading, update, remove } = useApi(RESOURCES.VEHICLES);
  const { items: providers } = useApi(RESOURCES.PROVIDERS);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const providerName = (id) => providers.find((p) => String(p.id) === String(id))?.name || "—";

  async function handleSave() {
    setSaving(true);
    try {
      await update(modal.data.id, modal.data);
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    if (confirm(`Xoá xe "${row.name}" khỏi hệ thống?`)) await remove(row.id);
  }

  return (
    <DashboardLayout title="Danh sách xe" subtitle="Xem, chỉnh sửa và xoá xe của tất cả nhà cung cấp">
      <div className="section-head">
        <div>
          <h2>Toàn bộ xe trong hệ thống</h2>
          <p>{items.length} xe · cần duyệt xe mới? <Link to="/admin/vehicles/approval" className="link">Sang trang kiểm duyệt</Link></p>
        </div>
      </div>

      <Table
        loading={loading}
        rows={items}
        emptyTitle="Chưa có xe nào trong hệ thống"
        columns={[
          { key: "name", label: "Tên xe", render: (r) => <strong>{r.name}</strong> },
          { key: "provider", label: "Nhà cung cấp", render: (r) => providerName(r.providerId) },
          { key: "type", label: "Loại" },
          { key: "pricePerDay", label: "Giá/ngày", render: (r) => <span className="mono">{formatVND(r.pricePerDay)}</span> },
          { key: "status", label: "Trạng thái", render: (r) => <Badge tone={VEHICLE_STATUS_TONE[r.status]}>{VEHICLE_STATUS_LABEL[r.status]}</Badge> },
        ]}
        renderActions={(row) => (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setModal({ data: row })}>Sửa</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>Xoá</button>
          </>
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
        {modal && <FormFields fields={FIELDS} values={modal.data} onChange={(data) => setModal({ data })} />}
      </Modal>
    </DashboardLayout>
  );
}
