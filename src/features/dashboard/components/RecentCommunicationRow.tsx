import { StatusPill } from "../../../design-system/StatusPill";
import { communicationStatusTone } from "../../../design-system/statusTone";
import type { CommunicationWithEvent } from "../../../types/communication";
import styles from "./RecentCommunicationRow.module.css";

interface RecentCommunicationRowProps {
  communication: CommunicationWithEvent;
}

export function RecentCommunicationRow({ communication }: RecentCommunicationRowProps) {
  return (
    <li className={styles.row}>
      <span className={styles.textGroup}>
        <span className={styles.tipo}>{communication.eventoTipo}</span>
        <span className={styles.meta}>
          {communication.canal} · {communication.segurados.toLocaleString("pt-BR")} segurados
        </span>
      </span>
      <StatusPill tone={communicationStatusTone(communication.status)} label={communication.status} />
    </li>
  );
}
