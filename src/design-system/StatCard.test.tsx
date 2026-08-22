import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Eventos ativos" value={3} />);

    expect(screen.getByText("Eventos ativos")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
