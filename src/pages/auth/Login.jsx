import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";
import { ROLES } from "../../constants/roles";
import CarHeadlightsAnimation from "../../components/common/CarHeadlightsAnimation";
import RoadLaneDivider from "../../components/common/RoadLaneDivider";

export default function Login() {
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const ROLE_TABS = [
    { value: ROLES.CUSTOMER, icon: "👤", label: t("role_customer", "Khách hàng") },
    { value: ROLES.PROVIDER, icon: "🔑", label: t("role_provider", "Nhà cung cấp (Cho thuê)") },
    { value: ROLES.ADMIN, icon: "🛡️", label: t("role_admin", "Quản trị viên") },
  ];

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
      {/* Floating Theme & Language Switches on Auth Screen */}
      <div className="auth-quick-controls">
        <button
          type="button"
          className="auth-ctrl-btn"
          onClick={toggleLanguage}
          title={`Language: ${language.toUpperCase()}`}
        >
          <span>{language === "vi" ? "🇻🇳 VI" : "🇬🇧 EN"}</span>
        </button>
        <button
          type="button"
          className="auth-ctrl-btn"
          onClick={toggleTheme}
          title={isDark ? "Light Mode" : "Dark Mode"}
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="auth-visual">
        <div>
          <div className="auth-visual__odometer">MORENT // CAR RENTAL SYSTEM</div>
          <RoadLaneDivider style={{ margin: "14px 0 20px", maxWidth: 260 }} />
          <h1 className="auth-visual__headline">
            {language === "vi" ? (
              <>
                Đặt xe nhanh, <br />
                quản lý <span>gọn gàng</span> trên một nền tảng.
              </>
            ) : (
              <>
                Rent fast, <br />
                manage <span>seamlessly</span> on one platform.
              </>
            )}
          </h1>
        </div>

        {/* Cinematic Animated Car Front with Headlights Ignition */}
        <CarHeadlightsAnimation />

        <div className="plate-strip">
          <span className="plate">{t("step_1", "01 · TÌM XE")}</span>
          <span className="plate">{t("step_2", "02 · ĐẶT XE")}</span>
          <span className="plate">{t("step_3", "03 · NHẬN XE")}</span>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h2 style={{ fontSize: 22, marginBottom: 4 }}>{t("login_title", "Đăng nhập")}</h2>
          <p className="text-muted text-sm mb-16">{t("login_subtitle", "Chọn vai trò và đăng nhập vào hệ thống Morent")}</p>

          <div className="role-toggle">
            {ROLE_TABS.map((tTab) => (
              <button
                key={tTab.value}
                type="button"
                className={role === tTab.value ? "active" : ""}
                onClick={() => setRole(tTab.value)}
              >
                <span style={{ marginRight: 6 }}>{tTab.icon}</span>
                {tTab.label}
              </button>
            ))}
          </div>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>{t("email_label", "Email")}</label>
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
              <label>{t("password_label", "Mật khẩu")}</label>
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
              {loading ? t("btn_logging_in", "Đang đăng nhập...") : t("btn_login", "Đăng nhập")}
            </button>
          </form>

          {role !== ROLES.ADMIN && (
            <div className="auth-foot">
              {t("no_account", "Chưa có tài khoản?")}{" "}
              <Link to="/register" className="link">
                {t("register_now", "Đăng ký ngay")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
