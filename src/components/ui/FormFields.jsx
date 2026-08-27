import { useLanguage } from "../../hooks/useLanguage";

// field: { name, label, type: text|number|textarea|select|date, options, required, hint, colSpan }
export default function FormFields({ fields, values, onChange }) {
  function set(name, value) {
    onChange({ ...values, [name]: value });
  }

  return (
    <div>
      {fields.map((f) => {
        if (f.row) {
          return (
            <div className="form-row" key={f.row.map((x) => x.name).join("-")}>
              {f.row.map((sub) => (
                <Field key={sub.name} field={sub} value={values[sub.name]} onSet={set} />
              ))}
            </div>
          );
        }
        return <Field key={f.name} field={f} value={values[f.name]} onSet={set} />;
      })}
    </div>
  );
}

function Field({ field, value, onSet }) {
  const { t } = useLanguage();
  const labelText = t(field.label);

  const common = {
    id: field.name,
    className: "input",
    value: value ?? "",
    required: field.required,
    placeholder: field.placeholder ? t(field.placeholder) : undefined,
    onChange: (e) => onSet(field.name, field.type === "number" ? e.target.valueAsNumber || e.target.value : e.target.value),
  };

  return (
    <div className="field">
      <label htmlFor={field.name}>
        {labelText} {field.hint && <span className="hint">— {t(field.hint)}</span>}
      </label>
      {field.type === "textarea" ? (
        <textarea {...common} rows={3} />
      ) : field.type === "select" ? (
        <select {...common}>
          <option value="" disabled>
            {t("Chọn", "Select")} {labelText.toLowerCase()}
          </option>
          {field.options.map((o) => (
            <option key={o.value} value={o.value}>
              {t(o.label)}
            </option>
          ))}
        </select>
      ) : (
        <input {...common} type={field.type || "text"} />
      )}
    </div>
  );
}
