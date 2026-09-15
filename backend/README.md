# Vigia — Backend

API do MVP do Desafio 5 (Node/Express/TS): coleta avisos reais do INMET, aplica a matriz da Etapa 1, cruza com a carteira persistida, gera comunicações via Google Gemini e simula o envio.

## Por que isso existe

O front-end (`../front-end/`) é uma SPA estática — qualquer chave de API colocada lá fica visível no bundle JS, então a chamada ao provedor de LLM nunca deve acontecer direto do navegador. Este backend protege as credenciais dos provedores e padroniza a geração com instruções de sistema voltadas à prevenção de sinistros e proteção de vidas/patrimônio.

## Geração com IA (Gemini 3.5 Flash)

O agente usa o modelo **Gemini 3.5 Flash** (`gemini-3.5-flash`) através do SDK oficial `@google/genai`. A chave permanece somente no back-end. Há um segundo provedor opcional, **Groq** via API compatível com OpenAI, com os modelos OSS `openai/gpt-oss-120b` ou `openai/gpt-oss-20b`; o Gemini continua sendo o padrão.

Para habilitar o Groq depois de obter a chave no [GroqCloud](https://console.groq.com/keys), configure no `.env`:

```env
AI_PROVIDER=groq
GROQ_API_KEY=sua_chave_groq
GROQ_MODEL=openai/gpt-oss-120b
GROQ_API_BASE_URL=https://api.groq.com/openai/v1
```

Sem `GROQ_API_KEY`, o servidor não chama o Groq. `GET /api/ia/provedores` mostra qual provedor está ativo e quais credenciais estão configuradas, sem expor segredos.

Quando `AI_PROVIDER=gemini`, o Gemini é sempre tentado primeiro. Em cota esgotada (`429`), modelo indisponível ou falha temporária, o backend usa automaticamente a Groq se `GROQ_API_KEY` estiver configurada. A rota `POST /api/ia/verificar` identifica esse caso com `fallbackDe: "gemini"`; as comunicações persistem o modelo efetivamente usado.

- Se `GEMINI_API_KEY` não for configurada no `.env`, a API retorna status `500` com instrução clara para configurar a chave.
- O contrato HTTP (rota, body, formato da resposta `{ texto: string }`) é mantido fiel, garantindo total compatibilidade com o front-end.

## Rotas

### `POST /api/agente/executar`

Consulta o INMET, persiste os avisos, registra cada decisão elegível/não elegível e gera as mensagens para os segurados elegíveis. A execução é idempotente por revisão do aviso, apólice e versão da regra.

### `POST /api/comunicacoes/:id/simular`

Registra o envio simulado permitido pelo desafio. A resposta inclui `notificacao.mensagem` de confirmação. Falhas retornam erro ao usuário e são registradas em armazenamento técnico não exposto nas rotas públicas.

### `POST /api/segurados`

Importa uma carteira autorizada em JSON. A primeira inicialização cria os cinco segurados fictícios solicitados. O payload exige código IBGE, produto, coberturas, vigência e canal; SMS exige telefone.

### `POST /api/ia/verificar`

Faz uma chamada real curta para verificar chave, modelo e cota.

### Compatibilidade `POST /api/gerar-mensagem`

Body:
```json
{ "communicationId": "id-da-comunicacao" }
```

Resposta (`200`):
```json
{ "texto": "Atenção: previsão de vendaval na região de Fortaleza, CE..." }
```

`400` se `communicationId` estiver ausente.

### `POST /api/comunicacoes/:id/regenerar`

Gera uma versão alternativa da comunicação persistida, revalidando aviso, apólice, vigência e cobertura.

## Configuração de Ambiente

Crie um arquivo `.env` dentro de `backend/` com base no `.env.example`:

```env
PORT=3001
GEMINI_API_KEY=sua_chave_do_google_ai_studio
GEMINI_MODEL=gemini-3.5-flash
AI_PROVIDER=gemini
# Opcional: habilite o Groq OSS com AI_PROVIDER=groq e sua chave
# GROQ_API_KEY=sua_chave_groq
# GROQ_MODEL=openai/gpt-oss-120b
# GROQ_API_BASE_URL=https://api.groq.com/openai/v1
```

> Obtenha sua chave gratuitamente em [Google AI Studio](https://aistudio.google.com/).

## Rodando localmente

```bash
cd backend
npm install
npm run dev
```

Sobe em `http://localhost:3001` por padrão (configurável via variável de ambiente `PORT`).

O SQLite é criado em `backend/data/vigia.sqlite` e deve ficar em um servidor persistente. Não use Vercel Functions para esta versão, pois o armazenamento local é efêmero.

## Comandos

- `npm run dev` — roda com hot reload (`tsx watch`).
- `npm run build` — compila para `dist/`.
- `npm start` — roda o build compilado.
- `npm test` — roda os testes (Vitest).
- `npm run typecheck` — checagem de tipos sem emitir.
