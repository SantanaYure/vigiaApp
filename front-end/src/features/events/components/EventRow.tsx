import { Link } from "react-router-dom";
import { StatusPill } from "../../../design-system/StatusPill";
import { severityTone } from "../../../design-system/statusTone";
import type { WeatherEvent } from "../../../types/event";
import styles from "./EventRow.module.css";

interface EventRowProps {
  event: WeatherEvent;
  isSelected: boolean;
}

export function EventRow({ event, isSelected }: EventRowProps) {
  return (
    <li>
      <Link
        to={isSelected ? "/eventos" : `/eventos/${event.id}`}
        className={isSelected ? `${styles.row} ${styles.rowSelected}` : styles.row}
      >
        <span className={styles.textGroup}>
          <span className={styles.tipo}>{event.tipo}</span>
          <span className={styles.meta}>
            {event.regiao} · {event.status} · {event.detectadoEm}
          </span>
        </span>
        <span className={styles.statsGroup}>
          <StatusPill tone={severityTone(event.severidade)} label={event.severidade} />
          <span className={styles.count}>{event.segurados.toLocaleString("pt-BR")} segurados</span>
        </span>
      </Link>
    </li>
  );
}
