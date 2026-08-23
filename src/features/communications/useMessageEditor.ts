import { useEffect, useRef, useState } from "react";
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
  // Kept in sync every render (not in an effect) so in-flight async handlers
  // below can tell, after an `await`, whether the selection has since moved
  // on to a different communication and their result should be discarded.
  const currentIdRef = useRef(communicationId);
  currentIdRef.current = communicationId;
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsEditing(false);
    setIsConfirmOpen(false);
    // Clear immediately on every id change (not only to null) — otherwise the
    // previous communication's text stays on screen for the ~350ms it takes
    // the new one to load, which reads as a mismatch against the header
    // (channel/status), which updates immediately from the parent's data.
    setText("");

    if (!communicationId) {
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

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

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
    const requestId = communicationId;
    await regenerateCommunicationText(requestId);
    const value = await getCommunicationText(requestId);
    if (currentIdRef.current === requestId) {
      setText(value);
    }
  }

  function onRequestSimulate() {
    setIsConfirmOpen(true);
  }

  function onCancelSimulate() {
    setIsConfirmOpen(false);
  }

  async function onConfirmSimulate() {
    if (!communicationId) return;
    const requestId = communicationId;
    await simulateCommunicationSend(requestId);
    setIsConfirmOpen(false);
    onSimulated();

    if (currentIdRef.current === requestId) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToastMessage("Envio simulado com sucesso");
      toastTimeoutRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    }
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
