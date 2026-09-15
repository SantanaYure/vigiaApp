import {it,expect} from "vitest";
it("expõe Gemini padrão e Groq opcional sem expor credenciais",async()=>{
  const response=await fetch((process.env.VIGIA_API_URL||"http://localhost:3001")+"/api/ia/provedores");
  const body=await response.json();
  expect(response.status).toBe(200);expect(body.ativo).toBe("gemini");
  expect(body.provedores).toEqual(expect.arrayContaining([
    expect.objectContaining({id:"gemini",modelo:"gemini-3.5-flash"}),
    expect.objectContaining({id:"groq",modelo:"openai/gpt-oss-120b"}),
  ]));
  expect(typeof body.provedores.find((p:{id:string})=>p.id==="groq")?.configurado).toBe("boolean");
  expect(JSON.stringify(body)).not.toContain("AIza");
});
