import { AlertTriangle } from "lucide-react";
import { Button } from "./Button";
import "./States.css";

export function ErrorState({ message = "Não foi possível carregar os dados.", onRetry }) {
  return (
    <div className="state-box state-error">
      <AlertTriangle size={28} strokeWidth={1.8} />
      <p className="state-title">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
