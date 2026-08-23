import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommunicationDetailPanel } from "./CommunicationDetailPanel";
import type { CommunicationWithEvent } from "../../../types/communication";
import type { WeatherEvent } from "../../../types/event";

const communication: CommunicationWithEvent = {
  id: "c1",
  eventId: "ev1",
  canal: "SMS",
  status: "Simulada",
  segurados: 1248,
  geradoEm: "14:11",
  eventoTipo: "Chuva intensa",
};

const event: WeatherEvent = {
  id: "ev1",
  tipo: "Chuva intensa",
  severidade: "Crítico",
  regiao: "RS · Porto Alegre",
  status: "Ativo",
  detectadoEm: "14:02",
  previsao: "6 a 12 horas",
  segurados: 1248,
  regra: "Clientes com seguro residencial em endereços na área de alagamento devem receber comunicação preventiva.",
  tipoSeguro: "seguro residencial",
};

const messageEditor = {
  text: "Texto atual",
  isEditing: false,
  isConfirmOpen: false,
  toastMessage: null,
  onToggleEdit: vi.fn(),
  onTextChange: vi.fn(),
  onRegenerate: vi.fn(),
  onRequestSimulate: vi.fn(),
  onCancelSimulate: vi.fn(),
  onConfirmSimulate: vi.fn(),
};

describe("CommunicationDetailPanel", () => {
  it("renders the context sentence built from the event, recipients count, and the message editor", () => {
    render(<CommunicationDetailPanel communication={communication} event={event} messageEditor={messageEditor} />);

    expect(
      screen.getByText(
        "Chuva intensa · Crítico · RS · Porto Alegre — Clientes com seguro residencial em endereços na área de alagamento devem receber comunicação preventiva.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("1.248 segurados")).toBeInTheDocument();
    expect(screen.getByText("Texto atual")).toBeInTheDocument();
  });

  it("falls back to the communication's eventoTipo for context when the event isn't loaded yet", () => {
    render(<CommunicationDetailPanel communication={communication} event={null} messageEditor={messageEditor} />);

    // Scoped to the "Contexto do risco" section: the header title and this fallback both
    // render the communication's eventoTipo verbatim when event is null, so an unscoped
    // getByText would match twice (header + context) and throw.
    const contextoLabel = screen.getByText("Contexto do risco");
    const contextoSection = contextoLabel.closest("div");
    expect(contextoSection).not.toBeNull();
    expect(within(contextoSection as HTMLElement).getByText("Chuva intensa")).toBeInTheDocument();
  });
});
