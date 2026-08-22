import { useCallback, useState } from "react";
import { LoadingState } from "../../components/ui/LoadingState";
import { ErrorState } from "../../components/ui/ErrorState";
import { RulesTable } from "../../components/tables/RulesTable";
import { DecisionFlow } from "./DecisionFlow";
import { ThresholdSlider } from "./ThresholdSlider";
import { useAsyncData } from "../../hooks/useAsyncData";
import * as rulesService from "../../services/rulesService";
import "./EventosRegras.css";

const THRESHOLD_RULE_IDS = ["RUL-01", "RUL-03", "RUL-02"];

async function loadRulesData() {
  const [rules, flow] = await Promise.all([rulesService.getRules(), rulesService.getDecisionFlow()]);
  return { rules, flow };
}

export default function EventosRegras() {
  const { data, loading, error, reload } = useAsyncData(loadRulesData, []);
  const [pendingRuleId, setPendingRuleId] = useState(null);

  const handleThresholdChange = useCallback(
    async (ruleId, novoValor) => {
      setPendingRuleId(ruleId);
      try {
        await rulesService.updateRuleThreshold(ruleId, novoValor);
        reload();
      } finally {
        setPendingRuleId(null);
      }
    },
    [reload]
  );

  if (loading && !data) return <LoadingState label="Carregando regras de negócio..." />;
  if (error && !data) return <ErrorState onRetry={reload} />;
  if (!data) return null;

  const { rules, flow } = data;
  const thresholdRules = THRESHOLD_RULE_IDS.map((id) => rules.find((rule) => rule.id === id)).filter(Boolean);

  return (
    <div className="eventos-regras-page">
      <section className="eventos-regras-section">
        <h2>Regras configuradas</h2>
        <RulesTable rules={rules} />
      </section>

      <section className="eventos-regras-section">
        <h2>Fluxo da decisão</h2>
        <DecisionFlow steps={flow} />
      </section>

      <section className="eventos-regras-section">
        <h2>Limiares de acionamento</h2>
        <p className="eventos-regras-hint">
          Ajuste os limiares utilizados pelo motor de regras para classificar um evento como relevante.
        </p>
        <div className={`threshold-grid${pendingRuleId ? " threshold-grid-pending" : ""}`}>
          {thresholdRules.map((rule) => (
            <ThresholdSlider key={rule.id} rule={rule} onChange={handleThresholdChange} />
          ))}
        </div>
      </section>
    </div>
  );
}
