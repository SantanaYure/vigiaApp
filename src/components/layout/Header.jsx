import { Radio } from "lucide-react";
import "./Header.css";

export function Header({ title, subtitle }) {
  return (
    <header className="header">
      <div className="header-titles">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>

      <div className="header-status">
        <Radio size={14} strokeWidth={2.4} />
        <span>Monitoramento ativo</span>
      </div>
    </header>
  );
}
