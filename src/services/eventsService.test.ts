import { describe, expect, it } from "vitest";
import { getActiveEvents } from "./eventsService";

describe("eventsService", () => {
  it("returns only events that are not Encerrado, in mock order", async () => {
    const events = await getActiveEvents();

    expect(events.map((event) => event.id)).toEqual(["ev1", "ev2", "ev3"]);
    expect(events.every((event) => event.status !== "Encerrado")).toBe(true);
  });
});
