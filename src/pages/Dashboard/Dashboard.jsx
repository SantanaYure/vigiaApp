import { useCallback, useState } from "react";
import { MapPin, CloudLightning, Users, BellRing, PlayCircle, Loader2 } from "lucide-react";
import { StatCard } from "../../components/cards/StatCard";
import { EventCard } from "../../components/cards/EventCard";
import { ExecutionItem } from "../../components/cards/ExecutionItem";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { useAsyncData } from "../../hooks/useAsyncData";
import * as weatherService from "../../services/weatherService";
import * as notificationService from "../../services/notificationService";
import "./Dashboard.css";

async function loadDashboardData() {
  const [regioes, eventos, execucoes, seguradosAfetados, stats] = await Promise.all([
    weatherService.getMonitoredRegions(),
    weatherService.getRecentEvents(),
    weatherService.getMonitoringRuns(),
    notificationService.getAffectedInsuredCount(),
    notificationService.getNotificationStats(),
  ]);
  return { regioes, eventos, execucoes, seguradosAfetados, stats };
}

export default function Dashboard() {
  const { data, loading, error, reload } = useAsyncData(loadDashboardData, []);
  const [running, setRunning] = useState(false);

  const handleRunMonitoring = useCallback(async () => {
    setRunning(true);
    try {
      await weatherService.runMonitoring();
      reload();
    } finally {
      setRunning(false);
    }
  }, [reload]);

  if (loading && !data) return <LoadingState label="Carregando painel de monitoramento..." />;
  if (error && !data) return <ErrorState onRetry={reload} />;
  if (!data) return null;

  const { regioes, eventos, execucoes, seguradosAfetados, stats } = data;

  return (
    <div className="dashboard">
      <div className="dashboard-stats">
        <StatCard icon={MapPin} label="Regiões monitoradas" value={regioes.length} accent="navy" />
        <StatCard icon={CloudLightning} label="Eventos detectados" value={eventos.length} accent="cyan" />
        <StatCard icon={Users} label="Segurados afetados" value={seguradosAfetados} accent="warning" />
        <StatCard icon={BellRing} label="Notificações geradas" value={stats.geradas} accent="success" />
      </div>

      <div className="dashboard-actions">
        <button type="button" className="run-monitoring-btn" onClick={handleRunMonitoring} disabled={running}>
          {running ? <Loader2 size={18} className="spin" /> : <PlayCircle size={18} />}
          <span>{running ? "Executando monitoramento..." : "Executar monitoramento"}</span>
        </button>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-section">
          <h2>Eventos recentes</h2>
          {eventos.length === 0 ? (
            <EmptyState title="Nenhum evento detectado" description="Execute o monitoramento para identificar novos eventos." />
          ) : (
            <div className="dashboard-list">
              {eventos.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <h2>Execuções recentes</h2>
          {execucoes.length === 0 ? (
            <EmptyState title="Nenhuma execução registrada" description="Ainda não há histórico de monitoramento." />
          ) : (
            <div className="dashboard-list">
              {execucoes.slice(0, 6).map((run) => (
                <ExecutionItem key={run.id} run={run} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
