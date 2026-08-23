import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Server } from "node:http";
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
  it("returns a stub message for a valid context", async () => {
    const resposta = await fetch(`${baseUrl}/api/gerar-mensagem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(CONTEXTO),
    });

    expect(resposta.status).toBe(200);
    const corpo = (await resposta.json()) as { texto: string };
    expect(corpo.texto).toContain("Vendaval");
  });

  it("returns 400 when required fields are missing", async () => {
    const resposta = await fetch(`${baseUrl}/api/gerar-mensagem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventoTipo: "Vendaval" }),
    });

    expect(resposta.status).toBe(400);
  });
});

describe("POST /api/regenerar-mensagem", () => {
  it("returns a message marked as regenerated", async () => {
    const resposta = await fetch(`${baseUrl}/api/regenerar-mensagem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(CONTEXTO),
    });

    expect(resposta.status).toBe(200);
    const corpo = (await resposta.json()) as { texto: string };
    expect(corpo.texto).toContain("regenerada");
  });
});
