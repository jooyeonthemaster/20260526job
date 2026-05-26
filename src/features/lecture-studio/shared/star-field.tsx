export function StarField({
  letter,
  label,
  value,
  onChange,
}: {
  letter: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="field-block">
      <label data-letter={letter}>{label}</label>
      <textarea
        value={value}
        rows={2}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
