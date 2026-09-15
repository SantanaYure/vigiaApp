# Vigia — Backend

API mínima (Node/Express/TS) que segura o que não pode rodar no navegador: geração e regeneração do texto de comunicações preventivas para segurados via Inteligência Artificial (**Google Gemini 2.5 Flash**).

## Por que isso existe

O front-end (`../front-end/`) é uma SPA estática — qualquer chave de API colocada lá fica visível no bundle JS, então a chamada ao provedor de LLM (Google Gemini) nunca deve acontecer direto do navegador. Este backend protege a credencial `GEMINI_API_KEY` e padroniza a geração com instruções de sistema voltadas à prevenção de sinistros e proteção de vidas/patrimônio.

## Geração com IA (Gemini 2.5 Flash)

As rotas `POST /api/gerar-mensagem` e `POST /api/regenerar-mensagem` utilizam o modelo **Gemini 2.5 Flash** (`gemini-2.5-flash`) através do SDK oficial `@google/genai`. 

- Se `GEMINI_API_KEY` não for configurada no `.env`, a API retorna status `500` com instrução clara para configurar a chave.
- O contrato HTTP (rota, body, formato da resposta `{ texto: string }`) é mantido fiel, garantindo total compatibilidade com o front-end.

## Rotas

### `POST /api/gerar-mensagem`

Body:
```json
{ "eventoTipo": "Vendaval", "severidade": "Alto", "regiao": "Fortaleza, CE" }
```

Resposta (`200`):
```json
{ "texto": "Atenção: previsão de vendaval na região de Fortaleza, CE..." }
```

`400` se `eventoTipo`, `severidade` ou `regiao` estiverem ausentes.

### `POST /api/regenerar-mensagem`

Mesmo body e formato de resposta — orienta a IA a gerar uma versão alternativa, focando em checklist objetivo de segurança e ações imediatas.

## Configuração de Ambiente

Crie um arquivo `.env` dentro de `backend/` com base no `.env.example`:

```env
PORT=3001
GEMINI_API_KEY=sua_chave_do_google_ai_studio
```

> Obtenha sua chave gratuitamente em [Google AI Studio](https://aistudio.google.com/).

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
