import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../design-system/EmptyState";

export function EventDetailPage() {
  return (
    <div>
      <PageHeader title="Detalhe do evento" subtitle="Informações completas sobre o evento selecionado" />
      <EmptyState
        title="Tela em construção"
        description="O detalhe do evento será implementado em um próximo ciclo."
      />
    </div>
  );
}
