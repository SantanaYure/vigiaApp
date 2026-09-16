import {describe,it,expect} from "vitest";
const BASE=process.env.VIGIA_API_URL||"http://localhost:3001";
describe("API local real",()=>{
  it("está disponível e expõe o modelo solicitado",async()=>{
    const response=await fetch(BASE+"/api/health");
    const body=await response.json();
    expect(response.status).toBe(200);expect(body.modelo).toBe("gemini-3.5-flash");expect(body.provedor).toBe("gemini");expect(body.carteira).toBe(5);
  });
  it("rejeita carteira vazia sem inventar clientes",async()=>{
    const response=await fetch(BASE+"/api/segurados",{method:"POST",headers:{"Content-Type":"application/json"},body:"[]"});
    expect(response.status).toBe(400);
  });
  it("publica a matriz da Etapa 1",async()=>{
    const response=await fetch(BASE+"/api/regras");const rules=await response.json();
    expect(rules.riscos.length).toBe(14);expect(rules.fonte).toContain("Etapa 1");
  });
  it("aceita o front-end local mesmo quando o Vite troca de porta",async()=>{
    const response=await fetch(BASE+"/api/monitoramento",{headers:{Origin:"http://localhost:5174"}});
    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:5174");
  });
  it("continua bloqueando origens externas não autorizadas",async()=>{
    const response=await fetch(BASE+"/api/monitoramento",{headers:{Origin:"https://origem-invalida.example"}});
    expect(response.status).toBe(403);
  });
});
