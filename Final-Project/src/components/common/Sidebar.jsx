import { NavLink } from "react-router-dom";
import { NAV_BY_ROLE, ROLE_LABEL } from "../../constants/roles";
import { useAuth } from "../../hooks/useAuth";
import { connectionState } from "../../services/api";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const { role, logout } = useAuth();
  const items = NAV_BY_ROLE[role] || [];
  const [mode, setMode] = useState(connectionState.mode);

  useEffect(() => {
    const t = setInterval(() => setMode(connectionState.mode), 800);
    return () => clearInterval(t);
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand__mark">M</div>
        <div>
          <div className="brand__name">Morent</div>
          <div className="brand__role">{ROLE_LABEL[role]}</div>
        </div>
      </div>

      <div className="lane-divider" style={{ opacity: 0.35 }} />

      <nav className="nav">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav__item${isActive ? " active" : ""}`}
          >
            <span className="nav__dot" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <span className={`conn-pill ${mode}`}>
          <span className="conn-pill__dot" />
          {mode === "live" ? "API kết nối trực tiếp" : mode === "offline" ? "Chế độ offline (local)" : "Đang kiểm tra..."}
        </span>
        <button className="logout-btn" onClick={logout}>
          ← Đăng xuất
        </button>
      </div>
    </aside>
  );
}
