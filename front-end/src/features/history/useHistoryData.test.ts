import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useHistoryData } from "./useHistoryData";
import * as historyService from "../../services/historyService";

describe("useHistoryData", () => {
  it("loads whatever getHistory returns", async () => {
    vi.spyOn(historyService, "getHistory").mockResolvedValueOnce([
      { id: "h1", eventoTipo: "Vendaval", regiao: "CE", segurados: 1, canal: "SMS", status: "Simulada", horario: "agora" },
    ]);

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toHaveLength(1);
  });

  it("returns an empty list when there is no history yet", async () => {
    vi.spyOn(historyService, "getHistory").mockResolvedValueOnce([]);

    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([]);
  });
});
