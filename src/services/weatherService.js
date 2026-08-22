// Camada preparada para futura integração com API meteorológica real.
// Hoje retorna dados mockados; a assinatura das funções já reflete o
// formato esperado de uma API assíncrona.
import { weatherEventsMock, REGIOES_MONITORADAS } from "../mocks/weatherEventsMock";
import { monitoringRunsMock } from "../mocks/monitoringRunsMock";
import { simulateRequest } from "./simulateRequest";

let eventsStore = [...weatherEventsMock];
let runsStore = [...monitoringRunsMock];

export function getMonitoredRegions() {
  return simulateRequest([...REGIOES_MONITORADAS]);
}

export function getRecentEvents() {
  return simulateRequest(
    [...eventsStore].sort((a, b) => new Date(b.horarioDeteccao) - new Date(a.horarioDeteccao))
  );
}

export function getMonitoringRuns() {
  return simulateRequest(
    [...runsStore].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
  );
}

// Simula a execução de um novo ciclo de monitoramento: coleta dados,
// gera um novo evento aleatório e registra a execução no histórico.
export function runMonitoring() {
  const tipos = ["Chuva intensa", "Vento forte", "Granizo", "Alagamento"];
  const riscos = ["alto", "medio", "baixo"];
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const regiao = REGIOES_MONITORADAS[Math.floor(Math.random() * REGIOES_MONITORADAS.length)];
  const nivelRisco = riscos[Math.floor(Math.random() * riscos.length)];

  const novoEvento = {
    id: `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
    localizacao: regiao,
    tipo,
    intensidade: tipo === "Vento forte" ? `${60 + Math.floor(Math.random() * 40)} km/h` : `${30 + Math.floor(Math.random() * 60)} mm`,
    valor: 30 + Math.floor(Math.random() * 60),
    unidade: tipo === "Vento forte" ? "km/h" : "mm",
    nivelRisco,
    horarioDeteccao: new Date().toISOString(),
    descricao: "Evento identificado no ciclo de monitoramento mais recente.",
  };

  const eventosDetectados = 1 + Math.floor(Math.random() * 3);
  const seguradosAfetados = eventosDetectados * (1 + Math.floor(Math.random() * 3));
  const notificacoesGeradas = Math.max(0, seguradosAfetados - Math.floor(Math.random() * 2));

  const novaExecucao = {
    id: `RUN-${Math.floor(500 + Math.random() * 500)}`,
    dataHora: new Date().toISOString(),
    regioesMonitoradas: REGIOES_MONITORADAS.length,
    eventosDetectados,
    seguradosAfetados,
    notificacoesGeradas,
    status: "concluido",
    duracaoSegundos: 4 + Math.floor(Math.random() * 6),
  };

  eventsStore = [novoEvento, ...eventsStore];
  runsStore = [novaExecucao, ...runsStore];

  return simulateRequest({ evento: novoEvento, execucao: novaExecucao }, { delayMs: 900 });
}
