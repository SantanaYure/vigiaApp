import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { formatDateTime } from "../../utils/formatters";
import "./ExecutionItem.css";

const STATUS_ICON = {
  concluido: { icon: CheckCircle2, color: "var(--color-success)" },
  erro: { icon: XCircle, color: "var(--color-danger)" },
  "em-andamento": { icon: Clock, color: "var(--color-info)" },
};

export function ExecutionItem({ run }) {
  const statusVisual = STATUS_ICON[run.status] ?? STATUS_ICON.concluido;
  const StatusIcon = statusVisual.icon;

  return (
    <div className="execution-item">
      <StatusIcon size={18} color={statusVisual.color} strokeWidth={2} />
      <div className="execution-item-body">
        <div className="execution-item-top">
          <span className="execution-item-date">{formatDateTime(run.dataHora)}</span>
          <span className="execution-item-duration">{run.duracaoSegundos}s</span>
        </div>
        <p className="execution-item-summary">
          {run.regioesMonitoradas} regiões monitoradas · {run.eventosDetectados} eventos · {run.seguradosAfetados}{" "}
          segurados afetados · {run.notificacoesGeradas} notificações geradas
        </p>
      </div>
    </div>
  );
}
