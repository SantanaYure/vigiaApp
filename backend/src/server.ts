import cors from "cors";
import express from "express";
import { gerarMensagemStub, type ContextoEvento } from "./mensagens.js";

const app = express();
app.use(cors());
app.use(express.json());

function parseContexto(body: unknown): ContextoEvento | null {
  if (typeof body !== "object" || body === null) return null;
  const { eventoTipo, severidade, regiao } = body as Record<string, unknown>;
  if (typeof eventoTipo !== "string" || typeof severidade !== "string" || typeof regiao !== "string") {
    return null;
  }
  return { eventoTipo, severidade, regiao };
}

app.post("/api/gerar-mensagem", (req, res) => {
  const contexto = parseContexto(req.body);
  if (!contexto) {
    res.status(400).json({ erro: "eventoTipo, severidade e regiao são obrigatórios." });
    return;
  }
  res.json({ texto: gerarMensagemStub(contexto) });
});

app.post("/api/regenerar-mensagem", (req, res) => {
  const contexto = parseContexto(req.body);
  if (!contexto) {
    res.status(400).json({ erro: "eventoTipo, severidade e regiao são obrigatórios." });
    return;
  }
  res.json({ texto: gerarMensagemStub(contexto, true) });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Backend do Vigia rodando em http://localhost:${PORT}`);
  });
}

export { app };
