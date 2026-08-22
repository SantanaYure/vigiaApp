// Camada preparada para futura integração com provedores reais de envio
// (WhatsApp Business API, SMS gateway, e-mail transacional, push).
// Nenhum envio real é realizado nesta etapa.
import { notificationsMock } from "../mocks/notificationsMock";
import { simulateRequest } from "./simulateRequest";

let notificationsStore = [...notificationsMock];

export function getNotifications({ canal = "", status = "" } = {}) {
  const filtered = notificationsStore.filter((item) => {
    const matchesCanal = !canal || item.canal === canal;
    const matchesStatus = !status || item.status === status;
    return matchesCanal && matchesStatus;
  });

  return simulateRequest(
    [...filtered].sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))
  );
}

export function getNotificationById(id) {
  const found = notificationsStore.find((item) => item.id === id) ?? null;
  return simulateRequest(found);
}

export function getAffectedInsuredCount() {
  const uniqueInsured = new Set(notificationsStore.map((item) => item.seguradoId));
  return simulateRequest(uniqueInsured.size);
}

export function getNotificationStats() {
  const geradas = notificationsStore.length;
  const enviadas = notificationsStore.filter((item) => item.status === "enviado").length;
  const pendentes = notificationsStore.filter((item) => item.status === "pendente").length;
  const taxaCobertura = geradas === 0 ? 0 : Math.round((enviadas / geradas) * 100);

  return simulateRequest({ geradas, enviadas, pendentes, taxaCobertura });
}

// Simula o envio (sem efeito real) de uma notificação pendente.
export function simulateSend(id) {
  notificationsStore = notificationsStore.map((item) =>
    item.id === id ? { ...item, status: "enviado" } : item
  );
  const atualizado = notificationsStore.find((item) => item.id === id) ?? null;
  return simulateRequest(atualizado, { delayMs: 500 });
}
