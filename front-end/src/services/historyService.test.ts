import { describe, expect, it } from "vitest";
import { appendHistoryEntry, getHistory } from "./historyService";

describe("historyService", () => {
  it("starts empty — no real history source exists yet", async () => {
    expect(await getHistory()).toEqual([]);
  });

  it("appendHistoryEntry adds a new entry to the front", async () => {
    const before = await getHistory();

    appendHistoryEntry({
      id: "h-test",
      eventoTipo: "Teste",
      regiao: "Teste",
      segurados: 1,
      canal: "SMS",
      status: "Simulada",
      horario: "agora",
    });

    const after = await getHistory();
    expect(after).toHaveLength(before.length + 1);
    expect(after[0].id).toBe("h-test");
  });
});
