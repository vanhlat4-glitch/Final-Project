import { useLanguage } from "../../hooks/useLanguage";

export default function Modal({ open, title, onClose, children, footer, width }) {
  const { t } = useLanguage();
  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className="modal" style={width ? { maxWidth: width } : undefined}>
        <div className="modal__head">
          <h3>{t(title)}</h3>
          <button className="icon-btn" onClick={onClose} aria-label={t("Đóng", "Close")}>
            ✕
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>
  );
}
