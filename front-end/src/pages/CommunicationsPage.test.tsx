import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { CommunicationsPage } from "./CommunicationsPage";
import * as communicationsService from "../services/communicationsService";
import * as eventsService from "../services/eventsService";
import type { WeatherEvent } from "../types/event";
import type { CommunicationWithEvent } from "../types/communication";

function renderCommunicationsPage(initialPath = "/comunicacoes") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/comunicacoes" element={<CommunicationsPage />} />
        <Route path="/comunicacoes/:id" element={<CommunicationsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

const VENDAVAL: WeatherEvent = {
  id: "inmet-1",
  tipo: "Vendaval",
  severidade: "Alto",
  regiao: "CE · 1 município(s)",
  status: "Ativo",
  detectadoEm: "22/08 08:00",
  previsao: "Até 24/08 20:00",
  segurados: 0,
  regra: "Regra provisória para Vendaval.",
  tipoSeguro: "cobertura a definir",
  geocodesMunicipios: [],
};

const GRANIZO: WeatherEvent = {
  ...VENDAVAL,
  id: "inmet-2",
  tipo: "Granizo",
  regra: "Regra provisória para Granizo.",
};

const COMM_VENDAVAL: CommunicationWithEvent = {
  id: "c1",
  eventId: "inmet-1",
  canal: "SMS",
  status: "Aguardando revisão",
  segurados: 0,
  geradoEm: "08:30",
  eventoTipo: "Vendaval",
};

const COMM_GRANIZO: CommunicationWithEvent = {
  id: "c2",
  eventId: "inmet-2",
  canal: "E-mail",
  status: "Erro",
  segurados: 0,
  geradoEm: "09:00",
  eventoTipo: "Granizo",
};

function mockData(communications: CommunicationWithEvent[], events: WeatherEvent[]) {
  vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValue(communications);
  vi.spyOn(eventsService, "getAllEvents").mockResolvedValue(events);
}

describe("CommunicationsPage", () => {
  it("lists every communication and shows the detail panel for the id in the URL", async () => {
    mockData([COMM_VENDAVAL, COMM_GRANIZO], [VENDAVAL, GRANIZO]);
    renderCommunicationsPage("/comunicacoes/c1");

    expect(await screen.findByText("Contexto do risco")).toBeInTheDocument();
    expect(screen.getByText("Destinatários")).toBeInTheDocument();
    expect(screen.getByText("Vendaval · Alto · CE · 1 município(s) — ", { exact: false })).toBeInTheDocument();
  });

  it("filters the list by search text", async () => {
    mockData([COMM_VENDAVAL, COMM_GRANIZO], [VENDAVAL, GRANIZO]);
    const user = userEvent.setup();
    renderCommunicationsPage();

    await screen.findByText("Vendaval");
    await user.type(screen.getByLabelText("Buscar comunicações por evento ou canal"), "granizo");

    expect(screen.queryByText("Vendaval")).not.toBeInTheDocument();
    expect(screen.getByText("Granizo")).toBeInTheDocument();
  });

  it("filters the list by status", async () => {
    mockData([COMM_VENDAVAL, COMM_GRANIZO], [VENDAVAL, GRANIZO]);
    const user = userEvent.setup();
    renderCommunicationsPage();

    await screen.findByText("Vendaval");
    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "Erro");

    expect(screen.getByText("Granizo")).toBeInTheDocument();
    expect(screen.queryByText("Vendaval")).not.toBeInTheDocument();
  });

  it("shows an empty state when no communication matches the filters", async () => {
    mockData([COMM_VENDAVAL, COMM_GRANIZO], [VENDAVAL, GRANIZO]);
    const user = userEvent.setup();
    renderCommunicationsPage();

    await screen.findByText("Vendaval");
    await user.type(screen.getByLabelText("Buscar comunicações por evento ou canal"), "nada-existe");

    expect(await screen.findByText("Nenhuma comunicação encontrada")).toBeInTheDocument();
  });

  it("shows an empty state when there are no communications yet", async () => {
    mockData([], []);
    renderCommunicationsPage();

    expect(await screen.findByText("Nenhuma comunicação encontrada")).toBeInTheDocument();
  });

  it("shows an error banner with a working retry when loading fails", async () => {
    vi.spyOn(communicationsService, "getAllCommunications").mockRejectedValueOnce(new Error("network down"));
    vi.spyOn(eventsService, "getAllEvents").mockResolvedValueOnce([]);

    renderCommunicationsPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível carregar as comunicações");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
