import { describe, expect, it, vi } from "vitest";
import {
  getAllCommunications,
  getCommunicationById,
  getCommunicationText,
  regenerateCommunicationText,
  simulateCommunicationSend,
  updateCommunicationText,
} from "./communicationsService";
import { getHistory } from "./historyService";
import * as eventsService from "./eventsService";
import { regenerarMensagem } from "./messageBackend";

vi.mock("./messageBackend", () => ({
  regenerarMensagem: vi.fn().mockResolvedValue(null),
}));

vi.spyOn(eventsService, "getAllEvents").mockResolvedValue([]);

describe("communicationsService", () => {
  it("getAllCommunications starts empty — no real communication source exists yet", async () => {
    expect(await getAllCommunications()).toEqual([]);
  });

  it("getCommunicationById returns null for an unknown id", async () => {
    const result = await getCommunicationById("does-not-exist");
    expect(result).toBeNull();
  });

  it("getCommunicationText returns an empty string before any edit", async () => {
    expect(await getCommunicationText("c-any")).toBe("");
  });

  it("updateCommunicationText persists an edit that getCommunicationText then returns", async () => {
    await updateCommunicationText("c-any", "Texto editado manualmente.");
    expect(await getCommunicationText("c-any")).toBe("Texto editado manualmente.");
  });

  it("regenerateCommunicationText asks the backend, and keeps the text unchanged when it's unreachable", async () => {
    await updateCommunicationText("c-regen", "Texto original.");

    await regenerateCommunicationText("c-regen");

    expect(regenerarMensagem).toHaveBeenCalledOnce();
    expect(await getCommunicationText("c-regen")).toBe("Texto original.");
  });

  it("regenerateCommunicationText applies the text the backend returns", async () => {
    vi.mocked(regenerarMensagem).mockResolvedValueOnce("Texto vindo do backend.");
    await updateCommunicationText("c-regen-2", "Texto original.");

    await regenerateCommunicationText("c-regen-2");

    expect(await getCommunicationText("c-regen-2")).toBe("Texto vindo do backend.");
  });

  it("simulateCommunicationSend on an unknown id does nothing and appends no history", async () => {
    const before = await getHistory();

    await simulateCommunicationSend("does-not-exist");

    expect(await getHistory()).toEqual(before);
  });
});
