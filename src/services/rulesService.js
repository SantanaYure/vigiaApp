// Camada preparada para futura integração com um motor de regras real.
import { rulesMock, DECISION_FLOW_STEPS } from "../mocks/rulesMock";
import { simulateRequest } from "./simulateRequest";

let rulesStore = [...rulesMock];

export function getRules() {
  return simulateRequest([...rulesStore]);
}

export function getDecisionFlow() {
  return simulateRequest([...DECISION_FLOW_STEPS]);
}

export function updateRuleThreshold(ruleId, novoValor) {
  rulesStore = rulesStore.map((rule) =>
    rule.id === ruleId ? { ...rule, parametro: { ...rule.parametro, valor: novoValor } } : rule
  );
  const atualizado = rulesStore.find((rule) => rule.id === ruleId) ?? null;
  return simulateRequest(atualizado, { delayMs: 300 });
}

export function toggleRuleStatus(ruleId) {
  rulesStore = rulesStore.map((rule) =>
    rule.id === ruleId ? { ...rule, status: rule.status === "ativa" ? "inativa" : "ativa" } : rule
  );
  const atualizado = rulesStore.find((rule) => rule.id === ruleId) ?? null;
  return simulateRequest(atualizado, { delayMs: 300 });
}
