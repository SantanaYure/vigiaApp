import { StatusPill } from "../../../design-system/StatusPill";
import { communicationStatusTone, severityTone } from "../../../design-system/statusTone";
import { MessageEditorCard } from "../../communications/components/MessageEditorCard";
import type { useMessageEditor } from "../../communications/useMessageEditor";
import type { CommunicationWithEvent } from "../../../types/communication";
import type { Customer } from "../../../types/customer";
import type { WeatherEvent } from "../../../types/event";
import styles from "./EventDetailPanel.module.css";

interface EventDetailPanelProps {
  event: WeatherEvent;
  communication: CommunicationWithEvent | null;
  customers: Customer[];
  messageEditor: ReturnType<typeof useMessageEditor>;
}

export function EventDetailPanel({ event, communication, customers, messageEditor }: EventDetailPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>{event.tipo}</p>
          <p className={styles.subtitle}>
            {event.regiao} · detectado às {event.detectadoEm} · previsão: {event.previsao}
          </p>
        </div>
        <StatusPill tone={severityTone(event.severidade)} label={event.severidade} />
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Regra aplicada</p>
        <p className={styles.sectionText}>{event.regra}</p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Por que estes segurados?</p>
        <div className={styles.whyList}>
          <p className={styles.whyLine}>
            {event.tipo} detectado em {event.regiao}
          </p>
          <p className={styles.whyLineMuted}>+ cliente possui {event.tipoSeguro}</p>
          <p className={styles.whyLineMuted}>+ endereço associado à área afetada</p>
          <p className={styles.whyLineStrong}>
            → {event.segurados.toLocaleString("pt-BR")} segurados elegíveis para comunicação
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Segurados impactados</p>
        <ul className={styles.customerList}>
          {customers.map((customer) => (
            <li key={customer.apolice} className={styles.customerRow}>
              <div>
                <p className={styles.customerName}>{customer.nome}</p>
                <p className={styles.customerMeta}>
                  {customer.apolice} · {customer.regiao}
                </p>
              </div>
              <StatusPill
                tone={communicationStatusTone(customer.statusComunicacao)}
                label={customer.statusComunicacao}
              />
            </li>
          ))}
        </ul>
      </div>

      {communication ? (
        <div className={styles.sectionLast}>
          <p className={styles.sectionLabel}>Comunicação preventiva</p>
          <MessageEditorCard
            communication={communication}
            text={messageEditor.text}
            isEditing={messageEditor.isEditing}
            onToggleEdit={messageEditor.onToggleEdit}
            onTextChange={messageEditor.onTextChange}
            onRegenerate={messageEditor.onRegenerate}
            onRequestSimulate={messageEditor.onRequestSimulate}
          />
        </div>
      ) : null}
    </div>
  );
}
