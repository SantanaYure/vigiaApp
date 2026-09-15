import { createHash } from "node:crypto";
import { AppError, type Evento } from "./domain.js";
export const INMET_URL = "https://apiprevmet3.inmet.gov.br/avisos/ativos";
const split = (v: unknown): string[] => typeof v === "string" ? v.split(",").map(x=>x.trim()).filter(Boolean) : [];
function date(data: unknown, hora: unknown): string {
  if (typeof data !== "string" || typeof hora !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(data) || !/^\d{2}:\d{2}$/.test(hora))
    throw new AppError(502,"INMET retornou data ou hora inválida.");
  // Os campos de aviso representam horário de Brasília (UTC-03), não a meia-noite Z do campo data.
  const d = new Date(`${data.slice(0,10)}T${hora}:00-03:00`);
  if (!Number.isFinite(d.getTime())) throw new AppError(502,"Data INMET inválida.");
  return d.toISOString();
}
export function normalizarAvisos(raw: unknown, coletadoEm = new Date().toISOString()): Evento[] {
  if (!raw || typeof raw !== "object" || !Array.isArray((raw as Record<string,unknown>).hoje))
    throw new AppError(502,"Formato inesperado da API INMET.");
  const data = raw as Record<string, unknown>;
  const avisos = [...(data.hoje as unknown[]), ...(Array.isArray(data.futuro) ? data.futuro : []), ...(Array.isArray(data.amanha) ? data.amanha : [])];
  const seen = new Map<string,Evento>();
  for (const value of avisos) {
    if (!value || typeof value !== "object") throw new AppError(502,"Aviso INMET inválido.");
    const a = value as Record<string,unknown>;
    if (a.encerrado === true) continue;
    if (typeof a.id !== "number" || typeof a.descricao !== "string" || typeof a.severidade !== "string")
      throw new AppError(502,"Aviso INMET sem identificação ou severidade.");
    const strings = (v:unknown) => Array.isArray(v) && v.every(x=>typeof x === "string") ? v as string[] : [];
    const e: Evento = { id:`inmet-${a.id}`,tipo:a.descricao,severidade:a.severidade,
      inicio:date(a.data_inicio,a.hora_inicio),fim:date(a.data_fim,a.hora_fim),
      estados:split(a.estados),geocodesMunicipios:split(a.geocodes),
      riscos:strings(a.riscos),instrucoes:strings(a.instrucoes),fonte:"INMET",fonteUrl:INMET_URL,
      coletadoEm,revisao:"" };
    if (e.fim < e.inicio || e.geocodesMunicipios.some(c=>!/^\d{7}$/.test(c)))
      throw new AppError(502,"Vigência ou município inválido no INMET.");
    const {coletadoEm: _col, revisao: _rev, ...stable} = e;
    e.revisao = createHash("sha256").update(JSON.stringify(stable)).digest("hex");
    seen.set(e.id,e);
  }
  return [...seen.values()];
}
export async function coletarAvisos(): Promise<{eventos:Evento[]; raw:unknown; coletadoEm:string}> {
  let response: Response;
  try { response = await fetch(INMET_URL,{signal:AbortSignal.timeout(30000),headers:{Accept:"application/json"}}); }
  catch { throw new AppError(502,"Não foi possível consultar o INMET. Nenhum dado foi simulado."); }
  if (!response.ok) throw new AppError(502,`INMET respondeu HTTP ${response.status}.`);
  let raw: unknown;
  try { raw = await response.json(); } catch { throw new AppError(502,"INMET retornou conteúdo inválido."); }
  const coletadoEm = new Date().toISOString();
  return {eventos:normalizarAvisos(raw,coletadoEm),raw,coletadoEm};
}
