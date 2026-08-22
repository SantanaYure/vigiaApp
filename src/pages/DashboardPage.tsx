import { PageHeader } from "../components/layout/PageHeader";
import { AlertBanner } from "../design-system/AlertBanner";
import { EmptyState } from "../design-system/EmptyState";
import { Panel } from "../design-system/Panel";
import { Skeleton } from "../design-system/Skeleton";
import { StatCard } from "../design-system/StatCard";
import { AttentionEventRow } from "../features/dashboard/components/AttentionEventRow";
import { RecentCommunicationRow } from "../features/dashboard/components/RecentCommunicationRow";
import { useDashboardData } from "../features/dashboard/useDashboardData";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  const { data, loading, error, reload } = useDashboardData();

  return (
    <div className={styles.page}>
      <PageHeader title="Dashboard" subtitle="O que está acontecendo agora e exige sua atenção" />

      {loading && !data ? (
        <div className={styles.skeletonGroup}>
          <Skeleton height={14} width={220} />
          <Skeleton height={120} />
          <Skeleton height={120} />
        </div>
      ) : null}

      {error ? (
        <AlertBanner
          title="Falha ao atualizar dados climáticos"
          description="A conexão com a API meteorológica foi interrompida. Os dados exibidos podem estar desatualizados. Tente novamente em alguns instantes."
          action={
            <button type="button" className={styles.retryButton} onClick={reload}>
              Tentar novamente
            </button>
          }
        />
      ) : null}

      {data ? (
        <>
          <div className={styles.kpiGrid}>
            <StatCard label="Eventos ativos" value={data.kpiEventosAtivos} />
            <StatCard label="Segurados em risco" value={data.kpiSegurados.toLocaleString("pt-BR")} />
            <StatCard label="Comunicações geradas" value={data.kpiComunicacoes} />
            <StatCard label="Simulações concluídas" value={data.kpiSimuladas} />
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Eventos que exigem atenção</h2>
            {data.attentionEvents.length === 0 ? (
              <EmptyState
                title="Nenhum evento em aberto"
                description="Não há eventos climáticos exigindo atenção no momento."
              />
            ) : (
              <ul className={styles.attentionList}>
                {data.attentionEvents.map((event) => (
                  <li key={event.id}>
                    <AttentionEventRow event={event} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Comunicações recentes</h2>
            {data.recentCommunications.length === 0 ? (
              <EmptyState
                title="Nenhuma comunicação gerada"
                description="As comunicações preventivas aparecerão aqui assim que forem geradas."
              />
            ) : (
              <Panel>
                <ul className={styles.commList}>
                  {data.recentCommunications.map((communication) => (
                    <RecentCommunicationRow key={communication.id} communication={communication} />
                  ))}
                </ul>
              </Panel>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
