import { createHash, randomUUID } from "node:crypto";
import { all, get, put, transaction } from "./store.js";
import { AppError, type Evento, type Segurado, type Comunicacao } from "./domain.js";
import { coletarAvisos } from "./weather.js";
import { decidir, VERSAO_REGRA, identificarRiscos } from "./rules.js";
import { gerarMensagemComGemini } from "./mensagens.js";
export interface Execucao { id:string; inicio:string; fim?:string; status:string; eventos:number; segurados:number; elegiveis:number; geradas:number; existentes:number; pendentes:number; erros:string[]; }
let running:Promise<Execucao>|undefined;
export function executar():Promise<Execucao> {
  if (running) return running;
  running=run().finally(()=>{running=undefined;});
  return running;
}
export const emExecucao=()=>Boolean(running);
async function run():Promise<Execucao> {
  const r:Execucao={id:randomUUID(),inicio:new Date().toISOString(),status:"executando",eventos:0,segurados:0,elegiveis:0,geradas:0,existentes:0,pendentes:0,erros:[]};
  put("runs",r.id,r);
  try {
    const {eventos,raw,coletadoEm}=await coletarAvisos();
    // Prioriza SMS para que o canal de maior urgência tenha a primeira vaga
    // quando a cota do provedor limita a quantidade de mensagens por ciclo.
    const clientes=all<Segurado>("customers").sort((a,b)=>Number(b.canal === "SMS")-Number(a.canal === "SMS"));
    r.eventos=eventos.length;r.segurados=clientes.length;
    transaction(()=>{
      put("sources",r.id,{fonte:"INMET",coletadoEm,raw});
      eventos.forEach(e=>put("events",e.id,e));
      put("meta","coleta",{coletadoEm,ids:eventos.map(e=>e.id),execucaoId:r.id});
    });
    const max=Math.max(1,Math.min(200,Number(process.env.MAX_MESSAGES_PER_RUN)||50));
    let generationError:string|undefined;
    for (const evento of eventos) for (const segurado of clientes) {
      const decisao=decidir(evento,segurado);
      put("decisions",`${r.id}:${evento.id}:${segurado.apolice}`,{execucaoId:r.id,eventId:evento.id,apolice:segurado.apolice,...decisao});
      if (!decisao.elegivel) continue;
      r.elegiveis++;
      const id=createHash("sha256").update(JSON.stringify([evento.revisao,segurado,VERSAO_REGRA])).digest("hex");
      if(get<Comunicacao>("communications",id)){r.existentes++;continue;}
      if(r.geradas>=max || generationError){r.pendentes++;continue;}
      try {
        const result=await gerarMensagemComGemini(evento,segurado,decisao);
        // O aviso pode expirar enquanto aguardamos a geração.
        if(!decidir(evento,segurado).elegivel){r.pendentes++;continue;}
        const {nome:_nome,apolice:_apolice,...perfil}=segurado;
        const comm:Comunicacao={id,eventId:evento.id,eventoTipo:evento.tipo,apolice:segurado.apolice,regiao:segurado.regiao,
          canal:segurado.canal,status:"Aguardando revisão",segurados:1,geradoEm:new Date().toISOString(),
          ...result,decisao,contexto:{evento,segurado:perfil}};
        put("communications",id,comm);r.geradas++;
      } catch(e) {
        generationError=e instanceof Error?e.message:"Falha na geração.";
        r.erros.push(generationError);r.pendentes++;
      }
    }
    r.status=!clientes.length?"aguardando_carteira":r.erros.length?"erro_ia":r.pendentes?"parcial":"concluida";
  } catch(e) {r.status="erro_coleta";r.erros.push(e instanceof Error?e.message:"Falha inesperada.");}
  r.fim=new Date().toISOString();put("runs",r.id,r);put("meta","ultima_execucao",r);
  return r;
}
export function statusEvento(e:Evento) {
  return Date.now()>Date.parse(e.fim)?"Encerrado":Date.now()<Date.parse(e.inicio)?"Monitorando":"Ativo";
}
export function eventosUI() {
  const clientes=all<Segurado>("customers");
  const current=get<{ids:string[]}>("meta","coleta")?.ids || [];
  return all<Evento>("events").map(e=> {
    const selected=current.includes(e.id)?clientes.filter(c=>decidir(e,c).elegivel):[];
    return {...e,severidade:({"Grande Perigo":"Crítico","Perigo":"Alto","Perigo Potencial":"Moderado"} as Record<string,string>)[e.severidade]||"Baixo",
      status:current.includes(e.id)?statusEvento(e):"Encerrado",regiao:e.estados.join(", "),
      detectadoEm:new Date(e.inicio).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"}),previsao:new Date(e.fim).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"}),
      segurados:selected.length,regra:`${VERSAO_REGRA}: município afetado + vigência + produto + cobertura declarada. Riscos identificados: ${identificarRiscos(e).join(", ") || "fora do escopo"}.`,
      tipoSeguro:[...new Set(selected.map(c=>c.produto))].join(", ") || "nenhum produto elegível"};
  });
}
export function requireComm(id:string) {
  const comm=get<Comunicacao>("communications",id);
  if(!comm) throw new AppError(404,"Comunicação não encontrada.");
  return comm;
}
function currentContext(comm:Comunicacao) {
  const evento=get<Evento>("events",comm.eventId);
  const cliente=get<Segurado>("customers",comm.apolice);
  const ids=get<{ids:string[]}>("meta","coleta")?.ids||[];
  if(!evento||!cliente||!ids.includes(evento.id)||evento.revisao!==comm.contexto.evento.revisao) throw new AppError(409,"Aviso ou cadastro alterado; execute o agente novamente.");
  const decisao=decidir(evento,cliente);
  if(!decisao.elegivel) throw new AppError(409,decisao.motivos.join(" "));
  const {nome:_n,apolice:_a,...perfil}=cliente;
  if(JSON.stringify(perfil)!==JSON.stringify(comm.contexto.segurado)) throw new AppError(409,"Perfil alterado; gere uma nova comunicação.");
  return {evento,cliente,decisao};
}
export async function regenerar(id:string) {
  const comm=requireComm(id);
  if(comm.status==="Enviada") throw new AppError(409,"Comunicação já enviada.");
  const {evento,cliente,decisao}=currentContext(comm);
  const result=await gerarMensagemComGemini(evento,cliente,decisao,true);
  // Não sobrescrever edição ou envio concorrente.
  if(JSON.stringify(requireComm(id))!==JSON.stringify(comm)) throw new AppError(409,"Comunicação alterada durante a geração.");
  currentContext(comm);
  const updated={...comm,...result,status:"Aguardando revisão" as const};
  put("communications",id,updated);return updated;
}
export function editar(id:string,texto:unknown) {
  const comm=requireComm(id);
  if(comm.status==="Enviada") throw new AppError(409,"Comunicação já enviada.");
  if(typeof texto!=="string" || !texto.trim() || texto.length>4000) throw new AppError(400,"Texto deve conter entre 1 e 4000 caracteres.");
  currentContext(comm);
  const updated={...comm,texto:texto.trim(),status:"Revisada" as const};put("communications",id,updated);return updated;
}
export async function enviar(id:string) {
  const comm=requireComm(id);
  if(comm.status==="Enviada") return comm;
  // Revalidar avisos na fonte antes de registrar o envio.
  const {eventos,coletadoEm,raw}=await coletarAvisos();
  transaction(()=>{
    eventos.forEach(e=>put("events",e.id,e));
    put("sources",randomUUID(),{fonte:"INMET",coletadoEm,raw});
    put("meta","coleta",{coletadoEm,ids:eventos.map(e=>e.id)});
  });
  currentContext(comm);
  return transactionResult(id);
}
function transactionResult(id:string) {
  let updated:Comunicacao;
  transaction(()=>{
    const comm=requireComm(id);
    if(comm.status==="Enviada"){updated=comm;return;}
    currentContext(comm);
    const cliente=all<Segurado>("customers").find(c=>c.apolice===comm.apolice);
    if (!cliente) throw new AppError(409,"Segurado não encontrado; não foi possível enviar o alerta.");
    if (cliente.canal === "SMS" && (!cliente.telefone || !/^\d{10,13}$/.test(cliente.telefone))) {
      const erro="Não foi possível enviar o SMS: telefone ausente ou inválido.";
      put("technical_logs",randomUUID(),{tipo:"falha_envio",comunicacaoId:id,apolice:comm.apolice,erro,oculto:true,em:new Date().toISOString()});
      throw new AppError(502,erro);
    }
    const destinatario=cliente.canal === "SMS" ? cliente.telefone! : cliente.apolice;
    const mensagem=cliente.canal === "SMS" ? "Alerta SMS enviado com sucesso." : "Alerta por e-mail enviado com sucesso.";
    updated={...comm,status:"Enviada",enviadaEm:new Date().toISOString(),notificacao:{status:"confirmada",mensagem,canal:cliente.canal,destinatario}};
    put("communications",id,updated);
    put("history",id,{id,eventId:comm.eventId,eventoTipo:comm.eventoTipo,regiao:comm.regiao,segurados:1,canal:comm.canal,
      status:"Enviada",horario:updated.enviadaEm,texto:comm.texto,modelo:comm.modelo,notificacao:updated.notificacao});
  });
  return updated!;
}
/** Compatibilidade com clientes antigos que ainda chamam a rota de simulação. */
export const simular = enviar;
