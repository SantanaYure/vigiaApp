import { StatusPill } from "../../design-system/StatusPill";
import { monitoringTone } from "../../design-system/statusTone";
import { useMonitoringStatus } from "../../hooks/useMonitoringStatus";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const monitoring = useMonitoringStatus();

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <div className={styles.statusGroup}>
        <StatusPill tone={monitoringTone(monitoring.state)} label={monitoring.label} variant="pill" />
        <span className={styles.lastUpdate}>{monitoring.lastUpdateLabel}</span>
      </div>
    </header>
  );
}
