import { MapPin, CloudRain, Wind, CloudHail, Waves } from "lucide-react";
import { Badge } from "../ui/Badge";
import { getRiskMeta } from "../../utils/riskUtils";
import { formatTime } from "../../utils/formatters";
import "./EventCard.css";

const EVENT_ICONS = {
  "Chuva intensa": CloudRain,
  "Vento forte": Wind,
  Granizo: CloudHail,
  Alagamento: Waves,
};

export function EventCard({ event }) {
  const Icon = EVENT_ICONS[event.tipo] ?? CloudRain;
  const risk = getRiskMeta(event.nivelRisco);

  return (
    <div className="event-card">
      <div className="event-card-icon">
        <Icon size={18} strokeWidth={2} />
      </div>

      <div className="event-card-body">
        <div className="event-card-top">
          <span className="event-card-type">{event.tipo}</span>
          <Badge label={risk.label} color={risk.color} bg={risk.bg} />
        </div>
        <div className="event-card-meta">
          <span className="event-card-location">
            <MapPin size={13} /> {event.localizacao}
          </span>
          <span className="event-card-intensity">{event.intensidade}</span>
          <span className="event-card-time">{formatTime(event.horarioDeteccao)}</span>
        </div>
      </div>
    </div>
  );
}
