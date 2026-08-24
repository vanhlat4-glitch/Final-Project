import { useAuth } from "../../hooks/useAuth";
import { initials } from "../../utils/formatDate";

export default function Header({ title, subtitle }) {
  const { user } = useAuth();
  return (
    <header className="topbar">
      <div>
        <div className="topbar__title">{title}</div>
        {subtitle && <div className="topbar__sub">{subtitle}</div>}
      </div>
      <div className="topbar__user">
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{user?.email}</div>
        </div>
        <div className="avatar">{initials(user?.name || "?")}</div>
      </div>
    </header>
  );
}
