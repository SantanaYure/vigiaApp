import { tonePalette, type SemanticTone } from "./tokens";
import styles from "./Toast.module.css";

interface ToastProps {
  tone: SemanticTone;
  message: string;
}

/**
 * Background/text use the tone's text/bg colors inverted (not bg/text
 * directly) — this is what makes a success toast solid green instead of a
 * pale green tint, per the Design System update (tags/toasts no longer use
 * a dot; toasts take the color of the notification they represent).
 */
export function Toast({ tone, message }: ToastProps) {
  const palette = tonePalette[tone];

  return (
    <div className={styles.toast} style={{ backgroundColor: palette.text, color: palette.bg }} role="status">
      {message}
    </div>
  );
}
