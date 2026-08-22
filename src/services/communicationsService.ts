import { communicationsMock } from "../mocks/communications";
import { communicationMessages, communicationRegenAlternatives } from "../mocks/communicationMessages";
import { eventsMock } from "../mocks/events";
import type { Communication, CommunicationWithEvent } from "../types/communication";
import type { HistoryEntry } from "../types/history";
import { appendHistoryEntry } from "./historyService";
import { simulateDelay } from "./simulateDelay";

let communicationsStore: Communication[] = communicationsMock.map((c) => ({ ...c }));
const editedTextsStore: Record<string, string> = {};

function withEventoTipo(communication: Communication): CommunicationWithEvent {
  const event = eventsMock.find((e) => e.id === communication.eventId);
  return { ...communication, eventoTipo: event ? event.tipo : "Evento desconhecido" };
}

function listAllCommunications(): CommunicationWithEvent[] {
  return communicationsStore.map(withEventoTipo);
}

export async function getAllCommunications(): Promise<CommunicationWithEvent[]> {
  return simulateDelay(listAllCommunications());
}

export async function getCommunicationById(id: string): Promise<CommunicationWithEvent | null> {
  const communication = communicationsStore.find((c) => c.id === id);
  return simulateDelay(communication ? withEventoTipo(communication) : null);
}

export async function getCommunicationText(id: string): Promise<string> {
  const text = editedTextsStore[id] ?? communicationMessages[id] ?? "";
  return simulateDelay(text);
}

export async function updateCommunicationText(id: string, text: string): Promise<void> {
  editedTextsStore[id] = text;
  return simulateDelay(undefined);
}

export async function regenerateCommunicationText(id: string): Promise<void> {
  const alternative = communicationRegenAlternatives[id];
  if (alternative) {
    editedTextsStore[id] = alternative;
  }
  return simulateDelay(undefined);
}

export async function simulateCommunicationSend(id: string): Promise<void> {
  const communication = communicationsStore.find((c) => c.id === id);
  if (!communication) {
    return simulateDelay(undefined);
  }

  communicationsStore = communicationsStore.map((c) => (c.id === id ? { ...c, status: "Simulada" as const } : c));

  const event = eventsMock.find((e) => e.id === communication.eventId);
  const entry: HistoryEntry = {
    id: `h-${Date.now()}`,
    eventoTipo: event ? event.tipo : "Evento desconhecido",
    regiao: event ? event.regiao : "",
    segurados: communication.segurados,
    canal: communication.canal,
    status: "Simulada",
    horario: "agora",
  };
  appendHistoryEntry(entry);

  return simulateDelay(undefined);
}
