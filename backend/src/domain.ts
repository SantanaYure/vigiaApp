export const PRODUTOS = ["agricola", "residencial", "empresarial", "automovel", "engenharia", "transportes", "parametrico", "responsabilidade_civil"] as const;
export type Produto = typeof PRODUTOS[number];
export const RISCOS = ["seca", "calor", "chuva", "alagamento", "vendaval", "ciclone", "granizo", "geada", "deslizamento", "incendio", "cheia", "raio", "tromba_dagua", "variacao_termica"] as const;
export type Risco = typeof RISCOS[number];
export interface Segurado {
  apolice: string; nome: string; codigoIbge: string; regiao: string;
  produto: Produto; coberturas: Risco[]; vigenciaInicio: string; vigenciaFim: string;
  canal: "SMS" | "E-mail"; telefone?: string; origem: string;
}
export interface Evento {
  id: string; tipo: string; severidade: string; inicio: string; fim: string;
  estados: string[]; geocodesMunicipios: string[]; riscos: string[]; instrucoes: string[];
  fonte: "INMET"; fonteUrl: string; coletadoEm: string; revisao: string;
}
export interface Decisao {
  elegivel: boolean; motivos: string[]; riscos: Risco[]; versaoRegra: string;
}
export interface Comunicacao {
  id: string; eventId: string; eventoTipo: string; apolice: string; regiao: string;
  canal: "SMS" | "E-mail"; status: "Aguardando revisão" | "Revisada" | "Simulada";
  segurados: number; geradoEm: string; texto: string; modelo: string;
  decisao: Decisao; contexto: { evento: Evento; segurado: Omit<Segurado, "nome" | "apolice"> };
  simuladaEm?: string;
  notificacao?: { status: "confirmada"; mensagem: string; canal: "SMS" | "E-mail"; destinatario: string };
}
export class AppError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function validarSegurados(input: unknown): Segurado[] {
  if (!Array.isArray(input) || input.length === 0 || input.length > 10000)
    throw new AppError(400, "Informe uma lista de 1 a 10000 segurados reais.");
  const seen = new Set<string>();
  return input.map((item, index) => {
    const fail = (reason: string): never => { throw new AppError(400, `Registro ${index + 1}: ${reason}`); };
    if (!item || typeof item !== "object") return fail("registro inválido.");
    for (const key of ["apolice", "nome", "codigoIbge", "regiao", "origem"])
      if (typeof item[key] !== "string" || !item[key].trim() || item[key].length > 250) fail(`campo ${key} inválido.`);
    if (!/^\d{7}$/.test(item.codigoIbge)) fail("codigoIbge deve conter 7 dígitos.");
    if (!PRODUTOS.includes(item.produto)) fail("produto não reconhecido; consulte /api/regras.");
    if (!Array.isArray(item.coberturas) || !item.coberturas.length || item.coberturas.some((v: Risco) => !RISCOS.includes(v))) fail("coberturas não reconhecidas.");
    for (const key of ["vigenciaInicio", "vigenciaFim"]) {
      const value = item[key];
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)
        fail(`campo ${key} deve ser uma data válida YYYY-MM-DD.`);
    }
    if (item.vigenciaInicio > item.vigenciaFim) fail("vigência invertida.");
    if (!["SMS", "E-mail"].includes(item.canal)) fail("canal inválido.");
    if (item.canal === "SMS" && (typeof item.telefone !== "string" || !/^\d{10,13}$/.test(item.telefone)))
      fail("telefone deve conter de 10 a 13 dígitos para SMS.");
    if (seen.has(item.apolice)) fail("apólice duplicada.");
    seen.add(item.apolice);
    return { apolice:item.apolice.trim(), nome:item.nome.trim(), codigoIbge:item.codigoIbge, regiao:item.regiao.trim(),
      produto:item.produto, coberturas:[...new Set<Risco>(item.coberturas)], vigenciaInicio:item.vigenciaInicio,
      vigenciaFim:item.vigenciaFim, canal:item.canal, telefone:item.telefone, origem:item.origem.trim() };
  });
}
