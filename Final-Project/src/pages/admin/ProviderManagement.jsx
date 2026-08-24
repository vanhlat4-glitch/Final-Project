import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import FormFields from "../../components/ui/FormFields";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

const FIELDS = [
  { name: "name", label: "Tên nhà cung cấp", required: true },
  { row: [
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Số điện thoại", required: true },
  ] },
  { name: "password", label: "Mật khẩu", type: "password", hint: "dùng để đăng nhập", required: true },
  {
    name: "status",
    label: "Trạng thái",
    type: "select",
    options: [
      { value: "active", label: "Đang hoạt động" },
      { value: "suspended", label: "Tạm khoá" },
    ],
  },
];

const EMPTY = { name: "", email: "", phone: "", password: "", status: "active" };

export default function ProviderManagement() {
  const { items, loading, create, update, remove } = useApi(RESOURCES.PROVIDERS);
  const [modal, setModal] = useState(null); // { mode: 'create'|'edit', data }
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setModal({ mode: "create", data: EMPTY });
  }
  function openEdit(row) {
    setModal({ mode: "edit", data: row });
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal.mode === "create") await create(modal.data);
      else await update(modal.data.id, modal.data);
      setModal(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(row) {
    if (confirm(`Xoá nhà cung cấp "${row.name}"? Hành động này không thể hoàn tác.`)) {
      await remove(row.id);
    }
  }

  return (
    <DashboardLayout title="Quản lý nhà cung cấp xe" subtitle="Xem, thêm, chỉnh sửa và xoá thông tin nhà cung cấp">
      <div className="section-head">
        <div>
          <h2>Danh sách nhà cung cấp</h2>
          <p>{items.length} nhà cung cấp đã đăng ký trên hệ thống</p>
        </div>
        <button className="btn btn-signal" onClick={openCreate}>+ Thêm nhà cung cấp</button>
      </div>

      <Table
        loading={loading}
        rows={items}
        emptyTitle="Chưa có nhà cung cấp nào"
        emptyHint="Nhấn “Thêm nhà cung cấp” để tạo mới."
        columns={[
          { key: "name", label: "Tên", render: (r) => <strong>{r.name}</strong> },
          { key: "email", label: "Email" },
          { key: "phone", label: "SĐT" },
          { key: "status", label: "Trạng thái", render: (r) => <Badge tone={r.status === "suspended" ? "danger" : "success"}>{r.status === "suspended" ? "Tạm khoá" : "Hoạt động"}</Badge> },
          { key: "createdAt", label: "Ngày tham gia", render: (r) => formatDate(r.createdAt) },
        ]}
        renderActions={(row) => (
          <>
            <button className="btn btn-outline btn-sm" onClick={() => openEdit(row)}>Sửa</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>Xoá</button>
          </>
        )}
      />

      <Modal
        open={!!modal}
        title={modal?.mode === "create" ? "Thêm nhà cung cấp" : "Chỉnh sửa nhà cung cấp"}
        onClose={() => setModal(null)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
            <button className="btn btn-signal" disabled={saving} onClick={handleSave}>
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </>
        }
      >
        {modal && <FormFields fields={FIELDS} values={modal.data} onChange={(data) => setModal({ ...modal, data })} />}
      </Modal>
    </DashboardLayout>
  );
}
