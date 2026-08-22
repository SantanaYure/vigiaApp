// Eventos meteorológicos detectados (mock). Futuramente alimentado por
// integração real com API meteorológica via weatherService.
export const weatherEventsMock = [
  {
    id: "EVT-1001",
    localizacao: "São Paulo",
    tipo: "Chuva intensa",
    intensidade: "72 mm",
    valor: 72,
    unidade: "mm",
    nivelRisco: "alto",
    horarioDeteccao: "2026-08-19T13:42:00",
    descricao: "Volume de precipitação acima do limiar de risco em janela de 3 horas.",
  },
  {
    id: "EVT-1002",
    localizacao: "Santos",
    tipo: "Vento forte",
    intensidade: "83 km/h",
    valor: 83,
    unidade: "km/h",
    nivelRisco: "alto",
    horarioDeteccao: "2026-08-19T12:55:00",
    descricao: "Rajadas de vento litorâneas acima do limiar configurado.",
  },
  {
    id: "EVT-1003",
    localizacao: "Campinas",
    tipo: "Granizo",
    intensidade: "Probabilidade 68%",
    valor: 68,
    unidade: "%",
    nivelRisco: "medio",
    horarioDeteccao: "2026-08-19T11:20:00",
    descricao: "Formação de células convectivas com potencial de granizo.",
  },
  {
    id: "EVT-1004",
    localizacao: "São Paulo",
    tipo: "Alagamento",
    intensidade: "Pontos críticos: 4",
    valor: 4,
    unidade: "pontos",
    nivelRisco: "medio",
    horarioDeteccao: "2026-08-19T10:05:00",
    descricao: "Acúmulo de água em vias historicamente sujeitas a alagamento.",
  },
  {
    id: "EVT-1005",
    localizacao: "Santos",
    tipo: "Chuva intensa",
    intensidade: "38 mm",
    valor: 38,
    unidade: "mm",
    nivelRisco: "baixo",
    horarioDeteccao: "2026-08-19T09:15:00",
    descricao: "Precipitação moderada, abaixo do limiar crítico.",
  },
  {
    id: "EVT-1006",
    localizacao: "Campinas",
    tipo: "Vento forte",
    intensidade: "54 km/h",
    valor: 54,
    unidade: "km/h",
    nivelRisco: "baixo",
    horarioDeteccao: "2026-08-19T08:30:00",
    descricao: "Rajadas dentro da faixa esperada para a estação.",
  },
];

export const REGIOES_MONITORADAS = ["São Paulo", "Santos", "Campinas"];

export const TIPOS_EVENTO = ["Chuva intensa", "Granizo", "Vento forte", "Alagamento"];
