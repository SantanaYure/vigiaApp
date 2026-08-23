import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { EventsPage } from "../pages/EventsPage";
import { CommunicationsPage } from "../pages/CommunicationsPage";
import { CommunicationDetailPage } from "../pages/CommunicationDetailPage";
import { HistoryPage } from "../pages/HistoryPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/eventos/:id" element={<EventsPage />} />
          <Route path="/comunicacoes" element={<CommunicationsPage />} />
          <Route path="/comunicacoes/:id" element={<CommunicationDetailPage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
