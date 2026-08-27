import { useLanguage } from "../../hooks/useLanguage";

export default function StatCard({ label, value, hint }) {
  const { t } = useLanguage();
  return (
    <div className="card stat-card">
      <span className="stat-card__label">{t(label)}</span>
      <span className="stat-card__value">{value}</span>
      {hint && <span className="stat-card__hint">{t(hint)}</span>}
    </div>
  );
}
