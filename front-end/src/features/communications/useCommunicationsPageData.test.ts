import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCommunicationsPageData } from "./useCommunicationsPageData";
import * as communicationsService from "../../services/communicationsService";
import * as eventsService from "../../services/eventsService";
import type { WeatherEvent } from "../../types/event";
import type { CommunicationWithEvent } from "../../types/communication";

const EVENT: WeatherEvent = {
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
  geocodesMunicipios: [],
};

const COMMUNICATION: CommunicationWithEvent = {
  id: "c1",
  eventId: "inmet-1",
  canal: "SMS",
  status: "Aguardando revisão",
  segurados: 0,
  geradoEm: "08:30",
  eventoTipo: "Vendaval",
};

describe("useCommunicationsPageData", () => {
  it("loads every communication and a lookup of every event by id", async () => {
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([COMMUNICATION]);
    vi.spyOn(eventsService, "getAllEvents").mockResolvedValueOnce([EVENT]);

    const { result } = renderHook(() => useCommunicationsPageData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.communications).toHaveLength(1);
    expect(result.current.data?.eventsById["inmet-1"]).toMatchObject({ tipo: "Vendaval" });
  });

  it("returns empty data when there is nothing real yet", async () => {
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([]);
    vi.spyOn(eventsService, "getAllEvents").mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCommunicationsPageData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.communications).toEqual([]);
    expect(result.current.data?.eventsById).toEqual({});
  });
});
