import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Server } from "node:http";

vi.mock("./mensagens.js", () => {
  return {
    gerarMensagemComGemini: vi.fn().mockImplementation(async (contexto, regenerado) => {
      const prefixo = regenerado ? "[IA regenerada]" : "[IA gerada]";
      return `${prefixo} Alerta para ${contexto.regiao} sobre ${contexto.eventoTipo}.`;
    }),
  };
});

import { app } from "./server";

let server: Server;
let baseUrl: string;

beforeAll(() => {
  return new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 0;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

afterAll(() => {
  return new Promise<void>((resolve) => server.close(() => resolve()));
});

const CONTEXTO = { eventoTipo: "Vendaval", severidade: "Alto", regiao: "Fortaleza, CE" };

describe("POST /api/gerar-mensagem", () => {
  it("retorna texto gerado pela IA para um contexto válido", async () => {
    const resposta = await fetch(`${baseUrl}/api/gerar-mensagem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(CONTEXTO),
    });

    expect(resposta.status).toBe(200);
    const corpo = (await resposta.json()) as { texto: string };
    expect(corpo.texto).toContain("[IA gerada]");
    expect(corpo.texto).toContain("Fortaleza, CE");
  });

  it("retorna 400 quando campos obrigatórios estão ausentes", async () => {
    const resposta = await fetch(`${baseUrl}/api/gerar-mensagem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventoTipo: "Vendaval" }),
    });

    expect(resposta.status).toBe(400);
  });
});

describe("POST /api/regenerar-mensagem", () => {
  it("retorna texto regenerado para um contexto válido", async () => {
    const resposta = await fetch(`${baseUrl}/api/regenerar-mensagem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(CONTEXTO),
    });

    expect(resposta.status).toBe(200);
    const corpo = (await resposta.json()) as { texto: string };
    expect(corpo.texto).toContain("[IA regenerada]");
  });
});
