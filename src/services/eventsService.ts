import { getRealEvents } from "./realEventsSource";
import type { WeatherEvent } from "../types/event";

export async function getAllEvents(): Promise<WeatherEvent[]> {
  return getRealEvents();
}

export async function getActiveEvents(): Promise<WeatherEvent[]> {
  const events = await getRealEvents();
  return events.filter((event) => event.status !== "Encerrado");
}

export async function getEventById(id: string): Promise<WeatherEvent | null> {
  const events = await getRealEvents();
  return events.find((event) => event.id === id) ?? null;
}
