import { describe, expect, it } from "vitest";
import { matchCustomersByGeocodes } from "./geoMatch";
import type { Customer } from "../types/customer";

const CUSTOMERS: Customer[] = [
  { nome: "Marina Alves", apolice: "RES-1", regiao: "Porto Alegre, RS", statusComunicacao: "Simulada", codigoIbge: "4314902" },
  { nome: "Fernanda Lima", apolice: "RES-2", regiao: "Canoas, RS", statusComunicacao: "Simulada", codigoIbge: "4304606" },
];

describe("matchCustomersByGeocodes", () => {
  it("returns customers whose codigoIbge is among the given geocodes", () => {
    expect(matchCustomersByGeocodes(CUSTOMERS, ["4304606"])).toEqual([CUSTOMERS[1]]);
  });

  it("returns an empty list when no geocodes are given", () => {
    expect(matchCustomersByGeocodes(CUSTOMERS, [])).toEqual([]);
  });

  it("returns an empty list when no customer matches", () => {
    expect(matchCustomersByGeocodes(CUSTOMERS, ["9999999"])).toEqual([]);
  });
});
