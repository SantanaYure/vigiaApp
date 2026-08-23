import { afterEach, describe, expect, it, vi } from "vitest";
import { getTestCustomers } from "./testCustomersSource";

function mockFetchOnce(body: unknown, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok,
      json: () => Promise.resolve(body),
    }),
  );
}

describe("getTestCustomers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed customer list", async () => {
    const customers = [
      { nome: "Marina Alves", apolice: "RES-1", regiao: "São Paulo, SP", statusComunicacao: "Aguardando revisão", codigoIbge: "3550308" },
    ];
    mockFetchOnce(customers);

    expect(await getTestCustomers()).toEqual(customers);
  });

  it("returns an empty list when the request fails", async () => {
    mockFetchOnce(null, false);

    expect(await getTestCustomers()).toEqual([]);
  });

  it("returns an empty list when fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    expect(await getTestCustomers()).toEqual([]);
  });
});
