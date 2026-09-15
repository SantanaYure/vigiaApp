# Vigia

Monitoramento climático proativo para seguradoras (Grupo VIL) — projeto do Desafio 5 do InsurMinds.

Identifica avisos meteorológicos reais (INMET), cruza com a localização dos segurados e demonstra o fluxo de comunicação preventiva — do dado bruto até o envio.

## Publicado (Vercel)

- **App:** https://vigia-front-self.vercel.app
- **API:** https://vigia-backend-navy.vercel.app

## Estrutura do repositório

Monorepo com três partes independentes, cada uma com seu próprio README:

| Pasta | O que é | Roda com |
|---|---|---|
| [`front-end/`](front-end/README.md) | Aplicação Vigia (React/Vite/TS) — Dashboard, Eventos, Comunicações, Histórico. | `npm run dev` dentro de `front-end/` |
| [`backend/`](backend/README.md) | API Node/Express/TS com coleta INMET, regras da Etapa 1, carteira persistida, decisões, geração Gemini e envio simulado. | `npm run dev` dentro de `backend/` |
| [`agent/`](agent/README.md) | Agente de Coleta (Python) — busca avisos reais do INMET e gera o JSON que o front-end lê. Rodado em lote, agendado via GitHub Actions. | `python -m agent.coleta.run` na raiz |

Também:
- `docs/` — documentação de produto: specs, planos, arquitetura.
- `.github/workflows/` — automação (coleta do INMET a cada 30 min).

## Rodando tudo localmente

```bash
# Terminal 1 — front-end
cd front-end && npm install && npm run dev

# Terminal 2 — backend
cd backend && npm install && npm run dev

# A carteira didática de cinco segurados é criada na primeira execução.
# Para substituir por uma carteira autorizada, envie um JSON validado:
node backend/scripts/import-customers.mjs caminho/para/carteira.json

# O backend consulta o INMET ao iniciar e a cada 30 minutos.
# A geração exige GEMINI_API_KEY e usa gemini-3.5-flash.
pip install -r agent/requirements.txt
python -m agent.coleta.run --out front-end/public/data/avisos-inmet.json
```

## Por que essa separação

- **`front-end/`** é uma SPA estática — pode ser hospedada em qualquer CDN, sem servidor.
- **`backend/`** existe porque chave de API de LLM não pode ficar no navegador. Roda sob demanda (o usuário clica e espera resposta na hora).
- **`agent/`** roda em lote, agendado, sem interação do usuário — um modelo de execução completamente diferente do backend, por isso fica separado e em Python (ecossistema mais comum para agentes/dados).
