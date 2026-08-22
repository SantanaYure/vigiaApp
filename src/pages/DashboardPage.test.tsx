import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";
import * as eventsService from "../services/eventsService";
import * as communicationsService from "../services/communicationsService";

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  it("shows the loading skeleton before data resolves", () => {
    renderDashboard();

    expect(screen.queryByText("Eventos ativos")).not.toBeInTheDocument();
  });

  it("shows KPI values and both lists once data resolves", async () => {
    renderDashboard();

    const kpiLabel = await screen.findByText("Eventos ativos");
    expect(kpiLabel.nextSibling).toHaveTextContent("3");

    // Scoped to the attention list: with this mock data each communication's eventoTipo
    // (c1->ev1, c2->ev2, c3->ev3) duplicates the attention event's tipo text, so an
    // unscoped getByText would match twice (once per list) and throw.
    const attentionSection = screen.getByText("Eventos que exigem atenção").closest("section");
    expect(attentionSection).not.toBeNull();
    const withinAttention = within(attentionSection as HTMLElement);
    expect(withinAttention.getByText("Chuva intensa")).toBeInTheDocument();
    expect(withinAttention.getByText("Granizo")).toBeInTheDocument();
    expect(withinAttention.getByText("Ventos fortes")).toBeInTheDocument();
  });

  it("shows an error banner with a working retry when the fetch fails", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockRejectedValueOnce(new Error("network down"));

    renderDashboard();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Falha ao atualizar dados climáticos");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("shows recent communications content distinct from the attention list", async () => {
    renderDashboard();

    await screen.findByText("Eventos ativos");

    const commSection = screen.getByText("Comunicações recentes").closest("section");
    expect(commSection).not.toBeNull();
    const withinComm = within(commSection as HTMLElement);
    expect(withinComm.getAllByText(/SMS|E-mail/).length).toBeGreaterThan(0);
    expect(withinComm.getByText("Simulada")).toBeInTheDocument();
  });

  it("shows both empty states when there are no events and no communications", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockResolvedValueOnce([]);
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([]);

    renderDashboard();

    expect(await screen.findByText("Nenhum evento em aberto")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma comunicação gerada")).toBeInTheDocument();
  });
});
