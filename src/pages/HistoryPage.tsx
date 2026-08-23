import { useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { AlertBanner } from "../design-system/AlertBanner";
import { EmptyState } from "../design-system/EmptyState";
import { Panel } from "../design-system/Panel";
import { Skeleton } from "../design-system/Skeleton";
import { StatusPill } from "../design-system/StatusPill";
import { communicationStatusTone } from "../design-system/statusTone";
import { useHistoryData } from "../features/history/useHistoryData";
import type { CommunicationStatus } from "../types/communication";
import styles from "./HistoryPage.module.css";

const STATUS_OPTIONS: { value: CommunicationStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os status" },
  { value: "Aguardando revisão", label: "Aguardando revisão" },
  { value: "Revisada", label: "Revisada" },
  { value: "Simulada", label: "Simulada" },
  { value: "Erro", label: "Erro" },
];

export function HistoryPage() {
  const { data, loading, error, reload } = useHistoryData();
  const [statusFilter, setStatusFilter] = useState<CommunicationStatus | "todos">("todos");

  const filteredHistory = data?.filter((entry) => statusFilter === "todos" || entry.status === statusFilter) ?? [];

  return (
    <div>
      <PageHeader title="Histórico" subtitle="Registro de eventos, comunicações e simulações de envio" />

      {loading && !data ? (
        <div className={styles.skeletonGroup}>
          <Skeleton height={40} />
          <Skeleton height={160} />
        </div>
      ) : null}

      {error ? (
        <AlertBanner
          title="Não foi possível carregar o histórico"
          description="Tente novamente em alguns instantes."
          action={
            <button type="button" className={styles.retryButton} onClick={reload}>
              Tentar novamente
            </button>
          }
        />
      ) : null}

      {data ? (
        <>
          <div className={styles.filters}>
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as CommunicationStatus | "todos")}
              aria-label="Filtrar por status"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {filteredHistory.length === 0 ? (
            <EmptyState
              title="Nenhum registro encontrado"
              description="Ajuste o filtro de status para ver mais resultados."
            />
          ) : (
            <Panel>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Evento</th>
                      <th className={styles.th}>Região</th>
                      <th className={styles.th}>Segurados</th>
                      <th className={styles.th}>Comunicação</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Horário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((entry) => (
                      <tr key={entry.id}>
                        <td className={styles.td}>{entry.eventoTipo}</td>
                        <td className={styles.td}>{entry.regiao}</td>
                        <td className={styles.td}>{entry.segurados.toLocaleString("pt-BR")}</td>
                        <td className={styles.td}>{entry.canal}</td>
                        <td className={styles.td}>
                          <StatusPill tone={communicationStatusTone(entry.status)} label={entry.status} />
                        </td>
                        <td className={styles.td}>{entry.horario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </>
      ) : null}
    </div>
  );
}
