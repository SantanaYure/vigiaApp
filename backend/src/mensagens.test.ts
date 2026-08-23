import { describe, expect, it } from "vitest";
import { gerarMensagemStub } from "./mensagens";

const CONTEXTO = { eventoTipo: "Vendaval", severidade: "Alto", regiao: "Fortaleza, CE" };

describe("gerarMensagemStub", () => {
  it("marks the message as a stub and includes the event context", () => {
    const texto = gerarMensagemStub(CONTEXTO);

    expect(texto).toContain("[Mensagem gerada — stub]");
    expect(texto).toContain("Vendaval");
    expect(texto).toContain("Alto");
    expect(texto).toContain("Fortaleza, CE");
  });

  it("marks a regenerated message differently from a first-generation one", () => {
    const gerado = gerarMensagemStub(CONTEXTO);
    const regenerado = gerarMensagemStub(CONTEXTO, true);

    expect(regenerado).toContain("[Mensagem regenerada — stub]");
    expect(regenerado).not.toBe(gerado);
  });
});
