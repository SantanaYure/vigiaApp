import { useCallback, useState } from "react";
import { FileText, Send, Clock3, Gauge } from "lucide-react";
import { StatCard } from "../../components/cards/StatCard";
import { SelectFilter } from "../../components/ui/SelectFilter";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { NotificationsTable } from "../../components/tables/NotificationsTable";
import { NotificationPreview } from "./NotificationPreview";
import { useAsyncData } from "../../hooks/useAsyncData";
import * as notificationService from "../../services/notificationService";
import { CANAIS_NOTIFICACAO, STATUS_NOTIFICACAO } from "../../mocks/notificationsMock";
import { formatPercent } from "../../utils/formatters";
import "./Notificacoes.css";

const STATUS_OPTIONS = STATUS_NOTIFICACAO.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}));

export default function Notificacoes() {
  const [canal, setCanal] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(null);

  const fetcher = useCallback(async () => {
    const [notifications, stats] = await Promise.all([
      notificationService.getNotifications({ canal, status }),
      notificationService.getNotificationStats(),
    ]);
    return { notifications, stats };
  }, [canal, status]);

  const { data, loading, error, reload } = useAsyncData(fetcher, [fetcher]);

  if (loading && !data) return <LoadingState label="Carregando notificações..." />;
  if (error && !data) return <ErrorState onRetry={reload} />;
  if (!data) return null;

  const { notifications, stats } = data;

  return (
    <div className="notificacoes-page">
      <div className="notificacoes-stats">
        <StatCard icon={FileText} label="Mensagens geradas" value={stats.geradas} accent="navy" />
        <StatCard icon={Send} label="Envios simulados" value={stats.enviadas} accent="success" />
        <StatCard icon={Clock3} label="Pendentes" value={stats.pendentes} accent="warning" />
        <StatCard icon={Gauge} label="Taxa de cobertura" value={formatPercent(stats.taxaCobertura)} accent="cyan" />
      </div>

      <div className="notificacoes-filters">
        <SelectFilter value={canal} onChange={setCanal} options={CANAIS_NOTIFICACAO} placeholder="Todos os canais" />
        <SelectFilter value={status} onChange={setStatus} options={STATUS_OPTIONS} placeholder="Todos os status" />
      </div>

      <div className="notificacoes-content">
        <div className="notificacoes-table-col">
          {notifications.length === 0 ? (
            <EmptyState title="Nenhuma notificação encontrada" description="Ajuste os filtros para ver outras mensagens." />
          ) : (
            <NotificationsTable notifications={notifications} selectedId={selected?.id} onSelect={setSelected} />
          )}
        </div>
        <div className="notificacoes-preview-col">
          <NotificationPreview notification={selected} />
        </div>
      </div>
    </div>
  );
}
