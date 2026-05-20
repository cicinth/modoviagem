export function Field({ label, children }) {
  return (
    <label className="field">
      {label ? <span>{label}</span> : null}
      {children}
    </label>
  );
}

export function TextInput({ label, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </Field>
  );
}

export function TextArea({ label, value, onChange, placeholder, rows = 4 }) {
  return (
    <Field label={label}>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={rows} />
    </Field>
  );
}
