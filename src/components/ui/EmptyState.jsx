import { Inbox } from "lucide-react";
import "./States.css";

export function EmptyState({ title = "Nada por aqui", description, icon: Icon = Inbox }) {
  return (
    <div className="state-box state-empty">
      <Icon size={28} strokeWidth={1.6} />
      <p className="state-title">{title}</p>
      {description ? <p className="state-description">{description}</p> : null}
    </div>
  );
}
