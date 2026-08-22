import { Eye, Pencil } from "lucide-react";
import { Badge } from "../ui/Badge";
import { getStatusMeta } from "../../utils/riskUtils";
import "./Table.css";

export function InsuredTable({ insured }) {
  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Cidade</th>
            <th>Tipo de seguro</th>
            <th>Coberturas</th>
            <th>Canal preferencial</th>
            <th>Status</th>
            <th className="data-table-actions-col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {insured.map((item) => {
            const status = getStatusMeta(item.status);
            return (
              <tr key={item.id}>
                <td>
                  <div className="data-table-primary">{item.nome}</div>
                  <div className="data-table-secondary">{item.id}</div>
                </td>
                <td>{item.cidade}</td>
                <td>{item.tipoSeguro}</td>
                <td>
                  <div className="chip-group">
                    {item.coberturas.map((cobertura) => (
                      <span key={cobertura} className="chip">
                        {cobertura}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{item.canalPreferencial}</td>
                <td>
                  <Badge label={status.label} color={status.color} bg={status.bg} />
                </td>
                <td className="data-table-actions-col">
                  <div className="data-table-actions">
                    <button type="button" className="icon-btn" title="Visualizar segurado (em breve)">
                      <Eye size={16} />
                    </button>
                    <button type="button" className="icon-btn" title="Editar segurado (em breve)">
                      <Pencil size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
