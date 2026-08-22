import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App shell navigation", () => {
  it("renders all nav links and the Dashboard by default", async () => {
    render(<App />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Eventos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comunicações" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Histórico" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("navigates to the Eventos placeholder and shows the monitoring status pill", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "Eventos" }));

    expect(await screen.findByRole("heading", { name: "Eventos climáticos" })).toBeInTheDocument();
    expect(await screen.findByText("Monitoramento ativo")).toBeInTheDocument();
  });
});
