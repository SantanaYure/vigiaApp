export const RISK_LEVELS = {
  alto: { label: "Risco alto", color: "var(--risk-alto)", bg: "var(--risk-alto-bg)" },
  medio: { label: "Risco médio", color: "var(--risk-medio)", bg: "var(--risk-medio-bg)" },
  baixo: { label: "Risco baixo", color: "var(--risk-baixo)", bg: "var(--risk-baixo-bg)" },
};

export function getRiskMeta(nivel) {
  return RISK_LEVELS[nivel] ?? RISK_LEVELS.baixo;
}

export const STATUS_META = {
  ativo: { label: "Ativo", color: "var(--color-success)", bg: "var(--color-success-bg)" },
  inativo: { label: "Inativo", color: "var(--color-gray-500)", bg: "var(--color-gray-100)" },
  pendente: { label: "Pendente", color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  enviado: { label: "Enviado (simulado)", color: "var(--color-success)", bg: "var(--color-success-bg)" },
  falha: { label: "Falha", color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  ativa: { label: "Ativa", color: "var(--color-success)", bg: "var(--color-success-bg)" },
  inativa: { label: "Inativa", color: "var(--color-gray-500)", bg: "var(--color-gray-100)" },
  concluido: { label: "Concluído", color: "var(--color-success)", bg: "var(--color-success-bg)" },
  "em-andamento": { label: "Em andamento", color: "var(--color-info)", bg: "var(--color-info-bg)" },
  erro: { label: "Erro", color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
};

export function getStatusMeta(status) {
  return STATUS_META[status] ?? { label: status, color: "var(--color-gray-500)", bg: "var(--color-gray-100)" };
}

export const PRIORITY_META = {
  alta: { label: "Alta", color: "var(--color-danger)", bg: "var(--color-danger-bg)" },
  media: { label: "Média", color: "var(--color-warning)", bg: "var(--color-warning-bg)" },
  baixa: { label: "Baixa", color: "var(--color-success)", bg: "var(--color-success-bg)" },
};

export function getPriorityMeta(prioridade) {
  return PRIORITY_META[prioridade] ?? PRIORITY_META.baixa;
}
