import "./SelectFilter.css";

export function SelectFilter({ value, onChange, options, placeholder = "Todos" }) {
  return (
    <select className="select-filter" value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value ?? option} value={option.value ?? option}>
          {option.label ?? option}
        </option>
      ))}
    </select>
  );
}
