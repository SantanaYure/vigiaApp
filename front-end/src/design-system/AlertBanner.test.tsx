import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlertBanner } from "./AlertBanner";

describe("AlertBanner", () => {
  it("renders as an alert with title, description and an optional action", () => {
    const onRetry = vi.fn();
    render(
      <AlertBanner
        title="Falha ao atualizar dados climáticos"
        description="Tente novamente em alguns instantes."
        action={
          <button type="button" onClick={onRetry}>
            Tentar novamente
          </button>
        }
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Falha ao atualizar dados climáticos");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
