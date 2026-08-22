import { describe, expect, it } from "vitest";
import { getAllCommunications } from "./communicationsService";

describe("communicationsService", () => {
  it("returns every communication enriched with its event's tipo", async () => {
    const communications = await getAllCommunications();

    expect(communications).toHaveLength(4);
    expect(communications[0]).toMatchObject({ id: "c1", eventoTipo: "Chuva intensa" });
    expect(communications[1]).toMatchObject({ id: "c2", eventoTipo: "Granizo" });
  });
});
