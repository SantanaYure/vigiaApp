import { useAsyncData } from "../../hooks/useAsyncData";
import { getActiveEvents } from "../../services/eventsService";
import { getAllCommunications } from "../../services/communicationsService";
import type { CommunicationWithEvent } from "../../types/communication";
import type { WeatherEvent } from "../../types/event";

export interface DashboardData {
  kpiEventosAtivos: number;
  kpiSegurados: number;
  kpiComunicacoes: number;
  kpiSimuladas: number;
  attentionEvents: WeatherEvent[];
  recentCommunications: CommunicationWithEvent[];
}

async function loadDashboardData(): Promise<DashboardData> {
  const [activeEvents, allCommunications] = await Promise.all([getActiveEvents(), getAllCommunications()]);

  return {
    kpiEventosAtivos: activeEvents.length,
    kpiSegurados: activeEvents.reduce((total, event) => total + event.segurados, 0),
    kpiComunicacoes: allCommunications.length,
    kpiSimuladas: allCommunications.filter((communication) => communication.status === "Simulada").length,
    attentionEvents: activeEvents.slice(0, 3),
    recentCommunications: allCommunications.slice(0, 3),
  };
}

export function useDashboardData() {
  return useAsyncData(loadDashboardData, []);
}
