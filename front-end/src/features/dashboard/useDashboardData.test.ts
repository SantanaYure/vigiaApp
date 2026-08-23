import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDashboardData } from "./useDashboardData";
import * as eventsService from "../../services/eventsService";
import * as communicationsService from "../../services/communicationsService";
import type { WeatherEvent } from "../../types/event";

const EVENT: WeatherEvent = {
  id: "inmet-1",
  tipo: "Vendaval",
  severidade: "Alto",
  regiao: "CE · 1 município(s)",
  status: "Ativo",
  detectadoEm: "22/08 08:00",
  previsao: "Até 24/08 20:00",
  segurados: 5,
  regra: "Regra provisória",
  tipoSeguro: "cobertura a definir",
  geocodesMunicipios: ["2300150"],
};

describe("useDashboardData", () => {
  it("computes KPIs from whatever the services return", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockResolvedValueOnce([EVENT]);
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toMatchObject({
      kpiEventosAtivos: 1,
      kpiSegurados: 5,
      kpiComunicacoes: 0,
      kpiSimuladas: 0,
    });
    expect(result.current.data?.attentionEvents.map((e) => e.id)).toEqual(["inmet-1"]);
  });

  it("sorts attentionEvents by severity (Crítico > Alto > Moderado > Baixo), not by API order", async () => {
    const baixo: WeatherEvent = { ...EVENT, id: "inmet-baixo", severidade: "Baixo" };
    const critico: WeatherEvent = { ...EVENT, id: "inmet-critico", severidade: "Crítico" };
    const moderado: WeatherEvent = { ...EVENT, id: "inmet-moderado", severidade: "Moderado" };
    vi.spyOn(eventsService, "getActiveEvents").mockResolvedValueOnce([baixo, critico, moderado]);
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.attentionEvents.map((e) => e.id)).toEqual([
      "inmet-critico",
      "inmet-moderado",
      "inmet-baixo",
    ]);
  });

  it("shows zeroed KPIs and empty lists when there is no real data yet", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockResolvedValueOnce([]);
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toMatchObject({
      kpiEventosAtivos: 0,
      kpiSegurados: 0,
      kpiComunicacoes: 0,
      kpiSimuladas: 0,
      attentionEvents: [],
      recentCommunications: [],
    });
  });

  it("surfaces a rejected fetch as an error", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockRejectedValueOnce(new Error("network down"));
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  });
});
