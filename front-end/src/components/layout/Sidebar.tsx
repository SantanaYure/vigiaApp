import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/eventos", label: "Eventos", end: false },
  { to: "/comunicacoes", label: "Comunicações", end: false },
  { to: "/historico", label: "Histórico", end: false },
] as const;

export function Sidebar() {
  return (
    <nav className={styles.sidebar} aria-label="Navegação principal">
      <div className={styles.brand}>
        <span className={styles.brandDot} aria-hidden="true" />
        <span className={styles.brandName}>Vigia</span>
      </div>
      <ul className={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
