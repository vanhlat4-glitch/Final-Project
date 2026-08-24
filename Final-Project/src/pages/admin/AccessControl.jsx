import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import FormFields from "../../components/ui/FormFields";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";

const FIELDS = [
  { name: "name", label: "Họ tên nhân viên", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "permission",
    label: "Quyền truy cập",
    type: "select",
    required: true,
    options: [
      { value: "full", label: "Toàn quyền" },
      { value: "operations", label: "Vận hành (đơn hàng, xe)" },
      { value: "support", label: "Chỉ hỗ trợ khách hàng" },
      { value: "readonly", label: "Chỉ xem" },
    ],
  },
];

const EMPTY = { name: "", email: "", permission: "readonly" };
const PERMISSION_LABEL = { full: "Toàn quyền", operations: "Vận hành", support: "Hỗ trợ", readonly: "Chỉ xem" };

export default function AccessControl() {
  const { items, loading, create, remove } = useApi(RESOURCES.STAFF);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await create(modal.data);
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    if (confirm(`Thu hồi quyền truy cập của "${row.name}"?`)) await remove(row.id);
  }

  return (
    <DashboardLayout title="Phân quyền nội bộ" subtitle="Quản lý và phân quyền truy cập cho nhân viên nội bộ">
      <div className="section-head">
        <div>
          <h2>Nhân viên nội bộ</h2>
          <p>{items.length} tài khoản có quyền truy cập hệ thống</p>
        </div>
        <button className="btn btn-signal" onClick={() => setModal({ data: EMPTY })}>+ Thêm nhân viên</button>
      </div>

      <Table
        loading={loading}
        rows={items}
        emptyTitle="Chưa có nhân viên nội bộ nào"
        columns={[
          { key: "name", label: "Họ tên", render: (r) => <strong>{r.name}</strong> },
          { key: "email", label: "Email" },
          { key: "permission", label: "Quyền", render: (r) => <Badge tone={r.permission === "full" ? "danger" : "info"}>{PERMISSION_LABEL[r.permission]}</Badge> },
        ]}
        renderActions={(row) => (
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>Thu hồi</button>
        )}
      />

      <Modal
        open={!!modal}
        title="Thêm nhân viên nội bộ"
        onClose={() => setModal(null)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
            <button className="btn btn-signal" disabled={saving} onClick={handleSave}>{saving ? "Đang lưu..." : "Thêm"}</button>
          </>
        }
      >
        {modal && <FormFields fields={FIELDS} values={modal.data} onChange={(data) => setModal({ data })} />}
      </Modal>
    </DashboardLayout>
  );
}
