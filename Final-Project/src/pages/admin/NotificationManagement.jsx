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
  {
    name: "audience",
    label: "Gửi đến",
    type: "select",
    required: true,
    options: [
      { value: "provider", label: "Nhà cung cấp xe" },
      { value: "customer", label: "Khách hàng" },
      { value: "all", label: "Tất cả người dùng" },
    ],
  },
  { name: "title", label: "Tiêu đề", required: true },
  { name: "message", label: "Nội dung thông báo", type: "textarea", required: true },
];

const EMPTY = { audience: "all", title: "", message: "" };

const AUDIENCE_LABEL = { provider: "Nhà cung cấp", customer: "Khách hàng", all: "Tất cả" };

export default function NotificationManagement() {
  const { items, loading, create, remove } = useApi(RESOURCES.NOTIFICATIONS);
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
    if (confirm("Gỡ thông báo này?")) await remove(row.id);
  }

  return (
    <DashboardLayout title="Quản lý thông báo" subtitle="Gửi thông báo đến nhà cung cấp xe và khách hàng">
      <div className="section-head">
        <div>
          <h2>Thông báo đã gửi</h2>
          <p>{items.length} thông báo</p>
        </div>
        <button className="btn btn-signal" onClick={() => setModal({ data: EMPTY })}>+ Soạn thông báo</button>
      </div>

      <Table
        loading={loading}
        rows={items}
        emptyTitle="Chưa gửi thông báo nào"
        columns={[
          { key: "audience", label: "Đối tượng", render: (r) => <Badge tone="info">{AUDIENCE_LABEL[r.audience] || r.audience}</Badge> },
          { key: "title", label: "Tiêu đề", render: (r) => <strong>{r.title}</strong> },
          { key: "message", label: "Nội dung" },
          { key: "createdAt", label: "Ngày gửi", render: (r) => formatDate(r.createdAt) },
        ]}
        renderActions={(row) => (
          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row)}>Gỡ</button>
        )}
      />

      <Modal
        open={!!modal}
        title="Soạn thông báo mới"
        onClose={() => setModal(null)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Huỷ</button>
            <button className="btn btn-signal" disabled={saving} onClick={handleSave}>{saving ? "Đang gửi..." : "Gửi thông báo"}</button>
          </>
        }
      >
        {modal && <FormFields fields={FIELDS} values={modal.data} onChange={(data) => setModal({ data })} />}
      </Modal>
    </DashboardLayout>
  );
}
