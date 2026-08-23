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

  it("regenerateCommunicationText is a no-op — no real generation exists yet", async () => {
    await updateCommunicationText("c-regen", "Texto original.");
    await regenerateCommunicationText("c-regen");

    expect(await getCommunicationText("c-regen")).toBe("Texto original.");
  });

  it("simulateCommunicationSend on an unknown id does nothing and appends no history", async () => {
    const before = await getHistory();

    await simulateCommunicationSend("does-not-exist");

    expect(await getHistory()).toEqual(before);
  });
});
