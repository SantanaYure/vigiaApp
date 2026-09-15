import {it,expect} from "vitest";
import {getHistory} from "./historyService";
it("consulta histórico persistido da API real",async()=>{
 const rows=await getHistory();expect(Array.isArray(rows)).toBe(true);
 for(const row of rows){expect(row.status).toBe("Simulada");expect(Number.isFinite(Date.parse(row.horario))).toBe(true);}
});
