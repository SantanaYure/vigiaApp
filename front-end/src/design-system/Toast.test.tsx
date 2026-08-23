import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders the message with the tone's inverted colors and no dot", () => {
    render(<Toast tone="success" message="Envio simulado com sucesso" />);

    const toast = screen.getByText("Envio simulado com sucesso");
    expect(toast.style.backgroundColor).toBe("rgb(30, 107, 30)");
    expect(toast.querySelector("span")).toBeNull();
  });
});
