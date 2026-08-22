import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title, subtitle and a monitoring status pill", async () => {
    render(<PageHeader title="Dashboard" subtitle="O que está acontecendo agora" />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("O que está acontecendo agora")).toBeInTheDocument();
    expect(await screen.findByText("Monitoramento ativo")).toBeInTheDocument();
  });
});
