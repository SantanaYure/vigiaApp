import {it,expect} from "vitest";
import {getRealEvents} from "./realEventsSource";
it("consulta eventos do backend sem arquivo estático ou fallback",async()=>{
 const events=await getRealEvents();expect(Array.isArray(events)).toBe(true);
 for(const event of events){expect(event.id).toMatch(/^inmet-/);expect(event.regra).toContain("etapa1-v1");}
});
