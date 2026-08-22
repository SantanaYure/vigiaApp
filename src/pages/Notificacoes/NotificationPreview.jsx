import { MessageSquareText, User, MapPin, Radio } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { getStatusMeta } from "../../utils/riskUtils";
import { formatDateTime } from "../../utils/formatters";
import "./NotificationPreview.css";

export function NotificationPreview({ notification }) {
  if (!notification) {
    return (
      <div className="notification-preview notification-preview-empty">
        <MessageSquareText size={26} strokeWidth={1.6} />
        <p>Selecione uma notificação na tabela para ver a pré-visualização da mensagem.</p>
      </div>
    );
  }

  const status = getStatusMeta(notification.status);

  return (
    <div className="notification-preview">
      <div className="notification-preview-header">
        <h3>Pré-visualização da mensagem</h3>
        <Badge label={status.label} color={status.color} bg={status.bg} />
      </div>

      <div className="notification-preview-meta">
        <span>
          <User size={13} /> {notification.segurado}
        </span>
        <span>
          <MapPin size={13} /> {notification.cidade}
        </span>
        <span>
          <Radio size={13} /> {notification.canal}
        </span>
      </div>

      <div className="notification-preview-channel">
        <div className="notification-preview-bubble">{notification.mensagem}</div>
      </div>

      <div className="notification-preview-footer">
        <span>Evento: {notification.evento}</span>
        <span>{formatDateTime(notification.dataHora)}</span>
      </div>
    </div>
  );
}
