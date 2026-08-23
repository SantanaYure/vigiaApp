import { Link } from "react-router-dom";
import { StatusPill } from "../../../design-system/StatusPill";
import { communicationStatusTone } from "../../../design-system/statusTone";
import type { CommunicationWithEvent } from "../../../types/communication";
import styles from "./CommunicationRow.module.css";

interface CommunicationRowProps {
  communication: CommunicationWithEvent;
  isSelected: boolean;
}

export function CommunicationRow({ communication, isSelected }: CommunicationRowProps) {
  return (
    <li>
      <Link
        to={isSelected ? "/comunicacoes" : `/comunicacoes/${communication.id}`}
        className={isSelected ? `${styles.row} ${styles.rowSelected}` : styles.row}
      >
        <span className={styles.textGroup}>
          <span className={styles.tipo}>{communication.eventoTipo}</span>
          <span className={styles.meta}>
            {communication.canal} · {communication.segurados.toLocaleString("pt-BR")} segurados
          </span>
        </span>
        <StatusPill tone={communicationStatusTone(communication.status)} label={communication.status} />
      </Link>
    </li>
  );
}
