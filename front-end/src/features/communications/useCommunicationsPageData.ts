import { useAsyncData } from "../../hooks/useAsyncData";
import { getAllCommunications } from "../../services/communicationsService";
import { getAllEvents } from "../../services/eventsService";
import type { CommunicationWithEvent } from "../../types/communication";
import type { WeatherEvent } from "../../types/event";

export interface CommunicationsPageData {
  communications: CommunicationWithEvent[];
  eventsById: Record<string, WeatherEvent>;
}

async function loadCommunicationsPageData(): Promise<CommunicationsPageData> {
  const [communications, events] = await Promise.all([getAllCommunications(), getAllEvents()]);

  const eventsById: Record<string, WeatherEvent> = {};
  for (const event of events) {
    eventsById[event.id] = event;
  }

  return { communications, eventsById };
}

export function useCommunicationsPageData() {
  return useAsyncData(loadCommunicationsPageData, []);
}
