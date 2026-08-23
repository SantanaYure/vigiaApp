import type { ChangeEvent } from "react";
import { StatusPill } from "../../../design-system/StatusPill";
import { communicationStatusTone } from "../../../design-system/statusTone";
import type { CommunicationWithEvent } from "../../../types/communication";
import styles from "./MessageEditorCard.module.css";

interface MessageEditorCardProps {
  communication: CommunicationWithEvent;
  text: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onTextChange: (text: string) => void;
  onRegenerate: () => void;
  onRequestSimulate: () => void;
}

export function MessageEditorCard({
  communication,
  text,
  isEditing,
  onToggleEdit,
  onTextChange,
  onRegenerate,
  onRequestSimulate,
}: MessageEditorCardProps) {
  function handleTextareaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onTextChange(event.target.value);
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.canal}>{communication.canal}</span>
        <StatusPill tone={communicationStatusTone(communication.status)} label={communication.status} />
      </div>
      <div className={styles.body}>
        {isEditing ? (
          <textarea className={styles.textarea} value={text} onChange={handleTextareaChange} rows={4} />
        ) : (
          <p className={styles.text}>{text}</p>
        )}
      </div>
      <div className={styles.footer}>
        <button type="button" className={styles.secondaryButton} onClick={onToggleEdit}>
          {isEditing ? "Concluir edição" : "Editar"}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onRegenerate}>
          Regenerar
        </button>
        <button type="button" className={styles.primaryButton} onClick={onRequestSimulate}>
          Simular envio
        </button>
      </div>
    </div>
  );
}
