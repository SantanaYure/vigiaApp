import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../design-system/EmptyState";

export function EventsPage() {
  return (
    <div>
      <PageHeader title="Eventos climáticos" subtitle="Acompanhe os eventos detectados e seu impacto nos segurados" />
      <EmptyState
        title="Tela em construção"
        description="A lista de eventos climáticos será implementada em um próximo ciclo."
      />
    </div>
  );
}
