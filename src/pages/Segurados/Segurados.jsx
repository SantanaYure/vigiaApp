import { useCallback, useEffect, useState } from "react";
import { UserPlus, UploadCloud, CheckCircle2 } from "lucide-react";
import { SearchInput } from "../../components/ui/SearchInput";
import { SelectFilter } from "../../components/ui/SelectFilter";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";
import { EmptyState } from "../../components/ui/EmptyState";
import { InsuredTable } from "../../components/tables/InsuredTable";
import { useAsyncData } from "../../hooks/useAsyncData";
import * as insuredService from "../../services/insuredService";
import { CIDADES_DISPONIVEIS, TIPOS_SEGURO, STATUS_SEGURADO } from "../../mocks/insuredMock";
import "./Segurados.css";

const STATUS_OPTIONS = STATUS_SEGURADO.map((status) => ({
  value: status,
  label: status.charAt(0).toUpperCase() + status.slice(1),
}));

export default function Segurados() {
  const [search, setSearch] = useState("");
  const [cidade, setCidade] = useState("");
  const [tipoSeguro, setTipoSeguro] = useState("");
  const [status, setStatus] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetcher = useCallback(
    () => insuredService.getInsured({ search, cidade, tipoSeguro, status }),
    [search, cidade, tipoSeguro, status]
  );
  const { data: insured, loading, error, reload } = useAsyncData(fetcher, [fetcher]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const handleNewInsured = async () => {
    setActionLoading(true);
    try {
      await insuredService.createInsured({
        nome: "Novo Segurado",
        cidade: "São Paulo",
        tipoSeguro: "Residencial",
        coberturas: ["Vendaval"],
        canalPreferencial: "WhatsApp",
      });
      setFeedback("Segurado de exemplo cadastrado. O formulário completo será disponibilizado com a integração ao backend.");
      reload();
    } finally {
      setActionLoading(false);
    }
  };

  const handleImport = async () => {
    setActionLoading(true);
    try {
      await insuredService.importInsuredBase();
      setFeedback("Importação preparada. A integração com bases externas será habilitada futuramente.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="segurados-page">
      <div className="segurados-toolbar">
        <div className="segurados-filters">
          <SearchInput value={search} onChange={setSearch} placeholder="Pesquisar por nome ou ID..." />
          <SelectFilter value={cidade} onChange={setCidade} options={CIDADES_DISPONIVEIS} placeholder="Todas as cidades" />
          <SelectFilter value={tipoSeguro} onChange={setTipoSeguro} options={TIPOS_SEGURO} placeholder="Todos os seguros" />
          <SelectFilter value={status} onChange={setStatus} options={STATUS_OPTIONS} placeholder="Todos os status" />
        </div>

        <div className="segurados-toolbar-actions">
          <Button variant="secondary" icon={UploadCloud} onClick={handleImport} disabled={actionLoading}>
            Importar Base
          </Button>
          <Button variant="primary" icon={UserPlus} onClick={handleNewInsured} disabled={actionLoading}>
            Novo Segurado
          </Button>
        </div>
      </div>

      {feedback ? (
        <div className="segurados-feedback">
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      ) : null}

      {loading && !insured ? (
        <LoadingState label="Carregando segurados..." />
      ) : error && !insured ? (
        <ErrorState onRetry={reload} />
      ) : insured && insured.length === 0 ? (
        <EmptyState title="Nenhum segurado encontrado" description="Ajuste os filtros ou o termo de pesquisa." />
      ) : insured ? (
        <div className={loading ? "segurados-table-refreshing" : undefined}>
          <InsuredTable insured={insured} />
        </div>
      ) : null}
    </div>
  );
}
