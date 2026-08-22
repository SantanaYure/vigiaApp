import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title and description with a status role", () => {
    render(<EmptyState title="Nenhum evento encontrado" description="Ajuste os filtros." />);

    const region = screen.getByRole("status");
    expect(region).toHaveTextContent("Nenhum evento encontrado");
    expect(region).toHaveTextContent("Ajuste os filtros.");
  });
});
