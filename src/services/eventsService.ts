import { eventsMock } from "../mocks/events";
import type { WeatherEvent } from "../types/event";
import { simulateDelay } from "./simulateDelay";

function listActiveEvents(): WeatherEvent[] {
  return eventsMock.filter((event) => event.status !== "Encerrado");
}

export async function getActiveEvents(): Promise<WeatherEvent[]> {
  return simulateDelay(listActiveEvents());
}

export async function getEventById(id: string): Promise<WeatherEvent | null> {
  const event = eventsMock.find((e) => e.id === id) ?? null;
  return simulateDelay(event);
}

export async function getAllEvents(): Promise<WeatherEvent[]> {
  return simulateDelay(eventsMock);
}
