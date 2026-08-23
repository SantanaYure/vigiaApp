import { useAsyncData } from "../../hooks/useAsyncData";
import { getActiveEvents } from "../../services/eventsService";
import { getAllCommunications } from "../../services/communicationsService";
import type { CommunicationWithEvent } from "../../types/communication";
import type { Severity, WeatherEvent } from "../../types/event";

export interface DashboardData {
  kpiEventosAtivos: number;
  kpiSegurados: number;
  kpiComunicacoes: number;
  kpiSimuladas: number;
  attentionEvents: WeatherEvent[];
  recentCommunications: CommunicationWithEvent[];
}

const SEVERITY_RANK: Record<Severity, number> = {
  Crítico: 0,
  Alto: 1,
  Moderado: 2,
  Baixo: 3,
};

function bySeverity(events: WeatherEvent[]): WeatherEvent[] {
  return [...events].sort((a, b) => SEVERITY_RANK[a.severidade] - SEVERITY_RANK[b.severidade]);
}

async function loadDashboardData(): Promise<DashboardData> {
  const [activeEvents, allCommunications] = await Promise.all([getActiveEvents(), getAllCommunications()]);

  return {
    kpiEventosAtivos: activeEvents.length,
    kpiSegurados: activeEvents.reduce((total, event) => total + event.segurados, 0),
    kpiComunicacoes: allCommunications.length,
    kpiSimuladas: allCommunications.filter((communication) => communication.status === "Simulada").length,
    attentionEvents: bySeverity(activeEvents).slice(0, 3),
    recentCommunications: allCommunications.slice(0, 3),
  };
}

export function useDashboardData() {
  return useAsyncData(loadDashboardData, []);
}
