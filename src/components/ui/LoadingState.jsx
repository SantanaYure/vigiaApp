import { Loader2 } from "lucide-react";
import "./States.css";

export function LoadingState({ label = "Carregando dados..." }) {
  return (
    <div className="state-box state-loading">
      <Loader2 size={22} className="spin" />
      <p>{label}</p>
    </div>
  );
}
