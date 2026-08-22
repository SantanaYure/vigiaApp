import { Badge } from "../ui/Badge";
import { getPriorityMeta, getStatusMeta } from "../../utils/riskUtils";
import "./Table.css";

export function RulesTable({ rules }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Evento</th>
            <th>Condição</th>
            <th>Produto de seguro</th>
            <th>Ação</th>
            <th>Prioridade</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((rule) => {
            const priority = getPriorityMeta(rule.prioridade);
            const status = getStatusMeta(rule.status);
            return (
              <tr key={rule.id}>
                <td>
                  <div className="data-table-primary">{rule.evento}</div>
                  <div className="data-table-secondary">{rule.id}</div>
                </td>
                <td>{rule.condicao}</td>
                <td>
                  <div className="chip-group">
                    {rule.produtoSeguro.map((produto) => (
                      <span key={produto} className="chip">
                        {produto}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{rule.acao}</td>
                <td>
                  <Badge label={priority.label} color={priority.color} bg={priority.bg} />
                </td>
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
