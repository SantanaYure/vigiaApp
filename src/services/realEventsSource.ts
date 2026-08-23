import { getAllCustomers } from "./customersService";
import { matchCustomersByGeocodes } from "./geoMatch";
import type { Customer } from "../types/customer";
import type { EventStatus, Severity, WeatherEvent } from "../types/event";

/** Formato gerado pelo agente de Coleta (agents/coleta/run.py) a partir dos avisos do INMET. */
interface AvisoInmet {
  id: number;
  tipo: string;
  severidade: string;
  cor: string;
  inicio: string;
  fim: string;
  estados: string[];
  geocodes_municipios: string[];
  riscos: string[];
  instrucoes: string[];
  fonte: string;
}

const AVISOS_URL = "/data/avisos-inmet.json";

function mapSeveridade(severidadeInmet: string): Severity {
  switch (severidadeInmet) {
    case "Grande Perigo":
      return "Crítico";
    case "Perigo":
      return "Alto";
    case "Perigo Potencial":
      return "Moderado";
    default:
      return "Baixo";
  }
}

function mapStatus(inicioIso: string, fimIso: string): EventStatus {
  const agora = Date.now();
  if (agora < new Date(inicioIso).getTime()) return "Monitorando";
  if (agora > new Date(fimIso).getTime()) return "Encerrado";
  return "Ativo";
}

function formatDataHora(iso: string): string {
  const data = new Date(iso);
  const dataFormatada = data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const horaFormatada = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dataFormatada} ${horaFormatada}`;
}

function formatRegiao(estados: string[], totalMunicipios: number): string {
  const listaEstados = estados.length > 0 ? estados.join(", ") : "Brasil";
  return `${listaEstados} · ${totalMunicipios} município(s)`;
}

function mapAvisoParaEvento(aviso: AvisoInmet, customers: Customer[]): WeatherEvent {
  const segurados = matchCustomersByGeocodes(customers, aviso.geocodes_municipios);

  return {
    id: `inmet-${aviso.id}`,
    tipo: aviso.tipo,
    severidade: mapSeveridade(aviso.severidade),
    regiao: formatRegiao(aviso.estados, aviso.geocodes_municipios.length),
    status: mapStatus(aviso.inicio, aviso.fim),
    detectadoEm: formatDataHora(aviso.inicio),
    previsao: `Até ${formatDataHora(aviso.fim)}`,
    segurados: segurados.length,
    regra: `Segurados nos municípios afetados pelo aviso de ${aviso.tipo} (fonte: INMET). Critério provisório — a regra de negócio definitiva ainda será definida pelo time de seguros.`,
    tipoSeguro: "cobertura a definir",
    geocodesMunicipios: aviso.geocodes_municipios,
  };
}

/**
 * Busca os eventos derivados de avisos reais do INMET (gerados pelo agente
 * de Coleta em `agents/coleta/`). Retorna lista vazia se o arquivo ainda não
 * foi gerado ou a busca falhar — essa fonte é aditiva, nunca deve quebrar a
 * tela de Eventos.
 */
export async function getRealEvents(): Promise<WeatherEvent[]> {
  try {
    const resposta = await fetch(AVISOS_URL);
    if (!resposta.ok) return [];

    const avisos: AvisoInmet[] = await resposta.json();
    const customers = await getAllCustomers();
    return avisos.map((aviso) => mapAvisoParaEvento(aviso, customers));
  } catch (erro) {
    console.warn("Não foi possível carregar eventos reais do INMET:", erro);
    return [];
  }
}
