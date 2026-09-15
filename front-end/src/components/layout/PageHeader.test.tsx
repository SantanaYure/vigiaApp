import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
vi.mock("../../services/monitoringService", () => ({
  getMonitoringStatus: vi.fn().mockResolvedValue({state:"ativo",label:"Monitoramento ativo",lastUpdateLabel:"Última atualização há 2 min"}),
}));
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title, subtitle and a monitoring status pill", async () => {
    render(<PageHeader title="Dashboard" subtitle="O que está acontecendo agora" />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("O que está acontecendo agora")).toBeInTheDocument();
    expect(await screen.findByText("Monitoramento ativo")).toBeInTheDocument();
  });
});
