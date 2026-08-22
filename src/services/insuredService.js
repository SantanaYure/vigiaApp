// Camada preparada para futura integração com backend/base real de
// segurados. Hoje opera sobre os mocks em memória.
import { insuredMock } from "../mocks/insuredMock";
import { simulateRequest } from "./simulateRequest";

let insuredStore = [...insuredMock];

export function getInsured({ search = "", cidade = "", tipoSeguro = "", status = "" } = {}) {
  const term = search.trim().toLowerCase();

  const filtered = insuredStore.filter((item) => {
    const matchesSearch = !term || item.nome.toLowerCase().includes(term) || item.id.toLowerCase().includes(term);
    const matchesCidade = !cidade || item.cidade === cidade;
    const matchesTipo = !tipoSeguro || item.tipoSeguro === tipoSeguro;
    const matchesStatus = !status || item.status === status;
    return matchesSearch && matchesCidade && matchesTipo && matchesStatus;
  });

  return simulateRequest(filtered);
}

export function getInsuredById(id) {
  const found = insuredStore.find((item) => item.id === id) ?? null;
  return simulateRequest(found);
}

export function getInsuredByCityAndCoverage(cidade, cobertura) {
  const found = insuredStore.filter(
    (item) => item.cidade === cidade && item.status === "ativo" && item.coberturas.includes(cobertura)
  );
  return simulateRequest(found);
}

export function createInsured(data) {
  const novoSegurado = {
    id: `SEG-${String(insuredStore.length + 1).padStart(4, "0")}`,
    status: "ativo",
    endereco: { logradouro: "", bairro: "", cep: "", latitude: null, longitude: null },
    ...data,
  };
  insuredStore = [novoSegurado, ...insuredStore];
  return simulateRequest(novoSegurado, { delayMs: 600 });
}

// Simula a importação em lote de uma base externa de segurados.
export function importInsuredBase() {
  return simulateRequest({ importados: 0, mensagem: "Importação preparada para integração futura." }, { delayMs: 800 });
}
