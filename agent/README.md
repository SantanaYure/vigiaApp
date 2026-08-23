# Vigia — Agente de Coleta (Python)

Esta pasta contém o agente de Coleta do Vigia — a etapa do pipeline do Desafio 5 (InsurMinds) que busca dados meteorológicos reais e os normaliza para o resto do sistema consumir. O repositório é um monorepo com três partes:

| Pasta | Responsabilidade |
|---|---|
| `front-end/` | Aplicação Vigia (React/Vite/TS) — páginas, componentes, Design System, services, tipos. |
| `backend/` | API (Node/TS) que segura o que não pode rodar no navegador — hoje, geração/regeneração de mensagem. Ver [`backend/README.md`](../backend/README.md). |
| `agent/` | Este pipeline — coleta de dados meteorológicos em Python, rodado em lote (local ou via GitHub Actions), não sob demanda. |
| `docs/` | Documentação do produto — specs, planos, requisitos, arquitetura. |
| `.claude/` | Configuração da ferramenta Claude Code. Não confundir com `agent/`: `.claude/` é configuração de ferramenta, `agent/` é o pipeline de dados. |

**Por que `agent/` é Python e separado do `backend/` em Node:** são modelos de execução diferentes. `agent/` roda em lote, agendado (cron via GitHub Actions), sem estado entre execuções, e escreve um arquivo estático (`front-end/public/data/avisos-inmet.json`) que o front-end lê. `backend/` responde sob demanda (o usuário clica "Regenerar" e espera uma resposta na hora) — por isso vive junto do resto do código web, em TypeScript, compartilhando tipos com o front-end.

## Estrutura

```
agent/
├── README.md      # este arquivo
├── requirements.txt
├── coleta/          # o agente de Coleta em si
│   ├── inmet_client.py
│   ├── normalizer.py
│   ├── run.py
│   └── test_normalizer.py
├── prompts/        # prompts reutilizáveis para agentes futuros (regras, mensagens)
├── workflows/       # fluxos de trabalho do pipeline
└── configs/         # configuração necessária para rodar o pipeline
```

`prompts/`, `workflows/` e `configs/` começam vazias (com `.gitkeep`) — nada é criado ali sem finalidade real. Recebem conteúdo quando um novo agente Python (ex.: aplicação de regras) for de fato implementado.

## Coleta (`agent/coleta/`)

Busca os avisos meteorológicos ativos na API pública do INMET (`https://apiprevmet3.inmet.gov.br/avisos/ativos`, sem autenticação) e normaliza para `AvisoClimatico` — um por aviso, já com severidade, tipo (`descricao`), período de vigência e a lista de municípios afetados por código IBGE (`geocodes`), prontos para o front-end cruzar com a localização dos segurados.

- `inmet_client.py` — chamada HTTP crua, isolada (única parte que conhece a URL da API).
- `normalizer.py` — converte o JSON bruto do INMET no formato interno (`AvisoClimatico`); é a fronteira entre o formato do INMET e o que o front-end vai consumir.
- `run.py` — entrypoint executável.
- `test_normalizer.py` — testes do normalizador com uma amostra fixa (não chama a API real).

A identificação de eventos relevantes (cruzar avisos × segurados por código IBGE) acontece no front-end, em `front-end/src/services/realEventsSource.ts` + `front-end/src/services/geoMatch.ts` — não é um agente Python separado, mas cumpre essa etapa do fluxo mínimo do desafio.

Ainda não implementados como agentes Python: aplicação de regras de negócio reais (depende da Pessoa 2), geração de mensagens via IA (depende da Pessoa 3 — hoje isso vive como stub em `backend/`, não aqui).

## Comandos (a partir da raiz do repositório)

- `pip install -r agent/requirements.txt` — instala as dependências.
- `python -m agent.coleta.run` — roda o agente de Coleta e imprime os avisos normalizados no stdout.
- `python -m agent.coleta.run --out front-end/public/data/avisos-inmet.json` — roda e escreve direto onde o front-end lê.
- `python -m unittest agent.coleta.test_normalizer -v` — roda os testes do normalizador.

## Automação

`.github/workflows/coleta-inmet.yml` roda o agente de Coleta a cada 30 minutos (`cron: */30 * * * *`, mais `workflow_dispatch` para disparo manual) e commita `front-end/public/data/avisos-inmet.json` de volta no repositório quando há mudança — mantém os avisos atualizados independente de alguém estar rodando o projeto localmente.

## Harness Engineering

- **Arquivos que este agente pode modificar:** só dentro de `agent/`, sem tocar `front-end/` ou `backend/` a menos que a tarefa exija explicitamente.
- **Segredos:** nenhuma chave de API é necessária hoje (a API do INMET é pública). Se uma chave for necessária no futuro, fica em variável de ambiente (`.env`, no `.gitignore`), nunca hardcoded.
- **Build/validação:** `python -m unittest agent.coleta.test_normalizer -v` antes de considerar uma mudança pronta.

## Loop Engineering

Ciclo padrão de desenvolvimento de cada etapa do pipeline:

```
INSPECT → UNDERSTAND → PLAN → IMPLEMENT → RUN → TEST → REVIEW → FIX → DOCUMENT → VALIDATE
```

## Gauntlet

Validação final antes de considerar uma etapa do pipeline pronta:

- **Requisitos:** atende ao requisito original (coleta de dado meteorológico real, sem autenticação necessária)?
- **Testes:** os testes relevantes passam?
- **Segurança:** não há credenciais, segredos ou dados sensíveis indevidos no repositório?
- **Integração:** o front-end (`front-end/`) continua conseguindo ler o JSON gerado sem mudanças?

## Estado atual

Não existe mais nenhum mock de domínio no front-end (segurados, comunicações, histórico, eventos) — foram removidos deliberadamente. O que existe hoje:

- **Eventos**: dado real da API do INMET, coletado por este agente (`getRealEvents`, no front-end).
- **Segurados**: dado de TESTE explícito e documentado como tal (`front-end/src/services/testCustomersSource.ts`, `front-end/public/data/segurados-teste.json`) — não é um cadastro real, mas também não é um mock escondido.
- **Comunicações e Histórico**: começam genuinamente vazios — sem geração real de mensagens ainda, essas telas só populam quando alguém interage com o fluxo (via `backend/`, hoje em modo stub).

Ainda sem banco de dados, autenticação real ou envio real de mensagens.
