import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";

const ROLE_TABS = [
  { value: ROLES.CUSTOMER, label: "Khách hàng" },
  { value: ROLES.PROVIDER, label: "Nhà cung cấp xe" },
];

export default function Register() {
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    // eslint-disable-next-line no-unused-vars
    const { confirm, ...payload } = form;
    const res = await register({ ...payload, role });
    setLoading(false);
    if (!res.ok) return setError(res.message);
    navigate(`/${role}`);
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div>
          <div className="auth-visual__odometer">MORENT // ĐĂNG KÝ TÀI KHOẢN</div>
          <div className="lane-divider" style={{ margin: "16px 0 28px", maxWidth: 220 }} />
          <h1 className="auth-visual__headline">
            Tham gia Morent, <br />
            bắt đầu <span>hành trình</span> của bạn.
          </h1>
        </div>
        <div className="plate-strip">
          <span className="plate">MIỄN PHÍ ĐĂNG KÝ</span>
          <span className="plate">HỖ TRỢ 24/7</span>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h2 style={{ fontSize: 22, marginBottom: 4 }}>Tạo tài khoản</h2>
          <p className="text-muted text-sm mb-16">Đăng ký với vai trò phù hợp với bạn</p>

          <div className="role-toggle">
            {ROLE_TABS.map((t) => (
              <button key={t.value} type="button" className={role === t.value ? "active" : ""} onClick={() => setRole(t.value)}>
                {t.label}
              </button>
            ))}
          </div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>{role === ROLES.PROVIDER ? "Tên đơn vị / nhà cung cấp" : "Họ và tên"}</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="field">
                <label>Email</label>
                <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>Số điện thoại</label>
                <input className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>Mật khẩu</label>
                <input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="field">
                <label>Xác nhận mật khẩu</label>
                <input className="input" type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-signal btn-block" disabled={loading}>
              {loading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </button>
          </form>

          <div className="auth-foot">
            Đã có tài khoản? <Link to="/login" className="link">Đăng nhập</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
