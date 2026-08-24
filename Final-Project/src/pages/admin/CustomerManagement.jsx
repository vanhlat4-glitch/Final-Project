import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import FormFields from "../../components/ui/FormFields";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

const FIELDS = [
  { name: "name", label: "Họ và tên", required: true },
  { row: [
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Số điện thoại", required: true },
  ] },
  { name: "address", label: "Địa chỉ" },
];

const EMPTY = { name: "", email: "", phone: "", address: "" };

export default function CustomerManagement() {
  const { items, loading, update, remove } = useApi(RESOURCES.CUSTOMERS);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

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
    if (confirm(`Xoá tài khoản khách hàng "${row.name}"?`)) await remove(row.id);
  }

  return (
    <DashboardLayout title="Quản lý khách hàng" subtitle="Xem, chỉnh sửa và xoá thông tin khách hàng">
      <div className="section-head">
        <div>
          <h2>Danh sách khách hàng</h2>
          <p>{items.length} khách hàng đã đăng ký</p>
        </div>
      </div>

      <Table
        loading={loading}
        rows={items}
        emptyTitle="Chưa có khách hàng nào"
        columns={[
          { key: "name", label: "Họ tên", render: (r) => <strong>{r.name}</strong> },
          { key: "email", label: "Email" },
          { key: "phone", label: "SĐT" },
          { key: "address", label: "Địa chỉ", render: (r) => r.address || "—" },
          { key: "createdAt", label: "Ngày tham gia", render: (r) => formatDate(r.createdAt) },
        ]}
        renderActions={(row) => (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => setModal({ data: { ...EMPTY, ...row } })}>Sửa</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>Xoá</button>
          </>
        )}
      />

      <Modal
        open={!!modal}
        title="Chỉnh sửa khách hàng"
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
