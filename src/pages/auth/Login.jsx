import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../constants/roles";
import CarHeadlightsAnimation from "../../components/common/CarHeadlightsAnimation";

const ROLE_TABS = [
  { value: ROLES.CUSTOMER, label: "Khách hàng" },
  { value: ROLES.PROVIDER, label: "Nhà cung cấp" },
  { value: ROLES.ADMIN, label: "Quản trị viên" },
];

export default function Login() {
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await login({ ...form, role });
    setLoading(false);
    if (!res.ok) return setError(res.message);
    navigate(`/${role}`);
  }

  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <div>
          <div className="auth-visual__odometer">MORENT // CAR RENTAL SYSTEM</div>
          <div className="lane-divider" style={{ margin: "16px 0 24px", maxWidth: 220 }} />
          <h1 className="auth-visual__headline">
            Đặt xe nhanh, <br />
            quản lý <span>gọn gàng</span> trên một nền tảng.
          </h1>
        </div>

        {/* Cinematic Animated Car Front with Headlights Ignition */}
        <CarHeadlightsAnimation />

        <div className="plate-strip">
          <span className="plate">01 · TÌM XE</span>
          <span className="plate">02 · ĐẶT XE</span>
          <span className="plate">03 · NHẬN XE</span>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h2 style={{ fontSize: 22, marginBottom: 4 }}>Đăng nhập</h2>
          <p className="text-muted text-sm mb-16">Chọn vai trò và đăng nhập vào hệ thống Morent</p>

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
              <label>Email</label>
              <input
                className="input"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com"
              />
            </div>
            <div className="field">
              <label>Mật khẩu</label>
              <input
                className="input"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••"
              />
            </div>
            <button className="btn btn-signal btn-block" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {role !== ROLES.ADMIN && (
            <div className="auth-foot">
              Chưa có tài khoản? <Link to="/register" className="link">Đăng ký ngay</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
