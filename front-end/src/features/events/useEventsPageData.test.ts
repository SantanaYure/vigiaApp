import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useEventsPageData } from "./useEventsPageData";
import { getRealEvents } from "../../services/realEventsSource";
import * as communicationsService from "../../services/communicationsService";

vi.mock("../../services/realEventsSource", () => ({
  getRealEvents: vi.fn().mockResolvedValue([]),
}));

const REAL_EVENT = {
  id: "inmet-1",
  tipo: "Vendaval",
  severidade: "Alto" as const,
  regiao: "CE · 3 município(s)",
  status: "Ativo" as const,
  detectadoEm: "22/08 08:00",
  previsao: "Até 24/08 20:00",
  segurados: 0,
  regra: "Regra provisória",
  tipoSeguro: "cobertura a definir",
  geocodesMunicipios: ["2300150"],
};

describe("useEventsPageData", () => {
  it("loads the events returned by getRealEvents", async () => {
    vi.mocked(getRealEvents).mockResolvedValueOnce([REAL_EVENT]);

    const { result } = renderHook(() => useEventsPageData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.events).toEqual([REAL_EVENT]);
  });

  it("returns an empty event list when there are no real alerts", async () => {
    const { result } = renderHook(() => useEventsPageData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.events).toEqual([]);
  });

  it("builds a lookup of every communication by event id, independent of the events list", async () => {
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([
      { id: "c1", eventId: "inmet-1", canal: "SMS", status: "Simulada", segurados: 0, geradoEm: "08:00", eventoTipo: "Vendaval" },
    ]);

    const { result } = renderHook(() => useEventsPageData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.communicationsByEventId["inmet-1"]).toMatchObject({ id: "c1", canal: "SMS" });
  });
});
