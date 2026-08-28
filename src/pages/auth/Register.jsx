import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useLanguage } from "../../hooks/useLanguage";
import { ROLES } from "../../constants/roles";
import CarHeadlightsAnimation from "../../components/common/CarHeadlightsAnimation";
import RoadLaneDivider from "../../components/common/RoadLaneDivider";

export default function Register() {
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const ROLE_TABS = [
    { value: ROLES.CUSTOMER, icon: "👤", label: t("role_customer", "Khách hàng (Thuê xe)") },
    { value: ROLES.PROVIDER, icon: "🔑", label: t("role_provider", "Nhà cung cấp (Cho thuê xe)") },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError(language === "vi" ? "Mật khẩu xác nhận không khớp" : "Passwords do not match");
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
          <div className="auth-visual__odometer">MORENT // REGISTER</div>
          <RoadLaneDivider style={{ margin: "14px 0 20px", maxWidth: 260 }} />
          <h1 className="auth-visual__headline">
            {language === "vi" ? (
              <>
                Tham gia Morent, <br />
                bắt đầu <span>hành trình</span> của bạn.
              </>
            ) : (
              <>
                Join Morent, <br />
                start your <span>journey</span> today.
              </>
            )}
          </h1>
        </div>

        {/* Cinematic Animated Car Front with Headlights Ignition */}
        <CarHeadlightsAnimation />

        <div className="plate-strip">
          <span className="plate">{language === "vi" ? "MIỄN PHÍ ĐĂNG KÝ" : "FREE REGISTRATION"}</span>
          <span className="plate">{language === "vi" ? "HỖ TRỢ 24/7" : "24/7 SUPPORT"}</span>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h2 style={{ fontSize: 22, marginBottom: 4 }}>{t("register_title", "Tạo tài khoản")}</h2>
          <p className="text-muted text-sm mb-16">{t("register_subtitle", "Đăng ký để bắt đầu trải nghiệm Morent ngay hôm nay")}</p>

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
              <label>{role === ROLES.PROVIDER ? (language === "vi" ? "Tên đơn vị / nhà cung cấp" : "Provider Name") : t("name_label", "Họ và tên")}</label>
              <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="field">
                <label>{t("email_label", "Email")}</label>
                <input className="input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="field">
                <label>{t("phone_label", "Số điện thoại")}</label>
                <input className="input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="field">
                <label>{t("password_label", "Mật khẩu")}</label>
                <input className="input" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="field">
                <label>{language === "vi" ? "Xác nhận mật khẩu" : "Confirm Password"}</label>
                <input className="input" type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-signal btn-block" disabled={loading}>
              {loading ? t("btn_registering", "Đang tạo tài khoản...") : t("btn_register", "Đăng ký")}
            </button>
          </form>

          <div className="auth-foot">
            {t("has_account", "Đã có tài khoản?")}{" "}
            <Link to="/login" className="link">
              {t("login_now", "Đăng nhập")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
