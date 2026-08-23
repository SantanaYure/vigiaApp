import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { EventsPage } from "./EventsPage";
import * as communicationsService from "../services/communicationsService";
import { getRealEvents } from "../services/realEventsSource";
import type { WeatherEvent } from "../types/event";

vi.mock("../services/realEventsSource", () => ({
  getRealEvents: vi.fn(),
}));

const VENDAVAL: WeatherEvent = {
  id: "inmet-1",
  tipo: "Vendaval",
  severidade: "Crítico",
  regiao: "RS · 1 município(s)",
  status: "Ativo",
  detectadoEm: "22/08 08:00",
  previsao: "Até 24/08 20:00",
  segurados: 1,
  regra: "Segurados nos municípios afetados pelo aviso de Vendaval (fonte: INMET).",
  tipoSeguro: "cobertura a definir",
  geocodesMunicipios: ["4304606"], // Fernanda Lima
};

const GRANIZO: WeatherEvent = {
  id: "inmet-2",
  tipo: "Granizo",
  severidade: "Alto",
  regiao: "SC · 2 município(s)",
  status: "Monitorando",
  detectadoEm: "23/08 09:00",
  previsao: "Até 25/08 10:00",
  segurados: 0,
  regra: "Segurados nos municípios afetados pelo aviso de Granizo (fonte: INMET).",
  tipoSeguro: "cobertura a definir",
  geocodesMunicipios: ["4205407"],
};

function renderEventsPage(initialPath = "/eventos") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/eventos/:id" element={<EventsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EventsPage", () => {
  it("lists every real event and shows the detail panel for the id in the URL", async () => {
    vi.mocked(getRealEvents).mockResolvedValue([VENDAVAL, GRANIZO]);
    renderEventsPage("/eventos/inmet-1");

    expect(await screen.findByText("Regra aplicada")).toBeInTheDocument();
    expect(
      screen.getByText("Segurados nos municípios afetados pelo aviso de Vendaval (fonte: INMET)."),
    ).toBeInTheDocument();
    expect(screen.getByText("Granizo")).toBeInTheDocument();
  });

  it("shows no matched customers (no real segurados source yet) and no communication card", async () => {
    vi.mocked(getRealEvents).mockResolvedValue([{ ...VENDAVAL, segurados: 0 }, GRANIZO]);
    renderEventsPage("/eventos/inmet-1");

    expect(await screen.findByText("Segurados impactados")).toBeInTheDocument();
    expect(screen.getByText("0 segurados elegíveis para comunicação", { exact: false })).toBeInTheDocument();
    expect(screen.queryByText("Comunicação preventiva")).not.toBeInTheDocument();
  });

  it("filters the list by search text", async () => {
    vi.mocked(getRealEvents).mockResolvedValue([VENDAVAL, GRANIZO]);
    const user = userEvent.setup();
    renderEventsPage();

    await screen.findByText("Vendaval");
    await user.type(screen.getByLabelText("Buscar eventos por tipo ou região"), "granizo");

    expect(screen.queryByText("Vendaval")).not.toBeInTheDocument();
    expect(screen.getByText("Granizo")).toBeInTheDocument();
  });

  it("filters the list by severity", async () => {
    vi.mocked(getRealEvents).mockResolvedValue([VENDAVAL, GRANIZO]);
    const user = userEvent.setup();
    renderEventsPage();

    await screen.findByText("Vendaval");
    await user.selectOptions(screen.getByLabelText("Filtrar por severidade"), "Crítico");

    expect(screen.getByText("Vendaval")).toBeInTheDocument();
    expect(screen.queryByText("Granizo")).not.toBeInTheDocument();
  });

  it("shows an empty state when no event matches the filters", async () => {
    vi.mocked(getRealEvents).mockResolvedValue([VENDAVAL, GRANIZO]);
    const user = userEvent.setup();
    renderEventsPage();

    await screen.findByText("Vendaval");
    await user.type(screen.getByLabelText("Buscar eventos por tipo ou região"), "nada-existe");

    expect(await screen.findByText("Nenhum evento encontrado")).toBeInTheDocument();
  });

  it("shows a dedicated empty state when there are no alerts at all", async () => {
    vi.mocked(getRealEvents).mockResolvedValue([]);
    renderEventsPage();

    expect(await screen.findByText("Sem alertas de risco no momento")).toBeInTheDocument();
  });

  it("shows an error banner with a working retry when loading fails", async () => {
    vi.mocked(getRealEvents).mockResolvedValue([]);
    vi.spyOn(communicationsService, "getAllCommunications").mockRejectedValueOnce(new Error("network down"));

    renderEventsPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível carregar os eventos");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
