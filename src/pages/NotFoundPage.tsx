import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../design-system/EmptyState";

export function NotFoundPage() {
  return (
    <div>
      <PageHeader title="Página não encontrada" subtitle="O endereço acessado não existe nesta aplicação." />
      <EmptyState title="Nada por aqui" description="Verifique o endereço ou volte para o Dashboard." />
    </div>
  );
}
