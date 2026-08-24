import { useMemo, useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import Table from "../../components/ui/Table";
import Modal from "../../components/ui/Modal";
import Badge from "../../components/ui/Badge";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { formatDate } from "../../utils/formatDate";

export default function ProviderSupport() {
  const { user } = useAuth();
  const { items, loading, create } = useApi(RESOURCES.SUPPORT_TICKETS);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ subject: "", message: "" });
  const [saving, setSaving] = useState(false);

  const myTickets = useMemo(() => items.filter((t) => String(t.fromId) === String(user.id) && t.fromRole === "provider"), [items, user.id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await create({ ...form, fromRole: "provider", fromId: user.id, status: "open", reply: "" });
      setForm({ subject: "", message: "" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Hỗ trợ khách hàng" subtitle="Gửi yêu cầu hỗ trợ kỹ thuật đến Admin và theo dõi phản hồi">
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Gửi yêu cầu mới</h3>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Chủ đề</label>
              <input className="input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </div>
            <div className="field">
              <label>Nội dung</label>
              <textarea className="input" rows={4} required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            </div>
            <button className="btn btn-signal" disabled={saving}>{saving ? "Đang gửi..." : "Gửi yêu cầu"}</button>
          </form>
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Yêu cầu đã gửi</h3>
          <Table
            loading={loading}
            rows={myTickets}
            emptyTitle="Bạn chưa gửi yêu cầu hỗ trợ nào"
            columns={[
              { key: "subject", label: "Chủ đề" },
              { key: "status", label: "Trạng thái", render: (r) => <Badge tone={r.status === "resolved" ? "success" : "warning"}>{r.status === "resolved" ? "Đã xử lý" : "Đang mở"}</Badge> },
              { key: "createdAt", label: "Ngày gửi", render: (r) => formatDate(r.createdAt) },
            ]}
            renderActions={(row) => (
              <button className="btn btn-outline btn-sm" onClick={() => setModal(row)}>Xem</button>
            )}
          />
        </div>
      </div>

      <Modal open={!!modal} title={modal?.subject} onClose={() => setModal(null)}>
        {modal && (
          <div>
            <p className="text-sm mb-16">{modal.message}</p>
            {modal.reply ? (
              <div style={{ background: "var(--paper)", borderRadius: 8, padding: 12 }}>
                <div className="text-sm" style={{ fontWeight: 600, marginBottom: 4 }}>Phản hồi từ Admin</div>
                <p className="text-sm">{modal.reply}</p>
              </div>
            ) : (
              <p className="text-muted text-sm">Chưa có phản hồi.</p>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
