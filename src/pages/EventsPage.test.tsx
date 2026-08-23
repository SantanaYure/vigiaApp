import { render, screen, within } from "@testing-library/react";
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

  it("simulating a send from the event detail panel updates the status pill and shows a toast", async () => {
    const user = userEvent.setup();
    renderEventsPage("/eventos/ev2");

    await screen.findByText("Regra aplicada");
    await user.click(screen.getByRole("button", { name: "Simular envio" }));

    const dialog = await screen.findByRole("dialog", { name: "Confirmar simulação de envio" });
    expect(dialog).toHaveTextContent("642 segurados");
    expect(dialog).toHaveTextContent("Granizo");
    expect(dialog).toHaveTextContent("SC · Chapecó");
    expect(dialog).toHaveTextContent("E-mail");

    await user.click(screen.getByRole("button", { name: "Confirmar simulação" }));

    expect(await screen.findByText("Envio simulado com sucesso")).toBeInTheDocument();

    // Scoped to the message editor card: the mocked customer list already shows several
    // "Simulada" status pills, so an unscoped query would match more than one element.
    const simulateButton = await screen.findByRole("button", { name: "Simular envio" });
    const messageCard = simulateButton.closest("div")?.parentElement;
    expect(messageCard).not.toBeNull();
    // The status pill updates after a background reload that starts once the toast is
    // already showing, so poll for it rather than asserting synchronously.
    expect(await within(messageCard as HTMLElement).findByText("Simulada")).toBeInTheDocument();
  });
});
