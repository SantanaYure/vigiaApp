import { all, put, transaction } from "./store.js";
import type { Segurado } from "./domain.js";

/** Carteira didática solicitada para a primeira execução do MVP. */
export const CARTEIRA_INICIAL: Segurado[] = [
  { apolice: "VIG-0001", nome: "Yure Santana", codigoIbge: "3106200", regiao: "Belo Horizonte, MG", produto: "residencial", coberturas: ["chuva", "alagamento", "vendaval", "granizo", "raio"], vigenciaInicio: "2026-01-01", vigenciaFim: "2026-12-31", canal: "SMS", telefone: "71991408574", origem: "carteira-ficticia-solicitada" },
  { apolice: "VIG-0002", nome: "Marina Alves", codigoIbge: "3550308", regiao: "São Paulo, SP", produto: "automovel", coberturas: ["chuva", "alagamento", "granizo", "vendaval"], vigenciaInicio: "2026-01-01", vigenciaFim: "2026-12-31", canal: "E-mail", origem: "carteira-ficticia-solicitada" },
  { apolice: "VIG-0003", nome: "Rafael Costa", codigoIbge: "3106200", regiao: "Belo Horizonte, MG", produto: "empresarial", coberturas: ["chuva", "alagamento", "vendaval", "incendio", "raio"], vigenciaInicio: "2026-01-01", vigenciaFim: "2026-12-31", canal: "E-mail", origem: "carteira-ficticia-solicitada" },
  { apolice: "VIG-0004", nome: "Fernanda Lima", codigoIbge: "4314902", regiao: "Porto Alegre, RS", produto: "agricola", coberturas: ["chuva", "granizo", "geada", "vendaval", "cheia"], vigenciaInicio: "2026-01-01", vigenciaFim: "2026-12-31", canal: "E-mail", origem: "carteira-ficticia-solicitada" },
  { apolice: "VIG-0005", nome: "João Oliveira", codigoIbge: "4106902", regiao: "Curitiba, PR", produto: "parametrico", coberturas: ["chuva", "vendaval", "granizo", "geada", "variacao_termica"], vigenciaInicio: "2026-01-01", vigenciaFim: "2026-12-31", canal: "E-mail", origem: "carteira-ficticia-solicitada" },
];

export function garantirCarteiraInicial() {
  if (all<Segurado>("customers").length > 0) return false;
  transaction(() => CARTEIRA_INICIAL.forEach(segurado => put("customers", segurado.apolice, segurado)));
  return true;
}
