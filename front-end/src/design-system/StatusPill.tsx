import { tonePalette, type SemanticTone } from "./tokens";
import styles from "./StatusPill.module.css";

interface StatusPillProps {
  tone: SemanticTone;
  label: string;
  variant?: "badge" | "pill";
}

export function StatusPill({ tone, label, variant = "badge" }: StatusPillProps) {
  const palette = tonePalette[tone];

  return (
    <span
      className={variant === "pill" ? styles.pill : styles.badge}
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      {label}
    </span>
  );
}
