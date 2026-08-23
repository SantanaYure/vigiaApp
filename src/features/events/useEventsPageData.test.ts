import { describe, expect, it } from "vitest";
import { useEventsPageData } from "./useEventsPageData";
import { renderHook, waitFor } from "@testing-library/react";

describe("useEventsPageData", () => {
  it("loads every event and a lookup of each event's communication", async () => {
    const { result } = renderHook(() => useEventsPageData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.events).toHaveLength(4);
    expect(result.current.data?.communicationsByEventId.ev1).toMatchObject({ id: "c1", canal: "SMS" });
    expect(result.current.data?.communicationsByEventId.ev2).toMatchObject({ id: "c2", canal: "E-mail" });
  });
});
