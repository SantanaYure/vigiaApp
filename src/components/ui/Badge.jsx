import "./Badge.css";

export function Badge({ label, color, bg }) {
  return (
    <span className="badge" style={{ color, backgroundColor: bg }}>
      {label}
    </span>
  );
}
