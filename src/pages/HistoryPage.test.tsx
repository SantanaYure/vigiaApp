import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HistoryPage } from "./HistoryPage";
import * as historyService from "../services/historyService";
import type { HistoryEntry } from "../types/history";

const GRANIZO: HistoryEntry = {
  id: "h1",
  eventoTipo: "Granizo",
  regiao: "SC · Chapecó",
  segurados: 642,
  canal: "E-mail",
  status: "Aguardando revisão",
  horario: "22/08 · 13:55",
};

const VENTOS: HistoryEntry = {
  id: "h2",
  eventoTipo: "Ventos fortes",
  regiao: "PR · Curitiba",
  segurados: 210,
  canal: "SMS",
  status: "Erro",
  horario: "22/08 · 12:40",
};

describe("HistoryPage", () => {
  it("renders every history entry as a table row", async () => {
    vi.spyOn(historyService, "getHistory").mockResolvedValueOnce([GRANIZO, VENTOS]);

    render(<HistoryPage />);

    expect(await screen.findByText("Granizo")).toBeInTheDocument();
    expect(screen.getByText("Ventos fortes")).toBeInTheDocument();
  });

  it("filters by status", async () => {
    vi.spyOn(historyService, "getHistory").mockResolvedValueOnce([GRANIZO, VENTOS]);
    const user = userEvent.setup();
    render(<HistoryPage />);

    await screen.findByText("Ventos fortes");
    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "Erro");

    expect(screen.queryByText("Granizo")).not.toBeInTheDocument();
    expect(screen.getByText("Ventos fortes")).toBeInTheDocument();
  });

  it("shows an empty state when there is nothing to display", async () => {
    vi.spyOn(historyService, "getHistory").mockResolvedValueOnce([]);

    render(<HistoryPage />);

    expect(await screen.findByText("Nenhum registro encontrado")).toBeInTheDocument();
  });

  it("shows an error banner with a working retry when loading fails", async () => {
    vi.spyOn(historyService, "getHistory").mockRejectedValueOnce(new Error("network down"));

    render(<HistoryPage />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível carregar o histórico");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
