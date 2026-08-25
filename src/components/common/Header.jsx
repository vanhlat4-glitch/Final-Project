import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { initials } from "../../utils/formatDate";
import AvatarModal from "./AvatarModal";

export default function Header({ title, subtitle }) {
  const { user } = useAuth();
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <div>
          <div className="topbar__title">{title}</div>
          {subtitle && <div className="topbar__sub">{subtitle}</div>}
        </div>

        <div
          className="topbar__user topbar__user--interactive"
          onClick={() => setAvatarOpen(true)}
          title="Nhấp để đổi ảnh đại diện"
        >
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{user?.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{user?.email}</div>
          </div>

          <div className="avatar-wrapper">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name || "Avatar"}
                className="avatar avatar--img"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="avatar avatar--fallback"
              style={{ display: user?.avatar ? "none" : "flex" }}
            >
              {initials(user?.name || "?")}
            </div>
            <span className="avatar-edit-badge" title="Đổi ảnh">📷</span>
          </div>
        </div>
      </header>

      <AvatarModal open={avatarOpen} onClose={() => setAvatarOpen(false)} />
    </>
  );
}

