import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HistoryPage } from "./HistoryPage";
import * as historyService from "../services/historyService";

describe("HistoryPage", () => {
  it("renders every history entry as a table row", async () => {
    render(<HistoryPage />);

    expect(await screen.findByText("Granizo")).toBeInTheDocument();
    expect(screen.getByText("Ventos fortes")).toBeInTheDocument();
    expect(screen.getAllByText("Chuva intensa")).toHaveLength(2);
  });

  it("filters by status", async () => {
    const user = userEvent.setup();
    render(<HistoryPage />);

    await screen.findByText("Ventos fortes");
    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "Erro");

    expect(screen.queryByText("Ventos fortes")).not.toBeInTheDocument();
    expect(screen.getAllByText("Chuva intensa")).toHaveLength(1);
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
