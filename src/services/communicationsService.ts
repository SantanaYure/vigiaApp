import { communicationsMock } from "../mocks/communications";
import { eventsMock } from "../mocks/events";
import type { Communication, CommunicationWithEvent } from "../types/communication";
import { simulateDelay } from "./simulateDelay";

function withEventoTipo(communication: Communication): CommunicationWithEvent {
  const event = eventsMock.find((e) => e.id === communication.eventId);
  return { ...communication, eventoTipo: event ? event.tipo : "Evento desconhecido" };
}

function listAllCommunications(): CommunicationWithEvent[] {
  return communicationsMock.map(withEventoTipo);
}

export async function getAllCommunications(): Promise<CommunicationWithEvent[]> {
  return simulateDelay(listAllCommunications());
}
