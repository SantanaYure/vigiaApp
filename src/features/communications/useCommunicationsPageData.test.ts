import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCommunicationsPageData } from "./useCommunicationsPageData";

describe("useCommunicationsPageData", () => {
  it("loads every communication and a lookup of every event by id", async () => {
    const { result } = renderHook(() => useCommunicationsPageData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.communications).toHaveLength(4);
    expect(result.current.data?.eventsById.ev1).toMatchObject({ tipo: "Chuva intensa" });
  });
});
