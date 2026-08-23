import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { AlertBanner } from "../design-system/AlertBanner";
import { EmptyState } from "../design-system/EmptyState";
import { Modal } from "../design-system/Modal";
import { Panel } from "../design-system/Panel";
import { Skeleton } from "../design-system/Skeleton";
import { Toast } from "../design-system/Toast";
import { useMessageEditor } from "../features/communications/useMessageEditor";
import { EventDetailPanel } from "../features/events/components/EventDetailPanel";
import { EventRow } from "../features/events/components/EventRow";
import { useEventsPageData } from "../features/events/useEventsPageData";
import { useAsyncData } from "../hooks/useAsyncData";
import { getCustomersForEvent } from "../services/customersService";
import type { Customer } from "../types/customer";
import type { Severity } from "../types/event";
import styles from "./listDetailPage.module.css";

const SEVERITY_OPTIONS: { value: Severity | "todas"; label: string }[] = [
  { value: "todas", label: "Todas as severidades" },
  { value: "Crítico", label: "Crítico" },
  { value: "Alto", label: "Alto" },
  { value: "Moderado", label: "Moderado" },
  { value: "Baixo", label: "Baixo" },
];

export function EventsPage() {
  const { id: selectedId } = useParams<{ id?: string }>();
  const { data, loading, error, reload } = useEventsPageData();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "todas">("todas");

  const selectedEvent = data?.events.find((event) => event.id === selectedId) ?? null;
  const selectedCommunication = selectedEvent ? (data?.communicationsByEventId[selectedEvent.id] ?? null) : null;

  const { data: customers } = useAsyncData(
    () => (selectedEvent ? getCustomersForEvent(selectedEvent.id) : Promise.resolve<Customer[]>([])),
    [selectedEvent?.id],
  );

  const messageEditor = useMessageEditor(selectedCommunication?.id ?? null, reload);

  const filteredEvents =
    data?.events.filter((event) => {
      const query = search.trim().toLowerCase();
      const matchesQuery =
        !query || event.tipo.toLowerCase().includes(query) || event.regiao.toLowerCase().includes(query);
      const matchesSeverity = severityFilter === "todas" || event.severidade === severityFilter;
      return matchesQuery && matchesSeverity;
    }) ?? [];

  return (
    <div>
      <PageHeader title="Eventos climáticos" subtitle="Acompanhe os eventos detectados e seu impacto nos segurados" />

      {loading && !data ? (
        <div className={styles.skeletonGroup}>
          <Skeleton height={40} />
          <Skeleton height={120} />
        </div>
      ) : null}

      {error ? (
        <AlertBanner
          title="Não foi possível carregar os eventos"
          description="A API de dados climáticos está indisponível. Verifique a conexão e tente novamente."
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
              placeholder="Buscar por tipo ou região"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar eventos por tipo ou região"
            />
            <select
              className={styles.select}
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value as Severity | "todas")}
              aria-label="Filtrar por severidade"
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.layout}>
            <div className={styles.listColumn}>
              {filteredEvents.length === 0 ? (
                <EmptyState
                  title="Nenhum evento encontrado"
                  description="Ajuste a busca ou o filtro de severidade para ver mais resultados."
                />
              ) : (
                <Panel>
                  <ul className={styles.list}>
                    {filteredEvents.map((event) => (
                      <EventRow key={event.id} event={event} isSelected={event.id === selectedId} />
                    ))}
                  </ul>
                </Panel>
              )}
            </div>

            {selectedEvent ? (
              <EventDetailPanel
                event={selectedEvent}
                communication={selectedCommunication}
                customers={customers ?? []}
                messageEditor={messageEditor}
              />
            ) : null}
          </div>
        </>
      ) : null}

      {messageEditor.isConfirmOpen && selectedCommunication && selectedEvent ? (
        <Modal
          title="Confirmar simulação de envio"
          cancelLabel="Cancelar"
          onCancel={messageEditor.onCancelSimulate}
          confirmLabel="Confirmar simulação"
          onConfirm={messageEditor.onConfirmSimulate}
        >
          <p className={styles.confirmIntro}>Você está prestes a simular o envio para:</p>
          <p className={styles.confirmSummary}>
            {selectedCommunication.segurados.toLocaleString("pt-BR")} segurados · {selectedEvent.tipo} ·{" "}
            {selectedEvent.regiao} · {selectedCommunication.canal}
          </p>
        </Modal>
      ) : null}

      {messageEditor.toastMessage ? <Toast tone="success" message={messageEditor.toastMessage} /> : null}
    </div>
  );
}
