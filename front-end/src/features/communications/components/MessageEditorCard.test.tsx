import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MessageEditorCard } from "./MessageEditorCard";
import type { CommunicationWithEvent } from "../../../types/communication";

const communication: CommunicationWithEvent = {
  id: "c1",
  eventId: "ev1",
  canal: "SMS",
  status: "Simulada",
  segurados: 1248,
  geradoEm: "14:11",
  eventoTipo: "Chuva intensa",
};

describe("MessageEditorCard", () => {
  it("shows the channel, status and message text in read mode", () => {
    render(
      <MessageEditorCard
        communication={communication}
        text="Olá! Identificamos previsão de chuva intensa..."
        isEditing={false}
        onToggleEdit={vi.fn()}
        onTextChange={vi.fn()}
        onRegenerate={vi.fn()}
        onRequestSimulate={vi.fn()}
      />,
    );

    expect(screen.getByText("SMS")).toBeInTheDocument();
    expect(screen.getByText("Simulada")).toBeInTheDocument();
    expect(screen.getByText("Olá! Identificamos previsão de chuva intensa...")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows a textarea with the current text in edit mode, and reports changes", async () => {
    const user = userEvent.setup();
    const onTextChange = vi.fn();
    render(
      <MessageEditorCard
        communication={communication}
        text="Texto atual"
        isEditing
        onToggleEdit={vi.fn()}
        onTextChange={onTextChange}
        onRegenerate={vi.fn()}
        onRequestSimulate={vi.fn()}
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("Texto atual");

    await user.type(textarea, "!");
    expect(onTextChange).toHaveBeenCalled();
  });

  it("toggles the edit button label between Editar and Concluir edição", () => {
    const { rerender } = render(
      <MessageEditorCard
        communication={communication}
        text="t"
        isEditing={false}
        onToggleEdit={vi.fn()}
        onTextChange={vi.fn()}
        onRegenerate={vi.fn()}
        onRequestSimulate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();

    rerender(
      <MessageEditorCard
        communication={communication}
        text="t"
        isEditing
        onToggleEdit={vi.fn()}
        onTextChange={vi.fn()}
        onRegenerate={vi.fn()}
        onRequestSimulate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Concluir edição" })).toBeInTheDocument();
  });

  it("calls onRegenerate and onRequestSimulate when their buttons are clicked", async () => {
    const user = userEvent.setup();
    const onRegenerate = vi.fn();
    const onRequestSimulate = vi.fn();
    render(
      <MessageEditorCard
        communication={communication}
        text="t"
        isEditing={false}
        onToggleEdit={vi.fn()}
        onTextChange={vi.fn()}
        onRegenerate={onRegenerate}
        onRequestSimulate={onRequestSimulate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Regenerar" }));
    expect(onRegenerate).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Simular envio" }));
    expect(onRequestSimulate).toHaveBeenCalledOnce();
  });
});
