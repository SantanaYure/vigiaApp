// Regras de negócio que cruzam eventos meteorológicos com produtos de
// seguro para decidir ações preventivas.
export const rulesMock = [
  {
    id: "RUL-01",
    evento: "Chuva intensa",
    condicao: "Precipitação acima de 50 mm",
    parametro: { tipo: "mm", label: "Precipitação (mm)", valor: 50, min: 10, max: 150, step: 5 },
    produtoSeguro: ["Residencial"],
    acao: "Enviar orientação preventiva",
    prioridade: "alta",
    status: "ativa",
  },
  {
    id: "RUL-02",
    evento: "Granizo",
    condicao: "Probabilidade elevada de granizo",
    parametro: { tipo: "probabilidade", label: "Probabilidade de granizo (%)", valor: 60, min: 10, max: 100, step: 5 },
    produtoSeguro: ["Automóvel"],
    acao: "Recomendar estacionamento coberto",
    prioridade: "alta",
    status: "ativa",
  },
  {
    id: "RUL-03",
    evento: "Vento forte",
    condicao: "Rajadas acima de 70 km/h",
    parametro: { tipo: "kmh", label: "Velocidade do vento (km/h)", valor: 70, min: 20, max: 150, step: 5 },
    produtoSeguro: ["Residencial", "Empresarial"],
    acao: "Enviar alerta preventivo",
    prioridade: "alta",
    status: "ativa",
  },
  {
    id: "RUL-04",
    evento: "Alagamento",
    condicao: "Pontos críticos identificados na região",
    parametro: { tipo: "pontos", label: "Quantidade de pontos críticos", valor: 2, min: 1, max: 20, step: 1 },
    produtoSeguro: ["Residencial", "Empresarial"],
    acao: "Enviar recomendação de segurança e rotas alternativas",
    prioridade: "media",
    status: "ativa",
  },
  {
    id: "RUL-05",
    evento: "Chuva intensa",
    condicao: "Precipitação acima de 100 mm",
    parametro: { tipo: "mm", label: "Precipitação (mm)", valor: 100, min: 50, max: 200, step: 5 },
    produtoSeguro: ["Empresarial"],
    acao: "Enviar alerta crítico e orientação de contingência",
    prioridade: "alta",
    status: "inativa",
  },
];

export const DECISION_FLOW_STEPS = [
  { id: 1, titulo: "Coleta da API", descricao: "Dados meteorológicos são coletados por região monitorada." },
  { id: 2, titulo: "Identificação do evento", descricao: "O sistema classifica o tipo e a intensidade do evento." },
  { id: 3, titulo: "Aplicação da regra", descricao: "As condições configuradas são comparadas aos limiares definidos." },
  { id: 4, titulo: "Seleção dos segurados", descricao: "Segurados da região com cobertura compatível são identificados." },
  { id: 5, titulo: "Geração da mensagem", descricao: "Uma mensagem preventiva personalizada é gerada para envio." },
];
