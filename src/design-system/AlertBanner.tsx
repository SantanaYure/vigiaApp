import type { ReactNode } from "react";
import { tonePalette, type SemanticTone } from "./tokens";
import styles from "./AlertBanner.module.css";

interface AlertBannerProps {
  tone?: SemanticTone;
  title: string;
  description: string;
  action?: ReactNode;
}

export function AlertBanner({ tone = "danger", title, description, action }: AlertBannerProps) {
  const palette = tonePalette[tone];

  return (
    <div className={styles.banner} style={{ backgroundColor: palette.bg, borderColor: palette.dot }} role="alert">
      <span className={styles.dot} style={{ backgroundColor: palette.dot }} />
      <div className={styles.textGroup}>
        <p className={styles.title} style={{ color: palette.text }}>
          {title}
        </p>
        <p className={styles.description}>{description}</p>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
