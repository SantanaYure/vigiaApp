import "./Button.css";

export function Button({ children, variant = "primary", icon: Icon, onClick, disabled, type = "button" }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon ? <Icon size={16} strokeWidth={2.2} /> : null}
      <span>{children}</span>
    </button>
  );
}
