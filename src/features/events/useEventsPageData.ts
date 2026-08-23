import { useAsyncData } from "../../hooks/useAsyncData";
import { getAllCommunications } from "../../services/communicationsService";
import { getAllEvents } from "../../services/eventsService";
import type { CommunicationWithEvent } from "../../types/communication";
import type { WeatherEvent } from "../../types/event";

export interface EventsPageData {
  events: WeatherEvent[];
  communicationsByEventId: Record<string, CommunicationWithEvent>;
}

async function loadEventsPageData(): Promise<EventsPageData> {
  const [events, communications] = await Promise.all([getAllEvents(), getAllCommunications()]);

  const communicationsByEventId: Record<string, CommunicationWithEvent> = {};
  for (const communication of communications) {
    communicationsByEventId[communication.eventId] = communication;
  }

  return { events, communicationsByEventId };
}

export function useEventsPageData() {
  return useAsyncData(loadEventsPageData, []);
}
