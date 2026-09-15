import { beforeEach, describe, expect, it, vi } from "vitest";
import { construirPrompt, gerarMensagemComGemini } from "./mensagens.js";

const generateContentMock = vi.fn();

vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: generateContentMock,
      };
    },
  };
});

const CONTEXTO = { eventoTipo: "Vendaval", severidade: "Alto", regiao: "Fortaleza, CE" };

describe("construirPrompt", () => {
  it("inclui os dados do evento no prompt inicial", () => {
    const prompt = construirPrompt(CONTEXTO);
    expect(prompt).toContain("Vendaval");
    expect(prompt).toContain("Alto");
    expect(prompt).toContain("Fortaleza, CE");
  });

  it("gera instrução de versão concisa quando regenerado = true", () => {
    const prompt = construirPrompt(CONTEXTO, true);
    expect(prompt).toContain("mais concisa");
    expect(prompt).toContain("Vendaval");
  });
});

describe("gerarMensagemComGemini", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it("lança erro amigável quando GEMINI_API_KEY não está configurada", async () => {
    await expect(gerarMensagemComGemini(CONTEXTO)).rejects.toThrow(
      /GEMINI_API_KEY não está configurada/
    );
  });

  it("gera mensagem com Gemini 2.5 Flash quando a chave é válida", async () => {
    generateContentMock.mockResolvedValueOnce({
      text: "Atenção Fortaleza: vendaval previsto. Mantenha-se em local seguro.",
    });

    const resultado = await gerarMensagemComGemini(CONTEXTO, false, {
      apiKey: "chave-valida-teste",
    });

    expect(resultado).toBe("Atenção Fortaleza: vendaval previsto. Mantenha-se em local seguro.");
    expect(generateContentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-2.5-flash",
      })
    );
  });
});
