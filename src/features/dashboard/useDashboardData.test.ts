import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDashboardData } from "./useDashboardData";
import * as eventsService from "../../services/eventsService";
import * as communicationsService from "../../services/communicationsService";

describe("useDashboardData", () => {
  it("computes KPIs matching the design's reference numbers", async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toMatchObject({
      kpiEventosAtivos: 3,
      kpiSegurados: 2100,
      kpiComunicacoes: 4,
      kpiSimuladas: 1,
    });
    expect(result.current.data?.attentionEvents.map((e) => e.id)).toEqual(["ev1", "ev2", "ev3"]);
    expect(result.current.data?.recentCommunications.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("surfaces a rejected fetch as an error", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockRejectedValueOnce(new Error("network down"));
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  });
});
