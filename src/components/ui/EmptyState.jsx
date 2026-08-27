import { useLanguage } from "../../hooks/useLanguage";

export default function EmptyState({ title, hint, action }) {
  const { t } = useLanguage();
  return (
    <div className="empty-state">
      <h4>{t(title)}</h4>
      {hint && <p className="text-sm">{t(hint)}</p>}
      {action && <div className="mt-16">{action}</div>}
    </div>
  );
}
