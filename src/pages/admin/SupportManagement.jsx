import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { formatDate } from "../../utils/formatDate";

const ROLE_LABEL = { customer: "Khách hàng", provider: "Nhà cung cấp" };

export default function SupportManagement() {
  const { items, loading, update } = useApi(RESOURCES.SUPPORT_TICKETS);
  const [modal, setModal] = useState(null);
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  async function sendReply() {
    setSaving(true);
    try {
      await update(modal.id, { reply, status: "resolved" });
      setModal(null);
      setReply("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Quản lý hỗ trợ" subtitle="Cung cấp hỗ trợ kỹ thuật cho nhà cung cấp xe và khách hàng">
      <Table
        loading={loading}
        rows={items}
        emptyTitle="Chưa có yêu cầu hỗ trợ nào"
        columns={[
          { key: "from", label: "Từ", render: (r) => ROLE_LABEL[r.fromRole] || r.fromRole },
          { key: "subject", label: "Chủ đề", render: (r) => <strong>{r.subject}</strong> },
          { key: "status", label: "Trạng thái", render: (r) => <Badge tone={r.status === "resolved" ? "success" : "warning"}>{r.status === "resolved" ? "Đã xử lý" : "Đang mở"}</Badge> },
          { key: "createdAt", label: "Ngày gửi", render: (r) => formatDate(r.createdAt) },
        ]}
        renderActions={(row) => (
          <button className="btn btn-outline btn-sm" onClick={() => { setModal(row); setReply(row.reply || ""); }}>
            {row.status === "resolved" ? "Xem" : "Trả lời"}
          </button>
        )}
      />

      <Modal
        open={!!modal}
        title={modal?.subject}
        onClose={() => setModal(null)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Đóng</button>
            <button className="btn btn-signal" disabled={saving} onClick={sendReply}>{saving ? "Đang gửi..." : "Gửi phản hồi"}</button>
          </>
        }
      >
        {modal && (
          <div>
            <p className="text-sm mb-16">{modal.message}</p>
            <div className="field">
              <label>Phản hồi</label>
              <textarea className="input" rows={3} value={reply} onChange={(e) => setReply(e.target.value)} />
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
