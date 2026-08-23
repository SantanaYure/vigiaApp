# Vigia — Backend

API mínima (Node/Express/TS) que segura o que não pode rodar no navegador. Hoje isso é só uma coisa: gerar/regenerar o texto de uma comunicação preventiva.

## Por que isso existe

O front-end (`../front-end/`) é uma SPA estática — qualquer chave de API colocada lá fica visível no bundle JS, então uma chamada real a um provedor de LLM (OpenAI/Anthropic/Gemini) nunca pode acontecer direto do navegador. Este backend é o lugar onde essa chamada vai morar quando a geração de mensagens virar real (depende dos prompts da Pessoa 3 e das regras da Pessoa 2 — Desafio 5 do InsurMinds).

## Estado atual: stub

`POST /api/gerar-mensagem` e `POST /api/regenerar-mensagem` **não chamam nenhuma IA ainda** — devolvem um texto placeholder claramente identificado como stub (`src/mensagens.ts`). Isso prova a integração ponta a ponta (front-end → backend → resposta) sem fingir que existe geração real. Quando os prompts da Pessoa 3 e as regras da Pessoa 2 chegarem, só `mensagens.ts` muda — o contrato HTTP (rota, body, formato da resposta) fica igual, então o front-end não precisa mudar.

## Rotas

### `POST /api/gerar-mensagem`

Body:
```json
{ "eventoTipo": "Vendaval", "severidade": "Alto", "regiao": "Fortaleza, CE" }
```

Resposta (`200`):
```json
{ "texto": "[Mensagem gerada — stub] ..." }
```

`400` se `eventoTipo`, `severidade` ou `regiao` estiverem ausentes.

### `POST /api/regenerar-mensagem`

Mesmo body e formato de resposta — o texto vem marcado como `[Mensagem regenerada — stub]`.

## Rodando localmente

```bash
cd backend
npm install
npm run dev
```

Sobe em `http://localhost:3001` por padrão (configurável via variável de ambiente `PORT`).

## Comandos

- `npm run dev` — roda com hot reload (`tsx watch`).
- `npm run build` — compila para `dist/`.
- `npm start` — roda o build compilado.
- `npm test` — roda os testes (Vitest).
- `npm run typecheck` — checagem de tipos sem emitir.
