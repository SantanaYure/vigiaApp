import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../design-system/EmptyState";

export function CommunicationDetailPage() {
  return (
    <div>
      <PageHeader title="Detalhe da comunicação" subtitle="Conteúdo e status da comunicação selecionada" />
      <EmptyState
        title="Tela em construção"
        description="O detalhe da comunicação será implementado em um próximo ciclo."
      />
    </div>
  );
}
