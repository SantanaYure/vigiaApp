import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Segurados from "./pages/Segurados/Segurados";
import EventosRegras from "./pages/EventosRegras/EventosRegras";
import Notificacoes from "./pages/Notificacoes/Notificacoes";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/segurados" element={<Segurados />} />
          <Route path="/eventos-regras" element={<EventosRegras />} />
          <Route path="/notificacoes" element={<Notificacoes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
