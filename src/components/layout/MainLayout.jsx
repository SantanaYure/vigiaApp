import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import "./MainLayout.css";

const PAGE_META = {
  "/": {
    title: "Dashboard de Monitoramento",
    subtitle: "Visão geral dos eventos meteorológicos e da atuação preventiva",
  },
  "/segurados": {
    title: "Segurados",
    subtitle: "Gerenciamento da base de segurados e coberturas",
  },
  "/eventos-regras": {
    title: "Eventos e Regras",
    subtitle: "Configuração das regras de negócio do motor de monitoramento",
  },
  "/notificacoes": {
    title: "Notificações",
    subtitle: "Mensagens preventivas geradas e envios simulados",
  },
};

export function MainLayout() {
  const location = useLocation();
  const meta = PAGE_META[location.pathname] ?? { title: "Vigia" };

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-layout-content">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="main-layout-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
