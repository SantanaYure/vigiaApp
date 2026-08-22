import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, CloudLightning, BellRing, ShieldCheck } from "lucide-react";
import "./Sidebar.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/segurados", label: "Segurados", icon: Users },
  { to: "/eventos-regras", label: "Eventos e Regras", icon: CloudLightning },
  { to: "/notificacoes", label: "Notificações", icon: BellRing },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <ShieldCheck size={22} strokeWidth={2.2} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Vigia</span>
          <span className="sidebar-brand-group">Grupo VIL</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link${isActive ? " sidebar-link-active" : ""}`}
          >
            <Icon size={19} strokeWidth={2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Plataforma de comunicação preventiva</p>
      </div>
    </aside>
  );
}
