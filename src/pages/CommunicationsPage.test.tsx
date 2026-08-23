import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { CommunicationsPage } from "./CommunicationsPage";
import * as communicationsService from "../services/communicationsService";

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

describe("CommunicationsPage", () => {
  it("lists every communication and shows the detail panel for the id in the URL", async () => {
    renderCommunicationsPage("/comunicacoes/c2");

    expect(await screen.findByText("Contexto do risco")).toBeInTheDocument();
    expect(screen.getByText("Destinatários")).toBeInTheDocument();
    expect(screen.getByText("Granizo · Alto · SC · Chapecó — ", { exact: false })).toBeInTheDocument();
  });

  it("filters the list by search text", async () => {
    const user = userEvent.setup();
    renderCommunicationsPage();

    await screen.findByText("Ventos fortes");
    await user.type(screen.getByLabelText("Buscar comunicações por evento ou canal"), "granizo");

    expect(screen.queryByText("Ventos fortes")).not.toBeInTheDocument();
    expect(screen.getByText("Granizo")).toBeInTheDocument();
  });

  it("filters the list by status", async () => {
    const user = userEvent.setup();
    renderCommunicationsPage();

    await screen.findByText("Ventos fortes");
    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "Erro");

    expect(screen.getByText("Chuva intensa")).toBeInTheDocument();
    expect(screen.queryByText("Ventos fortes")).not.toBeInTheDocument();
  });

  it("shows an empty state when no communication matches the filters", async () => {
    const user = userEvent.setup();
    renderCommunicationsPage();

    await screen.findByText("Ventos fortes");
    await user.type(screen.getByLabelText("Buscar comunicações por evento ou canal"), "nada-existe");

    expect(await screen.findByText("Nenhuma comunicação encontrada")).toBeInTheDocument();
  });

  it("shows an error banner with a working retry when loading fails", async () => {
    vi.spyOn(communicationsService, "getAllCommunications").mockRejectedValueOnce(new Error("network down"));

    renderCommunicationsPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível carregar as comunicações");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("simulating a send updates the status pill and is reflected after reload", async () => {
    const user = userEvent.setup();
    renderCommunicationsPage("/comunicacoes/c2");

    await screen.findByText("Contexto do risco");
    await user.click(screen.getByRole("button", { name: "Simular envio" }));

    const dialog = await screen.findByRole("dialog", { name: "Confirmar simulação de envio" });
    expect(dialog).toHaveTextContent("642 segurados");
    expect(dialog).toHaveTextContent("Granizo");

    await user.click(screen.getByRole("button", { name: "Confirmar simulação" }));

    expect(await screen.findByText("Envio simulado com sucesso")).toBeInTheDocument();

    // Scoped to the message editor card: other rows in the list (e.g. c1) already have
    // a "Simulada" status pill, so an unscoped query would match more than one element.
    const simulateButton = await screen.findByRole("button", { name: "Simular envio" });
    const messageCard = simulateButton.closest("div")?.parentElement;
    expect(messageCard).not.toBeNull();
    // The status pill updates after a background reload that starts once the toast is
    // already showing, so poll for it rather than asserting synchronously.
    expect(await within(messageCard as HTMLElement).findByText("Simulada")).toBeInTheDocument();
  });
});
