import "dotenv/config";
import cors from "cors";
import express, { type Request, type Response, type NextFunction } from "express";
import { pathToFileURL } from "node:url";
import { AppError, validarSegurados, PRODUTOS, RISCOS, type Segurado, type Evento, type Comunicacao } from "./domain.js";
import { all, get, put, transaction } from "./store.js";
import { executar, emExecucao, eventosUI, requireComm, regenerar, editar, enviar, simular, type Execucao } from "./pipeline.js";
import { MODELO, PROVEDOR, GEMINI_MODELO, GROQ_MODELO, verificarGemini } from "./mensagens.js";
import { decidir, MATRIZ, VERSAO_REGRA, FONTE_REGRA } from "./rules.js";
import { garantirCarteiraInicial, migrarStatusEnvio } from "./seed.js";
garantirCarteiraInicial();
migrarStatusEnvio();
const app=express();
app.disable("x-powered-by");
const origins=(process.env.CORS_ORIGINS||"http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173").split(",");
app.use((req,res,next)=>{
  if(req.headers.origin && !origins.includes(req.headers.origin)){res.status(403).json({erro:"Origem não permitida."});return;}
  res.setHeader("Cache-Control","no-store");next();
});
app.use(cors({origin:origins}));
app.use(express.json({limit:"5mb"}));
const route=(fn:(req:Request,res:Response)=>Promise<unknown>|unknown)=>(req:Request,res:Response,next:NextFunction)=>{Promise.resolve().then(()=>fn(req,res)).catch(next);};
app.get("/api/health",(_req,res)=>res.json({status:"ok",provedor:PROVEDOR,modelo:MODELO,carteira:all("customers").length,executando:emExecucao(),ultimaExecucao:get("meta","ultima_execucao"),ia:get("meta","ia")||{provedor:PROVEDOR,modelo:MODELO,disponivel:null}}));
app.get("/api/ia/provedores",(_req,res)=>res.json({ativo:PROVEDOR,provedores:[
  {id:"gemini",modelo:GEMINI_MODELO,configurado:Boolean(process.env.GEMINI_API_KEY?.trim())},
  {id:"groq",modelo:GROQ_MODELO,configurado:Boolean(process.env.GROQ_API_KEY?.trim()),endpoint:"https://api.groq.com/openai/v1/chat/completions"},
]}));
app.get("/api/regras",(_req,res)=>res.json({versao:VERSAO_REGRA,fonte:FONTE_REGRA,produtos:PRODUTOS,riscos:RISCOS,matriz:MATRIZ,antecedenciaHoras:72,
  criterio:"Município IBGE, vigência e interseção evento × produto × cobertura declarada; não determina indenização."}));
app.get("/api/eventos",(_req,res)=>res.json(eventosUI()));
app.get("/api/segurados",(_req,res)=>res.json(all<Segurado>("customers").map(c=>({...c,statusComunicacao:"Preparada"}))));
app.get("/api/eventos/:id/segurados",(req,res)=>{
  const e=get<Evento>("events",req.params.id);
  if(!e){res.status(404).json({erro:"Evento não encontrado."});return;}
  const current=get<{ids:string[]}>("meta","coleta")?.ids||[];
  const comms=all<Comunicacao>("communications").filter(c=>c.eventId===e.id);
  res.json(current.includes(e.id)?all<Segurado>("customers").filter(c=>decidir(e,c).elegivel).map(c=>({...c,
    statusComunicacao:comms.find(m=>m.apolice===c.apolice)?.status||"Preparada"})):[]);
});
app.post("/api/segurados",route(async(req,res)=>{
  if(emExecucao()) throw new AppError(409,"Aguarde a execução atual antes de importar a carteira.");
  const clientes=validarSegurados(req.body);
  // A API de municípios valida códigos reais; nunca cria segurados automaticamente.
  let response:globalThis.Response;
  try {response=await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome",{signal:AbortSignal.timeout(30000)});}
  catch {throw new AppError(502,"Não foi possível validar municípios no IBGE.");}
  if(!response.ok) throw new AppError(502,"API IBGE indisponível para validar a carteira.");
  const municipios=await response.json() as {id:number}[];
  if(!Array.isArray(municipios)) throw new AppError(502,"Resposta IBGE inválida.");
  const ids=new Set(municipios.map(m=>String(m.id)));
  if(clientes.some(c=>!ids.has(c.codigoIbge))) throw new AppError(400,"Carteira contém município inexistente no IBGE.");
  transaction(()=>clientes.forEach(c=>put("customers",c.apolice,c)));
  res.status(201).json({importados:clientes.length,total:all("customers").length});
}));
app.post("/api/agente/executar",route(async(_req,res)=>res.json(await executar())));
app.get("/api/execucoes",(_req,res)=>res.json(all("runs")));
app.get("/api/execucoes/:id/decisoes",(req,res)=>res.json(all<{execucaoId:string}>("decisions").filter(d=>d.execucaoId===req.params.id)));
app.post("/api/ia/verificar",route(async(_req,res)=>{
  try {const result=await verificarGemini();put("meta","ia",result);res.json(result);}
  catch(e){put("meta","ia",{modelo:MODELO,disponivel:false,verificadoEm:new Date().toISOString(),erro:e instanceof Error?e.message:"Erro na IA."});throw e;}
}));
app.get("/api/comunicacoes",(_req,res)=>res.json(all<Comunicacao>("communications")));
app.get("/api/comunicacoes/:id",route((req,res)=>res.json(requireComm(req.params.id))));
app.put("/api/comunicacoes/:id/texto",route((req,res)=>res.json(editar(req.params.id,req.body?.texto))));
app.post("/api/comunicacoes/:id/regenerar",route(async(req,res)=>res.json(await regenerar(req.params.id))));
app.post("/api/comunicacoes/:id/enviar",route(async(req,res)=>res.json(await enviar(req.params.id))));
app.post("/api/comunicacoes/:id/simular",route(async(req,res)=>res.json(await simular(req.params.id))));
app.get("/api/historico",(_req,res)=>res.json(all("history")));
// Compatibilidade por ID: o servidor mantém o contexto autorizado, sem aceitar avisos inventados no corpo.
app.post("/api/regenerar-mensagem",route(async(req,res)=>{
  if(typeof req.body?.communicationId!=="string") throw new AppError(400,"communicationId é obrigatório.");
  res.json(await regenerar(req.body.communicationId));
}));
app.post("/api/gerar-mensagem",route(async(_req,res)=>res.json(await executar())));
app.get("/api/monitoramento",(_req,res)=>{
  const r=get<Execucao>("meta","ultima_execucao");
  const last=get<{coletadoEm:string}>("meta","coleta");
  const stale=!last||Date.now()-Date.parse(last.coletadoEm)>65*60000;
  const ia=get<{disponivel:boolean}>("meta","ia");
  const state=emExecucao()?"atualizando":stale||r?.erros.length?"indisponivel":"ativo";
  const label=emExecucao()?"Atualizando avisos":stale?"Coleta indisponível":!all("customers").length?"Avisos reais · carteira não cadastrada":ia?.disponivel===false?"IA indisponível":r?.erros.length?"Agente com erro":"Monitoramento ativo";
  res.json({state:ia?.disponivel===false&&!emExecucao()?"indisponivel":state,label,lastUpdateLabel:last?
    "Última coleta: "+new Date(last.coletadoEm).toLocaleString("pt-BR",{timeZone:"America/Sao_Paulo"}):"Ainda sem coleta concluída"});
});
app.use((_req,res)=>res.status(404).json({erro:"Rota não encontrada."}));
app.use((error:unknown,_req:Request,res:Response,_next:NextFunction)=>{
  const e=error as {status?:number};
  const status=error instanceof AppError?error.status:e.status===400?400:e.status===413?413:500;
  res.status(status).json({erro:error instanceof AppError?error.message:status===400?"JSON inválido.":status===413?"Arquivo excede 5 MB.":"Erro interno no backend."});
});
export function start() {
  if(process.env.VERCEL) throw new Error("Esta versão usa SQLite e agendamento em processo; execute em servidor persistente.");
  const port=Number(process.env.PORT)||3001;
  const server=app.listen(port,"127.0.0.1",()=>{
    console.log(`Vigia API: http://localhost:${port} | Modelo: ${MODELO}`);
    void executar().catch(()=>console.error("Falha no ciclo inicial."));
  });
  const interval=setInterval(()=>{void executar().catch(()=>console.error("Falha no ciclo agendado."));},Math.max(60000,Number(process.env.POLL_INTERVAL_MS)||1800000));
  interval.unref();
  server.on("close",()=>clearInterval(interval));
  return server;
}
if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) start();
export {app};
