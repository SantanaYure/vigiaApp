import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAsyncData } from "./useAsyncData";

describe("useAsyncData", () => {
  it("starts loading, then resolves data and clears the error", async () => {
    const loader = vi.fn().mockResolvedValue("ok");
    const { result } = renderHook(() => useAsyncData(loader, []));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe("ok");
    expect(result.current.error).toBeNull();
  });

  it("keeps the previous data and sets an error when reload fails", async () => {
    const loader = vi.fn().mockResolvedValueOnce("first").mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useAsyncData(loader, []));

    await waitFor(() => expect(result.current.data).toBe("first"));

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.data).toBe("first");
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
