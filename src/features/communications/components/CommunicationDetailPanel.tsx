import { MessageEditorCard } from "./MessageEditorCard";
import type { useMessageEditor } from "../useMessageEditor";
import type { CommunicationWithEvent } from "../../../types/communication";
import type { WeatherEvent } from "../../../types/event";
import styles from "./CommunicationDetailPanel.module.css";

interface CommunicationDetailPanelProps {
  communication: CommunicationWithEvent;
  event: WeatherEvent | null;
  messageEditor: ReturnType<typeof useMessageEditor>;
}

export function CommunicationDetailPanel({ communication, event, messageEditor }: CommunicationDetailPanelProps) {
  // When the event hasn't loaded yet, fall back to the communication's own eventoTipo — but append
  // an ellipsis rather than repeating it verbatim. The header title above already renders this exact
  // string, so an unmarked duplicate would be an indistinguishable pair of text nodes (bad for anyone
  // using an accessibility tree, and for tests that query by text); the ellipsis also usefully signals
  // that the fuller context is still on its way.
  const contexto = event
    ? `${event.tipo} · ${event.severidade} · ${event.regiao} — ${event.regra}`
    : `${communication.eventoTipo}…`;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.title}>{communication.eventoTipo}</p>
        <p className={styles.subtitle}>
          {event ? `${event.regiao} · ` : ""}
          {communication.canal} · gerada às {communication.geradoEm}
        </p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Contexto do risco</p>
        <p className={styles.sectionText}>{contexto}</p>
      </div>

      <div className={styles.recipientsRow}>
        <span className={styles.recipientsLabel}>Destinatários</span>
        <span className={styles.recipientsValue}>{communication.segurados.toLocaleString("pt-BR")} segurados</span>
      </div>

      <div className={styles.sectionLast}>
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
    </div>
  );
}
