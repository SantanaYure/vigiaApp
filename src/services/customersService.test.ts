import { describe, expect, it } from "vitest";
import { getCustomersForEvent } from "./customersService";

describe("customersService", () => {
  it("returns the customer pool for any event id", async () => {
    const customers = await getCustomersForEvent("ev1");

    expect(customers).toHaveLength(4);
    expect(customers[0]).toMatchObject({ nome: "Marina Alves", apolice: "RES-88231" });
  });
});
