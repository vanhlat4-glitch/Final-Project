export default function Input({ label, hint, id, className = "", ...rest }) {
  const inputEl = <input id={id} className={`input ${className}`.trim()} {...rest} />;

  if (!label) return inputEl;

  return (
    <div className="field">
      <label htmlFor={id}>
        {label} {hint && <span className="hint">— {hint}</span>}
      </label>
      {inputEl}
    </div>
  );
}
