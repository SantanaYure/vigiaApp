import {it,expect} from "vitest";
import {getAllCustomers,getCustomersForEvent} from "./customersService";
import {getAllEvents} from "./eventsService";
it("consulta a carteira importada e seleção real por evento",async()=>{
 const rows=await getAllCustomers();expect(Array.isArray(rows)).toBe(true);
 const events=await getAllEvents();
 for(const event of events.slice(0,2)){
  const selected=await getCustomersForEvent(event.id);
  expect(selected.length).toBe(event.segurados);
  expect(selected.every(c=>rows.some(r=>r.apolice===c.apolice)&&event.geocodesMunicipios.includes(c.codigoIbge))).toBe(true);
 }
});
