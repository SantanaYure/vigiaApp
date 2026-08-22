import { historySeed } from "../mocks/history";
import type { HistoryEntry } from "../types/history";
import { simulateDelay } from "./simulateDelay";

let historyStore: HistoryEntry[] = [...historySeed];

export async function getHistory(): Promise<HistoryEntry[]> {
  return simulateDelay(historyStore);
}

/** Internal write path — called only by communicationsService.simulateCommunicationSend. */
export function appendHistoryEntry(entry: HistoryEntry): void {
  historyStore = [entry, ...historyStore];
}
