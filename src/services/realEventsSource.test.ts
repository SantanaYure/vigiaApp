import { afterEach, describe, expect, it, vi } from "vitest";
import { getRealEvents } from "./realEventsSource";
import { getAllCustomers } from "./customersService";
import type { Customer } from "../types/customer";

vi.mock("./customersService", () => ({
  getAllCustomers: vi.fn().mockResolvedValue([]),
}));

function mockFetchOnce(body: unknown, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(body),
    }),
  );
}

const FIXTURE_CUSTOMERS: Customer[] = [
  { nome: "Marina Alves", apolice: "RES-1", regiao: "Fortaleza, CE", statusComunicacao: "Simulada", codigoIbge: "4314902" },
  { nome: "Carlos Souza", apolice: "RES-2", regiao: "Fortaleza, CE", statusComunicacao: "Simulada", codigoIbge: "4314902" },
];

const AVISO_BASE = {
  id: 1,
  tipo: "Chuvas Intensas",
  cor: "#FF8C00",
  estados: ["Ceará"],
  geocodes_municipios: ["4314902"],
  riscos: ["Alagamentos"],
  instrucoes: ["Evite áreas de risco"],
  fonte: "INMET",
};

describe("getRealEvents", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps INMET avisos into WeatherEvent, matching segurados by geocode", async () => {
    vi.mocked(getAllCustomers).mockResolvedValueOnce(FIXTURE_CUSTOMERS);
    mockFetchOnce([
      {
        ...AVISO_BASE,
        severidade: "Perigo",
        inicio: new Date(Date.now() - 60_000).toISOString(),
        fim: new Date(Date.now() + 60_000).toISOString(),
      },
    ]);

    const events = await getRealEvents();

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      id: "inmet-1",
      tipo: "Chuvas Intensas",
      severidade: "Alto",
      status: "Ativo",
      geocodesMunicipios: ["4314902"],
      segurados: 2,
    });
  });

  it("marks an aviso that hasn't started yet as Monitorando", async () => {
    mockFetchOnce([
      {
        ...AVISO_BASE,
        severidade: "Perigo Potencial",
        inicio: new Date(Date.now() + 60_000).toISOString(),
        fim: new Date(Date.now() + 120_000).toISOString(),
      },
    ]);

    const events = await getRealEvents();

    expect(events[0]).toMatchObject({ status: "Monitorando", severidade: "Moderado" });
  });

  it("returns an empty list when the request fails", async () => {
    mockFetchOnce(null, false);

    expect(await getRealEvents()).toEqual([]);
  });

  it("returns an empty list when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    expect(await getRealEvents()).toEqual([]);
  });
});
