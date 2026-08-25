import { useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useApi } from "../../hooks/useApi";
import { RESOURCES } from "../../services/api";
import { initials } from "../../utils/formatDate";

const AVATAR_PRESETS = [
  { id: "1", label: "Tài xế 1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80" },
  { id: "2", label: "Tài xế 2", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80" },
  { id: "3", label: "Tài xế 3", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=240&auto=format&fit=crop&q=80" },
  { id: "4", label: "Tài xế 4", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80" },
  { id: "5", label: "Tài xế 5", url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=240&auto=format&fit=crop&q=80" },
  { id: "6", label: "Tài xế 6", url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80" },
  { id: "7", label: "Tài xế 7", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=240&auto=format&fit=crop&q=80" },
  { id: "8", label: "Tài xế 8", url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=240&auto=format&fit=crop&q=80" },
];

export default function AvatarModal({ open, onClose }) {
  const { user, role, updateProfile } = useAuth();
  const { update } = useApi(
    role === "provider"
      ? RESOURCES.PROVIDERS
      : role === "admin"
      ? RESOURCES.STAFF
      : RESOURCES.CUSTOMERS
  );

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "");
  const [customUrl, setCustomUrl] = useState("");
  const [tab, setTab] = useState("presets"); // "presets" | "upload" | "url"
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  // Handle local file selection -> convert to Base64 data URL
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn một tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP)");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      alert("Kích thước ảnh tối đa là 3MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const avatarValue = tab === "url" && customUrl.trim() ? customUrl.trim() : selectedAvatar;
      if (user?.id || user?._id) {
        try {
          await update(user.id || user._id, { avatar: avatarValue });
        } catch (err) {
          console.warn("[Avatar] Lưu API server cảnh báo:", err.message);
        }
      }
      updateProfile({ avatar: avatarValue });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function handleRemoveAvatar() {
    setSelectedAvatar("");
    setCustomUrl("");
  }

  const currentPreview =
    tab === "url" && customUrl.trim()
      ? customUrl.trim()
      : selectedAvatar;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 460 }}>
        <div className="modal__head">
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Đổi ảnh đại diện</h3>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal__body">
          {/* Avatar Preview Section */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <div style={{ position: "relative" }}>
              {currentPreview ? (
                <img
                  src={currentPreview}
                  alt="Avatar preview"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "3px solid var(--signal)",
                    boxShadow: "0 4px 12px rgba(20, 23, 28, 0.15)",
                  }}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=240&auto=format&fit=crop&q=80";
                  }}
                />
              ) : (
                <div
                  className="avatar"
                  style={{
                    width: 72,
                    height: 72,
                    fontSize: 26,
                    border: "3px solid var(--line)",
                    boxShadow: "0 4px 12px rgba(20, 23, 28, 0.1)",
                  }}
                >
                  {initials(user?.name || "?")}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>{user?.email}</div>
              {currentPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  style={{
                    border: "none",
                    background: "none",
                    color: "var(--danger)",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                    marginTop: 6,
                  }}
                >
                  ✕ Gỡ ảnh (dùng chữ cái đầu)
                </button>
              )}
            </div>
          </div>

          {/* Tab Selection */}
          <div className="role-toggle mb-16">
            <button
              type="button"
              className={tab === "presets" ? "active" : ""}
              onClick={() => setTab("presets")}
            >
              ✨ Ảnh mẫu có sẵn
            </button>
            <button
              type="button"
              className={tab === "upload" ? "active" : ""}
              onClick={() => setTab("upload")}
            >
              📁 Tải ảnh từ máy
            </button>
            <button
              type="button"
              className={tab === "url" ? "active" : ""}
              onClick={() => setTab("url")}
            >
              🔗 Nhập link URL
            </button>
          </div>

          {/* Tab 1: Presets */}
          {tab === "presets" && (
            <div>
              <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 10 }}>
                Chọn một ảnh đại diện phong cách yêu thích:
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                }}
              >
                {AVATAR_PRESETS.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedAvatar(preset.url)}
                    style={{
                      cursor: "pointer",
                      borderRadius: 10,
                      overflow: "hidden",
                      border:
                        selectedAvatar === preset.url
                          ? "2.5px solid var(--signal)"
                          : "1.5px solid var(--line)",
                      padding: 2,
                      background: "#fff",
                      transition: "transform 0.15s ease, border-color 0.15s ease",
                      boxShadow: selectedAvatar === preset.url ? "0 0 0 2px rgba(255,176,32,0.3)" : "none",
                    }}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      style={{ width: "100%", height: 60, objectFit: "cover", borderRadius: 8 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Upload File */}
          {tab === "upload" && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: "2px dashed var(--line)",
                  borderRadius: "var(--radius)",
                  padding: "24px 16px",
                  cursor: "pointer",
                  background: "var(--paper)",
                  transition: "all 0.2s ease",
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const fakeEvent = { target: { files: [file] } };
                    handleFileChange(fakeEvent);
                  }
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>📸</div>
                <strong style={{ display: "block", fontSize: 14, marginBottom: 4 }}>
                  Nhấp để chọn ảnh từ máy tính
                </strong>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>
                  Hỗ trợ kéo thả file PNG, JPG, WEBP (tối đa 3MB)
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: URL Input */}
          {tab === "url" && (
            <div>
              <div className="field">
                <label>Đường dẫn hình ảnh (URL)</label>
                <input
                  className="input"
                  placeholder="https://example.com/avatar.jpg"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
                <span className="hint">Dán link ảnh đại diện từ mạng (Facebook, Google, Unsplash...)</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal__foot">
          <button className="btn btn-outline" onClick={onClose} disabled={saving}>
            Hủy
          </button>
          <button className="btn btn-signal" onClick={handleSave} disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu ảnh đại diện"}
          </button>
        </div>
      </div>
    </div>
  );
}
