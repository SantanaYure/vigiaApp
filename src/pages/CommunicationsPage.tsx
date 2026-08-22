import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../design-system/EmptyState";

export function CommunicationsPage() {
  return (
    <div>
      <PageHeader title="Comunicações" subtitle="Mensagens preventivas geradas pela IA" />
      <EmptyState
        title="Tela em construção"
        description="A lista de comunicações será implementada em um próximo ciclo."
      />
    </div>
  );
}
