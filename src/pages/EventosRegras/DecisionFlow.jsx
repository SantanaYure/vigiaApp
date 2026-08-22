import { ChevronRight } from "lucide-react";
import "./DecisionFlow.css";

export function DecisionFlow({ steps }) {
  return (
    <div className="decision-flow">
      {steps.map((step, index) => (
        <div className="decision-flow-item" key={step.id}>
          <div className="decision-flow-step">
            <span className="decision-flow-number">{step.id}</span>
            <div>
              <p className="decision-flow-title">{step.titulo}</p>
              <p className="decision-flow-description">{step.descricao}</p>
            </div>
          </div>
          {index < steps.length - 1 ? (
            <ChevronRight size={18} className="decision-flow-arrow" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
