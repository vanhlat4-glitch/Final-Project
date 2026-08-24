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
import { VEHICLE_STATUS_LABEL } from "../../constants/vehicleStatus";

const EDIT_FIELDS = [
  { name: "name", label: "Tên xe", required: true },
  { row: [
    { name: "pricePerDay", label: "Giá thuê / ngày (₫)", type: "number", required: true },
    { name: "location", label: "Khu vực", required: true },
  ] },
  { name: "description", label: "Mô tả", type: "textarea" },
];

export default function CarList() {
  const { user } = useAuth();
  const { items, loading, update, remove } = useApi(RESOURCES.VEHICLES);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const myVehicles = useMemo(() => items.filter((v) => String(v.providerId) === String(user.id)), [items, user.id]);

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
    if (confirm(`Gỡ tin đăng "${row.name}"?`)) await remove(row.id);
  }

  return (
    <DashboardLayout title="Xe của tôi" subtitle="Danh sách xe bạn đã đăng tin cho thuê">
      <Table
        loading={loading}
        rows={myVehicles}
        emptyTitle="Bạn chưa đăng xe nào"
        emptyHint="Vào mục “Đăng tin cho thuê” để thêm xe đầu tiên."
        columns={[
          { key: "img", label: "", render: (r) => <img src={r.image} alt="" style={{ width: 56, height: 40, objectFit: "cover", borderRadius: 6 }} /> },
          { key: "name", label: "Tên xe", render: (r) => <strong>{r.name}</strong> },
          { key: "type", label: "Loại" },
          { key: "pricePerDay", label: "Giá/ngày", render: (r) => <span className="mono">{formatVND(r.pricePerDay)}</span> },
          { key: "status", label: "Trạng thái", render: (r) => <Badge tone={r.status === "approved" ? "success" : r.status === "rejected" ? "danger" : "warning"}>{VEHICLE_STATUS_LABEL[r.status]}</Badge> },
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
        {modal && <FormFields fields={EDIT_FIELDS} values={modal.data} onChange={(data) => setModal({ data })} />}
      </Modal>
    </DashboardLayout>
  );
}
