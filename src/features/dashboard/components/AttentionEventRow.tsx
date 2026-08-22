import { Link } from "react-router-dom";
import { StatusPill } from "../../../design-system/StatusPill";
import { severityTone } from "../../../design-system/statusTone";
import type { WeatherEvent } from "../../../types/event";
import styles from "./AttentionEventRow.module.css";

interface AttentionEventRowProps {
  event: WeatherEvent;
}

export function AttentionEventRow({ event }: AttentionEventRowProps) {
  return (
    <Link to={`/eventos/${event.id}`} className={styles.row}>
      <span className={styles.info}>
        <span className={styles.tagTimeGroup}>
          <StatusPill tone={severityTone(event.severidade)} label={event.severidade} />
          <span className={styles.time}>{event.detectadoEm}</span>
        </span>
        <span className={styles.textGroup}>
          <span className={styles.tipo}>{event.tipo}</span>
          <span className={styles.meta}>{event.regiao}</span>
        </span>
      </span>
      <span className={styles.count}>{event.segurados.toLocaleString("pt-BR")} segurados</span>
    </Link>
  );
}
