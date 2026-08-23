import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventDetailPanel } from "./EventDetailPanel";
import type { WeatherEvent } from "../../../types/event";
import type { Customer } from "../../../types/customer";
import type { CommunicationWithEvent } from "../../../types/communication";

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
  geocodesMunicipios: [],
};

const customers: Customer[] = [
  {
    nome: "Marina Alves",
    apolice: "RES-88231",
    regiao: "Porto Alegre, RS",
    statusComunicacao: "Simulada",
    codigoIbge: "4314902",
  },
];

const communication: CommunicationWithEvent = {
  id: "c1",
  eventId: "ev1",
  canal: "SMS",
  status: "Simulada",
  segurados: 1248,
  geradoEm: "14:11",
  eventoTipo: "Chuva intensa",
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

describe("EventDetailPanel", () => {
  it("renders the rule, the why-these-customers reasoning, and the customer list", () => {
    render(
      <EventDetailPanel event={event} communication={communication} customers={customers} messageEditor={messageEditor} />,
    );

    expect(screen.getByText("Chuva intensa")).toBeInTheDocument();
    expect(screen.getByText(event.regra)).toBeInTheDocument();
    expect(screen.getByText("+ cliente possui seguro residencial")).toBeInTheDocument();
    expect(screen.getByText("→ 1.248 segurados elegíveis para comunicação")).toBeInTheDocument();
    expect(screen.getByText("Marina Alves")).toBeInTheDocument();
  });

  it("renders the MessageEditorCard when a communication exists", () => {
    render(
      <EventDetailPanel event={event} communication={communication} customers={customers} messageEditor={messageEditor} />,
    );

    expect(screen.getByText("Comunicação preventiva")).toBeInTheDocument();
    expect(screen.getByText("Texto atual")).toBeInTheDocument();
  });

  it("does not render the MessageEditorCard section when there is no communication", () => {
    render(<EventDetailPanel event={event} communication={null} customers={customers} messageEditor={messageEditor} />);

    expect(screen.queryByText("Comunicação preventiva")).not.toBeInTheDocument();
  });
});
