import { getAllEvents } from "./eventsService";
import { regenerarMensagem } from "./messageBackend";
import type { Communication, CommunicationWithEvent } from "../types/communication";
import type { HistoryEntry } from "../types/history";
import { appendHistoryEntry } from "./historyService";
import { simulateDelay } from "./simulateDelay";

/**
 * Ainda não existe geração real de comunicações (depende de regras de
 * negócio reais e de uma integração de IA — Pessoa 2 e Pessoa 3 do
 * Desafio 5, fora do escopo desta etapa). A lista começa vazia; quando a
 * geração real existir, ela alimenta este array pelas mesmas funções
 * abaixo, sem mudar a interface consumida pela UI.
 */
let communicationsStore: Communication[] = [];
const editedTextsStore: Record<string, string> = {};

async function listAllCommunications(): Promise<CommunicationWithEvent[]> {
  const events = await getAllEvents();
  const eventsById = new Map(events.map((event) => [event.id, event]));
  return communicationsStore.map((communication) => ({
    ...communication,
    eventoTipo: eventsById.get(communication.eventId)?.tipo ?? "Evento desconhecido",
  }));
}

export async function getAllCommunications(): Promise<CommunicationWithEvent[]> {
  return simulateDelay(await listAllCommunications());
}

export async function getCommunicationById(id: string): Promise<CommunicationWithEvent | null> {
  const communication = communicationsStore.find((c) => c.id === id);
  if (!communication) return simulateDelay(null);

  const events = await getAllEvents();
  const event = events.find((e) => e.id === communication.eventId);
  return simulateDelay({ ...communication, eventoTipo: event ? event.tipo : "Evento desconhecido" });
}

export async function getCommunicationText(id: string): Promise<string> {
  const text = editedTextsStore[id] ?? "";
  return simulateDelay(text);
}

export async function updateCommunicationText(id: string, text: string): Promise<void> {
  editedTextsStore[id] = text;
  return simulateDelay(undefined);
}

/**
 * Pede ao backend um novo texto para a comunicação. O backend ainda devolve
 * um stub (geração real via IA depende da Pessoa 3), mas a chamada em si é
 * real. Se o backend não responder, o texto atual é mantido — nunca falha
 * de forma visível para quem está editando.
 *
 * Não depende de a comunicação já estar em `communicationsStore` — usa o
 * evento associado quando existe, com fallback honesto quando não. Isso
 * mantém a integração com o backend testável mesmo antes de existir um
 * fluxo real de criação de comunicações.
 */
export async function regenerateCommunicationText(id: string): Promise<void> {
  const communication = communicationsStore.find((c) => c.id === id);
  const events = await getAllEvents();
  const event = communication ? events.find((e) => e.id === communication.eventId) : undefined;

  const texto = await regenerarMensagem({
    eventoTipo: event?.tipo ?? "Evento desconhecido",
    severidade: event?.severidade ?? "Baixo",
    regiao: event?.regiao ?? "região desconhecida",
  });

  if (texto !== null) {
    editedTextsStore[id] = texto;
  }

  return simulateDelay(undefined);
}

export async function simulateCommunicationSend(id: string): Promise<void> {
  const communication = communicationsStore.find((c) => c.id === id);
  if (!communication) {
    return simulateDelay(undefined);
  }

  communicationsStore = communicationsStore.map((c) => (c.id === id ? { ...c, status: "Simulada" as const } : c));

  const events = await getAllEvents();
  const event = events.find((e) => e.id === communication.eventId);
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
