import type { HistoryEntry } from "../types/history";

export const historySeed: HistoryEntry[] = [
  { id: "h1", eventoTipo: "Chuva intensa", regiao: "RS · Porto Alegre", segurados: 1248, canal: "SMS", status: "Simulada", horario: "22/08 · 14:11" },
  { id: "h2", eventoTipo: "Granizo", regiao: "SC · Chapecó", segurados: 642, canal: "E-mail", status: "Aguardando revisão", horario: "22/08 · 13:55" },
  { id: "h3", eventoTipo: "Ventos fortes", regiao: "PR · Curitiba", segurados: 210, canal: "SMS", status: "Revisada", horario: "22/08 · 12:40" },
  { id: "h4", eventoTipo: "Chuva intensa", regiao: "SP · Campinas", segurados: 58, canal: "SMS", status: "Erro", horario: "22/08 · 09:20" },
];
