import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useLanguage } from "../../hooks/useLanguage";
import { initials } from "../../utils/formatDate";
import AvatarModal from "./AvatarModal";

export default function Header({ title, subtitle }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [avatarOpen, setAvatarOpen] = useState(false);

  return (
    <>
      <header className="topbar">
        <div className="topbar__header-info">
          <div className="topbar__title">{t(title)}</div>
          {subtitle && <div className="topbar__sub">{t(subtitle)}</div>}
        </div>

        <div className="topbar__actions">
          <div
            className="topbar__user topbar__user--interactive"
            onClick={() => setAvatarOpen(true)}
            title={t("change_avatar", "Nhấp để đổi ảnh đại diện")}
          >
            <div className="topbar__user-text" style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{user?.name || "Người dùng"}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)" }}>{user?.email || "morent@rent.vn"}</div>
            </div>

            <div className="avatar-wrapper">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name || "Avatar"}
                  className="avatar avatar--img"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
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
        </div>
      </header>

      <AvatarModal open={avatarOpen} onClose={() => setAvatarOpen(false)} />
    </>
  );
}
