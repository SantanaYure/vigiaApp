import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders the title, body and both actions, and focuses cancel on mount", () => {
    render(
      <Modal
        title="Confirmar simulação de envio"
        cancelLabel="Cancelar"
        onCancel={vi.fn()}
        confirmLabel="Confirmar simulação"
        onConfirm={vi.fn()}
      >
        <p>1.248 segurados · Chuva intensa · RS · Porto Alegre · SMS</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Confirmar simulação de envio" })).toBeInTheDocument();
    expect(screen.getByText(/1\.248 segurados/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <Modal title="t" cancelLabel="Cancelar" onCancel={vi.fn()} confirmLabel="Confirmar" onConfirm={onConfirm}>
        body
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <Modal title="t" cancelLabel="Cancelar" onCancel={onCancel} confirmLabel="Confirmar" onConfirm={vi.fn()}>
        body
      </Modal>,
    );

    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
