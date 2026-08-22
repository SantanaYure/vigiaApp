import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "./StatusPill";

describe("StatusPill", () => {
  it("renders the label with the tone's background color", () => {
    render(<StatusPill tone="danger" label="Crítico" />);

    const pill = screen.getByText("Crítico");
    expect(pill.style.backgroundColor).toBe("rgb(255, 240, 240)");
  });

  it("renders a spinning dot when spin is true", () => {
    render(<StatusPill tone="info" label="Atualizando" spin />);

    const dot = screen.getByText("Atualizando").querySelector("span");
    const className = dot?.className || "";
    expect(className).toMatch(/dotSpin/);
  });
});
