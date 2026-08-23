import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useHistoryData } from "./useHistoryData";

describe("useHistoryData", () => {
  it("loads the history entries", async () => {
    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.length).toBeGreaterThanOrEqual(4);
  });
});
