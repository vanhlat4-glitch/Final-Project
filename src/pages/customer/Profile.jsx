import { useState } from "react";
import DashboardLayout from "../../components/common/DashboardLayout";
import { useAuth } from "../../hooks/useAuth";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { update } = useApi(RESOURCES.CUSTOMERS);
  const [form, setForm] = useState({ name: user.name || "", phone: user.phone || "", address: user.address || "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await update(user.id, form);
      updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout title="Tài khoản của tôi" subtitle="Xem và chỉnh sửa thông tin cá nhân">
      <div className="card" style={{ maxWidth: 480 }}>
        {saved && <div className="form-success">Đã cập nhật thông tin tài khoản.</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Họ và tên</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input className="input" value={user.email} disabled />
          </div>
          <div className="field">
            <label>Số điện thoại</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="field">
            <label>Địa chỉ</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <button className="btn btn-signal" disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
        </form>
      </div>
    </DashboardLayout>
  );
}
