import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { AlertBanner } from "../design-system/AlertBanner";
import { EmptyState } from "../design-system/EmptyState";
import { Modal } from "../design-system/Modal";
import { Panel } from "../design-system/Panel";
import { Skeleton } from "../design-system/Skeleton";
import { Toast } from "../design-system/Toast";
import { CommunicationDetailPanel } from "../features/communications/components/CommunicationDetailPanel";
import { CommunicationRow } from "../features/communications/components/CommunicationRow";
import { useCommunicationsPageData } from "../features/communications/useCommunicationsPageData";
import { useMessageEditor } from "../features/communications/useMessageEditor";
import type { CommunicationStatus } from "../types/communication";
import styles from "./listDetailPage.module.css";

const STATUS_OPTIONS: { value: CommunicationStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os status" },
  { value: "Aguardando revisão", label: "Aguardando revisão" },
  { value: "Revisada", label: "Revisada" },
  { value: "Simulada", label: "Simulada" },
  { value: "Erro", label: "Erro" },
];

export function CommunicationsPage() {
  const { id: selectedId } = useParams<{ id?: string }>();
  const { data, loading, error, reload } = useCommunicationsPageData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CommunicationStatus | "todos">("todos");

  const selectedCommunication = data?.communications.find((c) => c.id === selectedId) ?? null;
  const selectedEvent = selectedCommunication ? (data?.eventsById[selectedCommunication.eventId] ?? null) : null;

  const messageEditor = useMessageEditor(selectedCommunication?.id ?? null, reload);

  const filteredCommunications =
    data?.communications.filter((communication) => {
      const query = search.trim().toLowerCase();
      const matchesQuery =
        !query ||
        communication.eventoTipo.toLowerCase().includes(query) ||
        communication.canal.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "todos" || communication.status === statusFilter;
      return matchesQuery && matchesStatus;
    }) ?? [];

  return (
    <div>
      <PageHeader title="Comunicações" subtitle="Mensagens preventivas geradas pela IA" />

      {loading && !data ? (
        <div className={styles.skeletonGroup}>
          <Skeleton height={40} />
          <Skeleton height={120} />
        </div>
      ) : null}

      {error ? (
        <AlertBanner
          title="Não foi possível carregar as comunicações"
          description="A conexão com o serviço de comunicações foi interrompida. Tente novamente em alguns instantes."
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
            <input
              type="text"
              className={styles.search}
              placeholder="Buscar por evento ou canal"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar comunicações por evento ou canal"
            />
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

          <div className={styles.layout}>
            <div className={styles.listColumn}>
              {filteredCommunications.length === 0 ? (
                <EmptyState
                  title="Nenhuma comunicação encontrada"
                  description="Ajuste a busca ou o filtro de status."
                />
              ) : (
                <Panel>
                  <ul className={styles.list}>
                    {filteredCommunications.map((communication) => (
                      <CommunicationRow
                        key={communication.id}
                        communication={communication}
                        isSelected={communication.id === selectedId}
                      />
                    ))}
                  </ul>
                </Panel>
              )}
            </div>

            {selectedCommunication ? (
              <CommunicationDetailPanel
                communication={selectedCommunication}
                event={selectedEvent}
                messageEditor={messageEditor}
              />
            ) : null}
          </div>
        </>
      ) : null}

      {messageEditor.isConfirmOpen && selectedCommunication ? (
        <Modal
          title="Confirmar simulação de envio"
          cancelLabel="Cancelar"
          onCancel={messageEditor.onCancelSimulate}
          confirmLabel="Confirmar simulação"
          onConfirm={messageEditor.onConfirmSimulate}
        >
          <p className={styles.confirmIntro}>Você está prestes a simular o envio para:</p>
          <p className={styles.confirmSummary}>
            {selectedCommunication.segurados.toLocaleString("pt-BR")} segurados · {selectedCommunication.eventoTipo}{" "}
            · {selectedEvent ? `${selectedEvent.regiao} · ` : ""}
            {selectedCommunication.canal}
          </p>
        </Modal>
      ) : null}

      {messageEditor.toastMessage ? <Toast tone="success" message={messageEditor.toastMessage} /> : null}
    </div>
  );
}
