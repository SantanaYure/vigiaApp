import { useEffect, useState } from "react";
import {
  getCommunicationText,
  regenerateCommunicationText,
  simulateCommunicationSend,
  updateCommunicationText,
} from "../../services/communicationsService";

const TOAST_DURATION_MS = 3000;

export function useMessageEditor(communicationId: string | null, onSimulated: () => void) {
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsEditing(false);
    setIsConfirmOpen(false);

    if (!communicationId) {
      setText("");
      return;
    }

    let active = true;
    getCommunicationText(communicationId).then((value) => {
      if (active) setText(value);
    });
    return () => {
      active = false;
    };
  }, [communicationId]);

  function onTextChange(value: string) {
    setText(value);
    if (communicationId) {
      updateCommunicationText(communicationId, value);
    }
  }

  function onToggleEdit() {
    setIsEditing((prev) => !prev);
  }

  async function onRegenerate() {
    if (!communicationId) return;
    await regenerateCommunicationText(communicationId);
    const value = await getCommunicationText(communicationId);
    setText(value);
  }

  function onRequestSimulate() {
    setIsConfirmOpen(true);
  }

  function onCancelSimulate() {
    setIsConfirmOpen(false);
  }

  async function onConfirmSimulate() {
    if (!communicationId) return;
    await simulateCommunicationSend(communicationId);
    setIsConfirmOpen(false);
    setToastMessage("Envio simulado com sucesso");
    onSimulated();
    setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
  }

  return {
    text,
    isEditing,
    isConfirmOpen,
    toastMessage,
    onToggleEdit,
    onTextChange,
    onRegenerate,
    onRequestSimulate,
    onCancelSimulate,
    onConfirmSimulate,
  };
}
