import { type Evento, type Segurado, type Decisao, type Produto, type Risco } from "./domain.js";
export const VERSAO_REGRA = "etapa1-v1";
export const FONTE_REGRA = "Etapa 1 - Levantamento de riscos climáticos.docx, Anexo 1";
export const MATRIZ: Record<Produto,Risco[]> = {
  agricola:["seca","calor","chuva","alagamento","vendaval","ciclone","granizo","geada","incendio","cheia","raio","tromba_dagua","variacao_termica"],
  residencial:["chuva","alagamento","vendaval","ciclone","granizo","deslizamento","incendio","cheia","raio","tromba_dagua"],
  empresarial:["chuva","alagamento","vendaval","ciclone","granizo","deslizamento","incendio","cheia","raio","tromba_dagua","variacao_termica"],
  automovel:["chuva","alagamento","vendaval","ciclone","granizo","deslizamento","incendio","cheia","raio","tromba_dagua"],
  engenharia:["chuva","alagamento","vendaval","ciclone","granizo","deslizamento","incendio","cheia","raio","tromba_dagua"],
  transportes:["calor","chuva","alagamento","vendaval","ciclone","granizo","incendio","cheia","raio","tromba_dagua","variacao_termica"],
  parametrico:["seca","calor","chuva","vendaval","granizo","geada","variacao_termica"],
  responsabilidade_civil:["seca","calor","chuva","alagamento","vendaval","ciclone","granizo","geada","deslizamento","incendio","cheia","raio","tromba_dagua","variacao_termica"]
};
const expressions: [Risco,RegExp][] = [
  ["seca",/\bseca\b|estiagem/],["calor",/onda de calor|calor extremo/],
  ["chuva",/chuva|tempestade|temporal/],["alagamento",/alagamento|enxurrada/],
  ["vendaval",/vendaval|vento|rajada/],["ciclone",/ciclone|tornado|furacao/],
  ["granizo",/granizo/],["geada",/geada/],["deslizamento",/deslizamento|desmoronamento/],
  ["incendio",/incendio|queimada/],["cheia",/inundacao|cheia/],["raio",/raio|descarga eletrica/],
  ["tromba_dagua",/tromba.*agua/],["variacao_termica",/declinio de temperatura|variacao.*temperatura|onda de frio/]
];
export function identificarRiscos(evento:Evento): Risco[] {
  const text = [evento.tipo,...evento.riscos].join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  return expressions.filter(([,re])=>re.test(text)).map(([r])=>r);
}
export function decidir(evento:Evento, segurado:Segurado, agora = Date.now()): Decisao {
  const motivos:string[]=[];
  const riscos=identificarRiscos(evento).filter(r=>MATRIZ[segurado.produto].includes(r) && segurado.coberturas.includes(r));
  if (Date.parse(evento.fim) <= agora) motivos.push("Aviso encerrado.");
  if (Date.parse(evento.inicio) > agora + 72*3600000) motivos.push("Aviso fora da antecedência de 72 horas.");
  if (!["Perigo Potencial","Perigo","Grande Perigo"].includes(evento.severidade)) motivos.push("Severidade não reconhecida.");
  if (!evento.geocodesMunicipios.includes(segurado.codigoIbge)) motivos.push("Município fora da área afetada.");
  const inicio=Date.parse(segurado.vigenciaInicio+"T00:00:00-03:00");
  const fim=Date.parse(segurado.vigenciaFim+"T23:59:59-03:00");
  if (agora < inicio || agora > fim || fim < Date.parse(evento.inicio)) motivos.push("Apólice fora de vigência.");
  if (!riscos.length) motivos.push("Nenhuma cobertura declarada corresponde ao risco e produto.");
  const elegivel=motivos.length===0;
  if (elegivel) motivos.push("Município afetado, apólice vigente e cobertura declarada correspondente à matriz da Etapa 1.");
  return {elegivel,motivos,riscos,versaoRegra:VERSAO_REGRA};
}
