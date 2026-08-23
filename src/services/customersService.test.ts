import { describe, expect, it, vi } from "vitest";
import { getAllCustomers, getCustomersForEvent } from "./customersService";
import { getTestCustomers } from "./testCustomersSource";
import type { Customer } from "../types/customer";

vi.mock("./testCustomersSource", () => ({
  getTestCustomers: vi.fn(),
}));

const CUSTOMERS: Customer[] = [
  { nome: "Marina Alves", apolice: "RES-1", regiao: "São Paulo, SP", statusComunicacao: "Aguardando revisão", codigoIbge: "3550308" },
  { nome: "Fernanda Lima", apolice: "RES-2", regiao: "Porto Alegre, RS", statusComunicacao: "Aguardando revisão", codigoIbge: "4314902" },
];

describe("customersService", () => {
  it("getAllCustomers returns every test segurado", async () => {
    vi.mocked(getTestCustomers).mockResolvedValueOnce(CUSTOMERS);

    expect(await getAllCustomers()).toEqual(CUSTOMERS);
  });

  it("getCustomersForEvent filters by geocode", async () => {
    vi.mocked(getTestCustomers).mockResolvedValueOnce(CUSTOMERS);

    const customers = await getCustomersForEvent("inmet-1", ["4314902"]);

    expect(customers).toEqual([CUSTOMERS[1]]);
  });

  it("getCustomersForEvent returns an empty list when no geocodes are given", async () => {
    vi.mocked(getTestCustomers).mockResolvedValueOnce(CUSTOMERS);

    expect(await getCustomersForEvent("inmet-2")).toEqual([]);
  });
});
