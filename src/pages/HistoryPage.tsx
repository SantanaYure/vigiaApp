import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../design-system/EmptyState";

export function HistoryPage() {
  return (
    <div>
      <PageHeader title="Histórico" subtitle="Registro de eventos, comunicações e simulações de envio" />
      <EmptyState title="Tela em construção" description="O histórico será implementado em um próximo ciclo." />
    </div>
  );
}
