import "dotenv/config";
import cors from "cors";
import express from "express";
import { gerarMensagemComGemini, type ContextoEvento } from "./mensagens.js";

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

app.post("/api/gerar-mensagem", async (req, res) => {
  const contexto = parseContexto(req.body);
  if (!contexto) {
    res.status(400).json({ erro: "eventoTipo, severidade e regiao são obrigatórios." });
    return;
  }

  try {
    const texto = await gerarMensagemComGemini(contexto, false);
    res.json({ texto });
  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : "Erro inesperado ao gerar mensagem.";
    console.error("Erro na geração com Gemini:", mensagemErro);
    res.status(500).json({ erro: mensagemErro });
  }
});

app.post("/api/regenerar-mensagem", async (req, res) => {
  const contexto = parseContexto(req.body);
  if (!contexto) {
    res.status(400).json({ erro: "eventoTipo, severidade e regiao são obrigatórios." });
    return;
  }

  try {
    const texto = await gerarMensagemComGemini(contexto, true);
    res.json({ texto });
  } catch (erro) {
    const mensagemErro = erro instanceof Error ? erro.message : "Erro inesperado ao regenerar mensagem.";
    console.error("Erro na regeneração com Gemini:", mensagemErro);
    res.status(500).json({ erro: mensagemErro });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

// Na Vercel o app roda como função serverless (ver api/index.ts) — não deve
// abrir uma porta própria. Só sobe um servidor tradicional localmente/testes.
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend do Vigia rodando em http://localhost:${PORT}`);
  });
}

export { app };
