import { describe, expect, it } from "vitest";
import {
  getAllCommunications,
  getCommunicationById,
  getCommunicationText,
  regenerateCommunicationText,
  simulateCommunicationSend,
  updateCommunicationText,
} from "./communicationsService";
import { getHistory } from "./historyService";

describe("communicationsService", () => {
  it("returns every communication enriched with its event's tipo", async () => {
    const communications = await getAllCommunications();

    expect(communications).toHaveLength(4);
    expect(communications[0]).toMatchObject({ id: "c1", eventoTipo: "Chuva intensa" });
    expect(communications[1]).toMatchObject({ id: "c2", eventoTipo: "Granizo" });
  });

  it("getCommunicationById returns null for an unknown id", async () => {
    const result = await getCommunicationById("does-not-exist");
    expect(result).toBeNull();
  });

  it("getCommunicationText returns the original message before any edit", async () => {
    const text = await getCommunicationText("c3");
    expect(text).toBe(
      "Olá! Identificamos ventos fortes em sua região. Recomendamos verificar itens soltos em áreas externas, como móveis e objetos de jardim.",
    );
  });

  it("updateCommunicationText persists an edit that getCommunicationText then returns", async () => {
    await updateCommunicationText("c3", "Texto editado manualmente.");
    const text = await getCommunicationText("c3");
    expect(text).toBe("Texto editado manualmente.");
  });

  it("regenerateCommunicationText replaces the current text with the alternative", async () => {
    await regenerateCommunicationText("c4");
    const text = await getCommunicationText("c4");
    expect(text).toBe(
      "Registramos chuva intensa em sua região. Caso identifique qualquer dano na sua residência, acesse o app para abrir um sinistro.",
    );
  });

  it("simulateCommunicationSend marks the communication Simulada, is visible from every read path, and appends a history entry", async () => {
    const before = await getHistory();

    await simulateCommunicationSend("c2");

    const byId = await getCommunicationById("c2");
    expect(byId?.status).toBe("Simulada");

    const all = await getAllCommunications();
    expect(all.find((c) => c.id === "c2")?.status).toBe("Simulada");

    const after = await getHistory();
    expect(after).toHaveLength(before.length + 1);
    expect(after[0]).toMatchObject({
      eventoTipo: "Granizo",
      regiao: "SC · Chapecó",
      canal: "E-mail",
      status: "Simulada",
      horario: "agora",
    });
  });
});
