import { Badge } from "../ui/Badge";
import { getStatusMeta } from "../../utils/riskUtils";
import { formatDateTime } from "../../utils/formatters";
import "./Table.css";

export function NotificationsTable({ notifications, selectedId, onSelect }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Data e hora</th>
            <th>Segurado</th>
            <th>Evento</th>
            <th>Canal</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((item) => {
            const status = getStatusMeta(item.status);
            const isSelected = item.id === selectedId;
            return (
              <tr
                key={item.id}
                className={`data-table-row-clickable${isSelected ? " data-table-row-selected" : ""}`}
                onClick={() => onSelect(item)}
              >
                <td>{formatDateTime(item.dataHora)}</td>
                <td>
                  <div className="data-table-primary">{item.segurado}</div>
                  <div className="data-table-secondary">{item.cidade}</div>
                </td>
                <td>{item.evento}</td>
                <td>{item.canal}</td>
                <td>
                  <Badge label={status.label} color={status.color} bg={status.bg} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
