import type { HistoryEntry } from "../types/history";
import { simulateDelay } from "./simulateDelay";

/** Não há fonte real de histórico ainda — entradas só existem quando `appendHistoryEntry` as cria. */
let historyStore: HistoryEntry[] = [];

export async function getHistory(): Promise<HistoryEntry[]> {
  return simulateDelay(historyStore);
}

/** Internal write path — called only by communicationsService.simulateCommunicationSend. */
export function appendHistoryEntry(entry: HistoryEntry): void {
  historyStore = [entry, ...historyStore];
}
