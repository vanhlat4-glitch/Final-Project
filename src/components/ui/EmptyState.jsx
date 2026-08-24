export default function EmptyState({ title, hint, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {hint && <p>{hint}</p>}
      {action && <div className="mt-16">{action}</div>}
    </div>
  );
}
