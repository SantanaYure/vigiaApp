import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "./StatusPill";

describe("StatusPill", () => {
  it("renders the label with the tone's background color", () => {
    render(<StatusPill tone="danger" label="Crítico" />);

    const pill = screen.getByText("Crítico");
    expect(pill.style.backgroundColor).toBe("rgb(255, 240, 240)");
  });

  it("renders as a flat pill with no decorative dot", () => {
    render(<StatusPill tone="success" label="Simulada" variant="pill" />);

    const pill = screen.getByText("Simulada");
    expect(pill.querySelector("span")).toBeNull();
  });
});
