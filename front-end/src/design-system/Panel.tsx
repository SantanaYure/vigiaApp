import type { CSSProperties, PropsWithChildren } from "react";
import styles from "./Panel.module.css";

interface PanelProps {
  padded?: boolean;
  style?: CSSProperties;
}

export function Panel({ children, padded = false, style }: PropsWithChildren<PanelProps>) {
  return (
    <div className={padded ? `${styles.panel} ${styles.padded}` : styles.panel} style={style}>
      {children}
    </div>
  );
}
