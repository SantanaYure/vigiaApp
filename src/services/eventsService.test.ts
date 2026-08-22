import { describe, expect, it } from "vitest";
import { getActiveEvents, getAllEvents, getEventById } from "./eventsService";

describe("eventsService", () => {
  it("returns only events that are not Encerrado, in mock order", async () => {
    const events = await getActiveEvents();

    expect(events.map((event) => event.id)).toEqual(["ev1", "ev2", "ev3"]);
    expect(events.every((event) => event.status !== "Encerrado")).toBe(true);
  });

  it("getEventById returns the matching event", async () => {
    const event = await getEventById("ev2");
    expect(event).toMatchObject({ id: "ev2", tipo: "Granizo" });
  });

  it("getEventById returns null for an unknown id", async () => {
    const event = await getEventById("does-not-exist");
    expect(event).toBeNull();
  });

  it("getAllEvents returns every event, including Encerrado ones", async () => {
    const events = await getAllEvents();
    expect(events).toHaveLength(4);
    expect(events.map((e) => e.status)).toContain("Encerrado");
  });
});
