import { describe, expect, it, vi } from "vitest";
import { getActiveEvents, getAllEvents, getEventById } from "./eventsService";
import { getRealEvents } from "./realEventsSource";
import type { WeatherEvent } from "../types/event";

vi.mock("./realEventsSource", () => ({
  getRealEvents: vi.fn(),
}));

const ATIVO: WeatherEvent = {
  id: "inmet-1",
  tipo: "Vendaval",
  severidade: "Alto",
  regiao: "CE · 1 município(s)",
  status: "Ativo",
  detectadoEm: "22/08 08:00",
  previsao: "Até 24/08 20:00",
  segurados: 0,
  regra: "Regra provisória",
  tipoSeguro: "cobertura a definir",
  geocodesMunicipios: ["2300150"],
};

const ENCERRADO: WeatherEvent = { ...ATIVO, id: "inmet-2", tipo: "Geada", status: "Encerrado" };

describe("eventsService", () => {
  it("getAllEvents delegates to getRealEvents", async () => {
    vi.mocked(getRealEvents).mockResolvedValueOnce([ATIVO, ENCERRADO]);

    const events = await getAllEvents();

    expect(events).toEqual([ATIVO, ENCERRADO]);
  });

  it("getActiveEvents filters out Encerrado events", async () => {
    vi.mocked(getRealEvents).mockResolvedValueOnce([ATIVO, ENCERRADO]);

    const events = await getActiveEvents();

    expect(events.map((event) => event.id)).toEqual(["inmet-1"]);
  });

  it("getEventById returns the matching event", async () => {
    vi.mocked(getRealEvents).mockResolvedValueOnce([ATIVO, ENCERRADO]);

    const event = await getEventById("inmet-2");
    expect(event).toMatchObject({ id: "inmet-2", tipo: "Geada" });
  });

  it("getEventById returns null for an unknown id", async () => {
    vi.mocked(getRealEvents).mockResolvedValueOnce([ATIVO]);

    const event = await getEventById("does-not-exist");
    expect(event).toBeNull();
  });
});
