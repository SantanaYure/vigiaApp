import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";
import * as eventsService from "../services/eventsService";
import * as communicationsService from "../services/communicationsService";
import type { WeatherEvent } from "../types/event";
import type { CommunicationWithEvent } from "../types/communication";

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

const EVENT: WeatherEvent = {
  id: "inmet-1",
  tipo: "Vendaval",
  severidade: "Alto",
  regiao: "CE · 1 município(s)",
  status: "Ativo",
  detectadoEm: "22/08 08:00",
  previsao: "Até 24/08 20:00",
  segurados: 5,
  regra: "Regra provisória",
  tipoSeguro: "cobertura a definir",
  geocodesMunicipios: ["2300150"],
};

const COMMUNICATION: CommunicationWithEvent = {
  id: "c1",
  eventId: "inmet-1",
  canal: "SMS",
  status: "Simulada",
  segurados: 5,
  geradoEm: "08:30",
  eventoTipo: "Vendaval",
};

describe("DashboardPage", () => {
  it("shows the loading skeleton before data resolves", () => {
    renderDashboard();

    expect(screen.queryByText("Eventos ativos")).not.toBeInTheDocument();
  });

  it("shows KPI values and both lists once data resolves", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockResolvedValueOnce([EVENT]);
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([COMMUNICATION]);

    renderDashboard();

    const kpiLabel = await screen.findByText("Eventos ativos");
    expect(kpiLabel.nextSibling).toHaveTextContent("1");

    const attentionSection = screen.getByText("Eventos que exigem atenção").closest("section");
    expect(attentionSection).not.toBeNull();
    expect(within(attentionSection as HTMLElement).getByText("Vendaval")).toBeInTheDocument();
  });

  it("shows an error banner with a working retry when the fetch fails", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockRejectedValueOnce(new Error("network down"));
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([]);

    renderDashboard();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Falha ao atualizar dados climáticos");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("shows recent communications content distinct from the attention list", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockResolvedValueOnce([EVENT]);
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([COMMUNICATION]);

    renderDashboard();

    await screen.findByText("Eventos ativos");

    const commSection = screen.getByText("Comunicações recentes").closest("section");
    expect(commSection).not.toBeNull();
    const withinComm = within(commSection as HTMLElement);
    expect(withinComm.getAllByText(/SMS|E-mail/).length).toBeGreaterThan(0);
    expect(withinComm.getByText("Simulada")).toBeInTheDocument();
  });

  it("shows both empty states when there is no real data yet", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockResolvedValueOnce([]);
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([]);

    renderDashboard();

    expect(await screen.findByText("Nenhum evento em aberto")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma comunicação gerada")).toBeInTheDocument();
  });
});
