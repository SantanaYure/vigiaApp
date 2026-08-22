// Camada preparada para futura integração com um provedor de LLM/agentes
// inteligentes responsáveis por redigir e personalizar as mensagens
// preventivas. Hoje utiliza templates estáticos como substituto.
import { simulateRequest } from "./simulateRequest";

const TEMPLATES = {
  "Chuva intensa":
    "Olá, {primeiroNome}. Há previsão de chuva intensa para sua região nas próximas horas. Recomendamos verificar calhas, fechar portas e janelas e retirar objetos de áreas sujeitas a alagamento.",
  Granizo:
    "Olá, {primeiroNome}. Há probabilidade elevada de granizo na sua região. Recomendamos estacionar o veículo em local coberto, se possível.",
  "Vento forte":
    "Olá, {primeiroNome}. Rajadas de vento fortes são esperadas na sua região nas próximas horas. Reforce a fixação de objetos soltos e evite áreas com árvores ou estruturas frágeis.",
  Alagamento:
    "Olá, {primeiroNome}. Identificamos risco de alagamento próximo à sua região. Evite vias alagadas e mantenha objetos de valor em locais elevados.",
};

// Gera o texto de uma mensagem preventiva a partir do evento e do
// segurado. Em uma etapa futura, esta função poderá delegar a um LLM.
export function generateMessage({ nome, evento }) {
  const primeiroNome = (nome ?? "").split(" ")[0] || "segurado(a)";
  const template = TEMPLATES[evento] ?? "Olá, {primeiroNome}. Identificamos um evento meteorológico relevante para sua região. Fique atento às orientações de segurança.";
  const mensagem = template.replace("{primeiroNome}", primeiroNome);
  return simulateRequest(mensagem, { delayMs: 300 });
}
