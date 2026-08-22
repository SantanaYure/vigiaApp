import { tonePalette, type SemanticTone } from "./tokens";
import styles from "./StatusPill.module.css";

interface StatusPillProps {
  tone: SemanticTone;
  label: string;
  spin?: boolean;
  variant?: "badge" | "pill";
}

export function StatusPill({ tone, label, spin = false, variant = "badge" }: StatusPillProps) {
  const palette = tonePalette[tone];
  const dotClassName = spin ? styles.dotSpin : variant === "pill" ? styles.dotLarge : styles.dot;

  return (
    <span
      className={variant === "pill" ? styles.pill : styles.badge}
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      <span className={dotClassName} style={spin ? undefined : { backgroundColor: palette.dot }} />
      {label}
    </span>
  );
}
