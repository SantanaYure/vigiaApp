import {it,expect} from "vitest";
import {getAllCommunications,getCommunicationText} from "./communicationsService";
it("lê somente comunicações persistidas pelo servidor real",async()=>{
 const rows=await getAllCommunications();expect(Array.isArray(rows)).toBe(true);
 for(const row of rows.slice(0,3)){expect((await getCommunicationText(row.id)).length).toBeGreaterThan(0);expect(row.segurados).toBe(1);}
});
