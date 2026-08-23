import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { EventsPage } from "./EventsPage";
import * as eventsService from "../services/eventsService";

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
  it("lists every event and shows the detail panel for the id in the URL", async () => {
    renderEventsPage("/eventos/ev1");

    expect(await screen.findByText("Regra aplicada")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Clientes com seguro residencial em endereços na área de alagamento devem receber comunicação preventiva.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Granizo")).toBeInTheDocument();
  });

  it("filters the list by search text", async () => {
    const user = userEvent.setup();
    renderEventsPage();

    await screen.findByText("Ventos fortes");
    await user.type(screen.getByLabelText("Buscar eventos por tipo ou região"), "granizo");

    expect(screen.queryByText("Ventos fortes")).not.toBeInTheDocument();
    expect(screen.getByText("Granizo")).toBeInTheDocument();
  });

  it("filters the list by severity", async () => {
    const user = userEvent.setup();
    renderEventsPage();

    await screen.findByText("Ventos fortes");
    await user.selectOptions(screen.getByLabelText("Filtrar por severidade"), "Crítico");

    expect(screen.getByText("Chuva intensa")).toBeInTheDocument();
    expect(screen.queryByText("Granizo")).not.toBeInTheDocument();
  });

  it("shows an empty state when no event matches the filters", async () => {
    const user = userEvent.setup();
    renderEventsPage();

    await screen.findByText("Ventos fortes");
    await user.type(screen.getByLabelText("Buscar eventos por tipo ou região"), "nada-existe");

    expect(await screen.findByText("Nenhum evento encontrado")).toBeInTheDocument();
  });

  it("shows an error banner with a working retry when loading fails", async () => {
    vi.spyOn(eventsService, "getAllEvents").mockRejectedValueOnce(new Error("network down"));

    renderEventsPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível carregar os eventos");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
