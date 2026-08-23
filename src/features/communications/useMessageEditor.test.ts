import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMessageEditor } from "./useMessageEditor";
import * as communicationsService from "../../services/communicationsService";

describe("useMessageEditor", () => {
  it("loads the current text for the given communication id", async () => {
    const { result } = renderHook(() => useMessageEditor("c3", vi.fn()));

    await waitFor(() =>
      expect(result.current.text).toBe(
        "Olá! Identificamos ventos fortes em sua região. Recomendamos verificar itens soltos em áreas externas, como móveis e objetos de jardim.",
      ),
    );
  });

  it("onTextChange updates local text immediately and persists it via the service", async () => {
    const { result } = renderHook(() => useMessageEditor("c3", vi.fn()));
    await waitFor(() => expect(result.current.text).not.toBe(""));

    act(() => {
      result.current.onTextChange("Novo texto");
    });

    expect(result.current.text).toBe("Novo texto");
    await waitFor(async () => expect(await communicationsService.getCommunicationText("c3")).toBe("Novo texto"));
  });

  it("onRegenerate replaces the text with the service's regenerated alternative", async () => {
    const { result } = renderHook(() => useMessageEditor("c4", vi.fn()));
    await waitFor(() => expect(result.current.text).not.toBe(""));

    await act(async () => {
      await result.current.onRegenerate();
    });

    expect(result.current.text).toBe(
      "Registramos chuva intensa em sua região. Caso identifique qualquer dano na sua residência, acesse o app para abrir um sinistro.",
    );
  });

  it("onRequestSimulate opens the confirm state, onCancelSimulate closes it without calling the service", async () => {
    const simulateSpy = vi.spyOn(communicationsService, "simulateCommunicationSend");
    const { result } = renderHook(() => useMessageEditor("c1", vi.fn()));

    act(() => {
      result.current.onRequestSimulate();
    });
    expect(result.current.isConfirmOpen).toBe(true);

    act(() => {
      result.current.onCancelSimulate();
    });
    expect(result.current.isConfirmOpen).toBe(false);
    expect(simulateSpy).not.toHaveBeenCalled();
  });

  it("onConfirmSimulate calls the service, closes the confirm state, shows a toast, and calls onSimulated", async () => {
    const onSimulated = vi.fn();
    const { result } = renderHook(() => useMessageEditor("c1", onSimulated));

    act(() => {
      result.current.onRequestSimulate();
    });

    await act(async () => {
      await result.current.onConfirmSimulate();
    });

    expect(result.current.isConfirmOpen).toBe(false);
    expect(result.current.toastMessage).toBe("Envio simulado com sucesso");
    expect(onSimulated).toHaveBeenCalledOnce();
  });

  it("resets isEditing and isConfirmOpen when the communication id changes", async () => {
    const { result, rerender } = renderHook(({ id }) => useMessageEditor(id, vi.fn()), {
      initialProps: { id: "c1" as string | null },
    });

    act(() => {
      result.current.onToggleEdit();
      result.current.onRequestSimulate();
    });
    expect(result.current.isEditing).toBe(true);
    expect(result.current.isConfirmOpen).toBe(true);

    rerender({ id: "c2" });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.isConfirmOpen).toBe(false);
  });

  it("clears text immediately when switching from one communication to another, before the new text loads", async () => {
    const { result, rerender } = renderHook(({ id }) => useMessageEditor(id, vi.fn()), {
      initialProps: { id: "c1" as string | null },
    });
    await waitFor(() => expect(result.current.text).not.toBe(""));

    rerender({ id: "c2" });

    expect(result.current.text).toBe("");
  });

  it("discards a regenerate result if the selected communication changes before it resolves", async () => {
    vi.useFakeTimers();
    try {
      const { result, rerender } = renderHook(({ id }) => useMessageEditor(id, vi.fn()), {
        initialProps: { id: "c1" as string | null },
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });
      expect(result.current.text).not.toBe("");

      act(() => {
        result.current.onRegenerate();
      });

      // Switch selection before onRegenerate's own service calls (each ~350ms) resolve.
      rerender({ id: "c2" });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(350);
      });
      const c2Text = result.current.text;
      expect(c2Text).not.toBe("");

      // Let onRegenerate's remaining in-flight calls for c1 finish.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });

      expect(result.current.text).toBe(c2Text);
    } finally {
      vi.useRealTimers();
    }
  });
});
