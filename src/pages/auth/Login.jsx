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

  const [securityAlert, setSecurityAlert] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSecurityAlert(null);
    setLoading(true);
    const res = await login({ ...form, role });
    setLoading(false);
    if (!res.ok) {
      if (res.isBlocked) {
        return setSecurityAlert(res);
      }
      return setError(res.message);
    }
    if (res.isBypassed) {
      alert("⚠️ [CẢNH BÁO LỖ HỔNG SQL INJECTION]\nBạn đã đăng nhập thành công vào quyền Quản trị viên (Admin) thông qua lỗi SQL Injection ghép chuỗi mà không cần mật khẩu chính xác!");
    }
    navigate(`/${res.user?.role || role}`);
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

          {securityAlert && (
            <div style={{
              background: "rgba(220, 38, 38, 0.1)",
              border: "1.5px solid var(--danger, #dc2626)",
              borderRadius: "8px",
              padding: "12px 14px",
              marginBottom: "16px",
              fontSize: "13px"
            }}>
              <div style={{ fontWeight: "700", color: "var(--danger)", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>🛑</span> PHÁT HIỆN TẤN CÔNG SQL INJECTION!
              </div>
              <div style={{ margin: "6px 0", color: "var(--ink)" }}>{securityAlert.detail}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)" }}>
                <span>Kỹ thuật: <strong>{securityAlert.attackType}</strong></span>
                <span>Độ tin cậy AI: <strong style={{ color: "var(--danger)" }}>{securityAlert.confidence}%</strong></span>
              </div>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          {/* Nút bấm nhanh để demo trước mặt giảng viên */}
          <div style={{ marginBottom: "16px", padding: "10px", background: "var(--paper-3)", borderRadius: "8px", border: "1px dashed var(--line-strong)" }}>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--muted)", marginBottom: "6px" }}>
              🧪 MẪU DEMO BẢO MẬT & SQL INJECTION:
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setForm({ email: "' OR 1=1 --", password: "123" })}
                style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--line-strong)", background: "var(--paper-2)", cursor: "pointer" }}
              >
                ⚡ ' OR 1=1 -- (Bypass)
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: "admin@morent.vn' --", password: "arbitrary" })}
                style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--line-strong)", background: "var(--paper-2)", cursor: "pointer" }}
              >
                ⚡ admin' -- (Comment bypass)
              </button>
              <button
                type="button"
                onClick={() => setForm({ email: "admin@morent.vn", password: "admin123" })}
                style={{ fontSize: "11px", padding: "4px 8px", borderRadius: "4px", border: "1px solid var(--line-strong)", background: "var(--paper-2)", cursor: "pointer" }}
              >
                🔑 Admin chuẩn
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>{t("email_label", "Email")}</label>
              <input
                className="input"
                type="text"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="name@example.com hoặc chuỗi test SQLi"
              />
            </div>
            <div className="field">
              <label>{t("password_label", "Mật khẩu")}</label>
              <input
                className="input"
                type="text"
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
