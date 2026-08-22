// Mensagens preventivas geradas pelo motor de regras e envios simulados
// (nenhum envio real é realizado nesta etapa).
export const notificationsMock = [
  {
    id: "NOT-2001",
    dataHora: "2026-08-19T13:45:00",
    seguradoId: "SEG-0001",
    segurado: "João Pereira Lima",
    evento: "Chuva intensa",
    cidade: "São Paulo",
    canal: "WhatsApp",
    status: "enviado",
    mensagem:
      "Olá, João. Há previsão de chuva intensa para sua região nas próximas horas. Recomendamos verificar calhas, fechar portas e janelas e retirar objetos de áreas sujeitas a alagamento.",
  },
  {
    id: "NOT-2002",
    dataHora: "2026-08-19T13:46:00",
    seguradoId: "SEG-0004",
    segurado: "Fernanda Souza Ribeiro",
    evento: "Alagamento",
    cidade: "São Paulo",
    canal: "Push",
    status: "enviado",
    mensagem:
      "Olá, Fernanda. Identificamos risco de alagamento em pontos próximos ao seu endereço. Evite trafegar por vias alagadas e mantenha documentos e objetos de valor em locais elevados.",
  },
  {
    id: "NOT-2003",
    dataHora: "2026-08-19T12:58:00",
    seguradoId: "SEG-0002",
    segurado: "Marina Costa Alves",
    evento: "Vento forte",
    cidade: "Santos",
    canal: "SMS",
    status: "enviado",
    mensagem:
      "Olá, Marina. Rajadas de vento fortes são esperadas em Santos nas próximas horas. Recomendamos estacionar seu veículo em local coberto, se possível.",
  },
  {
    id: "NOT-2004",
    dataHora: "2026-08-19T12:59:00",
    seguradoId: "SEG-0009",
    segurado: "Diego Henrique Cardoso",
    evento: "Vento forte",
    cidade: "Santos",
    canal: "WhatsApp",
    status: "pendente",
    mensagem:
      "Olá, Diego. Rajadas de vento fortes são esperadas em Santos nas próximas horas. Recomendamos estacionar seu veículo em local coberto, se possível.",
  },
  {
    id: "NOT-2005",
    dataHora: "2026-08-19T11:25:00",
    seguradoId: "SEG-0006",
    segurado: "Patrícia Gomes Dias",
    evento: "Granizo",
    cidade: "Campinas",
    canal: "WhatsApp",
    status: "enviado",
    mensagem:
      "Olá, Patrícia. Há probabilidade elevada de granizo em Campinas. Recomendamos estacionar seu veículo em local coberto para evitar danos.",
  },
  {
    id: "NOT-2006",
    dataHora: "2026-08-19T11:26:00",
    seguradoId: "SEG-0003",
    segurado: "Roberto Nascimento",
    evento: "Granizo",
    cidade: "Campinas",
    canal: "E-mail",
    status: "falha",
    mensagem:
      "Olá, Roberto. Há probabilidade elevada de granizo em Campinas. Recomendamos proteger veículos e coberturas sensíveis da sua empresa.",
  },
  {
    id: "NOT-2007",
    dataHora: "2026-08-19T10:10:00",
    seguradoId: "SEG-0010",
    segurado: "Vanessa Lopes Teixeira",
    evento: "Alagamento",
    cidade: "Campinas",
    canal: "Push",
    status: "enviado",
    mensagem:
      "Olá, Vanessa. Identificamos risco de alagamento próximo à sua região. Evite áreas baixas e mantenha objetos de valor longe do nível do solo.",
  },
  {
    id: "NOT-2008",
    dataHora: "2026-08-19T09:20:00",
    seguradoId: "SEG-0007",
    segurado: "Grupo Andrade Comércio Ltda.",
    evento: "Chuva intensa",
    cidade: "São Paulo",
    canal: "E-mail",
    status: "pendente",
    mensagem:
      "Prezados, há previsão de chuva intensa para a região do estabelecimento. Recomendamos verificar sistemas de drenagem e proteger estoques de áreas térreas.",
  },
];

export const CANAIS_NOTIFICACAO = ["WhatsApp", "SMS", "E-mail", "Push"];
export const STATUS_NOTIFICACAO = ["enviado", "pendente", "falha"];
