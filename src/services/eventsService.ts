import { eventsMock } from "../mocks/events";
import type { WeatherEvent } from "../types/event";
import { simulateDelay } from "./simulateDelay";

function listActiveEvents(): WeatherEvent[] {
  return eventsMock.filter((event) => event.status !== "Encerrado");
}

export async function getActiveEvents(): Promise<WeatherEvent[]> {
  return simulateDelay(listActiveEvents());
}
