# Vigia — Pipeline de Agentes

Esta pasta contém os artefatos do pipeline de agentes do Vigia (coleta de dados meteorológicos, identificação de eventos, aplicação de regras de negócio e geração de comunicações — Desafio 5 do InsurMinds). Ela é conceitualmente separada da aplicação:

| Pasta | Responsabilidade |
|---|---|
| `src/` | Produto — a aplicação Vigia (React/Vite/TS): páginas, componentes, Design System, services, mocks, tipos. |
| `agents/` | Pipeline de engenharia baseado em agentes — prompts, workflows e configs usados para construir e operar os agentes do Desafio 5. |
| `docs/` | Documentação do produto — specs, planos, requisitos, arquitetura. |
| `.claude/` | Configuração da ferramenta Claude Code. Não confundir com `agents/`: `.claude/` é configuração de ferramenta, `agents/` é a estrutura conceitual e operacional do pipeline. |

Não coloque prompts, workflows ou artefatos de pipeline dentro de `src/`. Não duplique em `agents/` documentação que já existe em `docs/` — os prompts devem referenciar `docs/`, não copiar seu conteúdo.

## Estrutura

```
agents/
├── README.md      # este arquivo
├── prompts/        # prompts reutilizáveis para agentes especializados
├── workflows/       # fluxos de trabalho do pipeline
└── configs/         # configuração necessária para rodar o pipeline
```

Nada é criado dentro de `prompts/`, `workflows/` ou `configs/` sem finalidade real — essas pastas começam vazias (com `.gitkeep`) e recebem arquivo quando cada etapa do pipeline (coleta, identificação de eventos, regras de negócio, geração de mensagens) é de fato implementada.

## 1. Harness Engineering

Define o ambiente em que os agentes operam.

- **Estrutura do repositório:** monorepo único — `src/` (produto), `agents/` (pipeline), `docs/` (documentação), `.claude/` (config da ferramenta). Sem repositório separado para o pipeline.
- **Arquivos que os agentes podem modificar:** um agente trabalhando no pipeline modifica apenas `agents/`, sem tocar `src/` a menos que a tarefa exija explicitamente. Um agente trabalhando no frontend modifica `src/` e o necessário da aplicação, sem alterar `agents/` sem necessidade. Ver [Regra de isolamento](#regra-de-isolamento).
- **Comandos permitidos:** os scripts já definidos em `package.json` (`npm run dev`, `npm run build`, `npm test`, `npm run lint`) para o frontend. Para o pipeline em Python (rodar a partir da raiz do repositório):
  - `pip install -r agents/requirements.txt` — instala as dependências.
  - `python -m agents.coleta.run` — roda o agente de Coleta e imprime os avisos normalizados no stdout.
  - `python -m agents.coleta.run --out agents/coleta/output/avisos.json` — roda e salva em arquivo (pasta ignorada pelo git — é saída, não fonte).
  - `python -m unittest agents.coleta.test_normalizer -v` — roda os testes do normalizador.
- **Regras de segurança:** nenhuma chave de API ou credencial é commitada no repositório — variáveis de ambiente ficam fora do controle de versão (`.env` no `.gitignore`). Segredos ficam ocultos em `configs/`, nunca hardcoded em prompts ou workflows.
- **Critérios de conclusão:** ver [Gauntlet](#gauntlet).
- **Processo de revisão:** cada etapa do pipeline (agente) é revisada isoladamente antes de ser encadeada às demais — mesma lógica de revisão por tarefa já usada na construção do frontend (spec compliance + qualidade), adaptada para agentes Python.

## 2. Loop Engineering

Ciclo padrão de desenvolvimento de cada agente ou etapa do pipeline:

```
INSPECT → UNDERSTAND → PLAN → IMPLEMENT → RUN → TEST → REVIEW → FIX → DOCUMENT → VALIDATE
```

Uma tarefa não é considerada concluída apenas porque o código foi escrito — as validações (RUN, TEST, REVIEW) precisam ser executadas antes de DOCUMENT/VALIDATE fecharem o ciclo.

## 3. Graph Engineering

Fluxo do projeto, do briefing à conclusão:

```
Briefing → Requisitos → Design → Arquitetura → Implementação → Testes → Code Review → Design Review → Gauntlet → Conclusão
```

Tarefas independentes (ex.: agente de coleta vs. definição do contrato de dados) podem ser executadas em paralelo. Tarefas que alteram os mesmos arquivos só são paralelizadas com uma estratégia explícita para evitar conflito.

## 4. Gauntlet

Validação final antes de considerar uma etapa do pipeline pronta:

- **Requisitos:** a implementação atende ao requisito original (os mínimos do Desafio 5: coleta, identificação, regras, geração de mensagens, simulação de envio)?
- **Design:** quando a etapa toca a interface, ela respeita as telas e o Design System aprovados do Vigia?
- **UX:** a interface preserva os princípios de usabilidade definidos para o Vigia?
- **Código:** está organizado, tipado e sem duplicações desnecessárias?
- **Testes:** os testes relevantes passam?
- **Segurança:** não há credenciais, segredos ou dados sensíveis indevidos no repositório?
- **Build:** a aplicação (`npm run build`) continua compilando corretamente?

## Regra de isolamento

- Um agente trabalhando no pipeline pode modificar `agents/` sem modificar `src/`, salvo quando a tarefa exigir explicitamente.
- Um agente trabalhando no frontend pode modificar `src/` e o necessário da aplicação, mas não deve alterar `agents/` sem necessidade.
- Não misture artefatos do pipeline com o código da aplicação.

## Agentes implementados

### Coleta (`agents/coleta/`)

Busca os avisos meteorológicos ativos na API pública do INMET (`https://apiprevmet3.inmet.gov.br/avisos/ativos`, sem autenticação) e normaliza para `AvisoClimatico` — um por aviso, já com severidade, tipo (`descricao`), período de vigência e a lista de municípios afetados por código IBGE (`geocodes`), prontos para a etapa de identificação de eventos cruzar com a localização dos segurados.

- `inmet_client.py` — chamada HTTP crua, isolada (única parte que conhece a URL da API).
- `normalizer.py` — converte o JSON bruto do INMET no formato interno (`AvisoClimatico`); é a fronteira entre o formato do INMET e o que as próximas etapas do pipeline vão consumir.
- `run.py` — entrypoint executável (`python -m agents.coleta.run`).
- `test_normalizer.py` — testes do normalizador com uma amostra fixa (não chama a API real).

A identificação de eventos relevantes (cruzar avisos × segurados por código IBGE) já acontece no front-end, em `src/services/realEventsSource.ts` + `src/services/geoMatch.ts` — não é um agente Python separado, mas cumpre essa etapa do fluxo mínimo do desafio.

Ainda não implementados: aplicação de regras de negócio reais (depende da Pessoa 2), geração de mensagens via IA (depende da Pessoa 3). Hoje esses campos existem como placeholder explícito (`regra`/`tipoSeguro`), nunca fabricados como se fossem reais.

### Automação da coleta

`.github/workflows/coleta-inmet.yml` roda o agente de Coleta a cada 30 minutos (GitHub Actions, `cron: */30 * * * *`, mais `workflow_dispatch` para disparo manual) e commita `public/data/avisos-inmet.json` de volta no repositório quando há mudança. Isso mantém os avisos atualizados independente de alguém estar rodando o projeto localmente — mas só funciona depois que o repositório for enviado ao GitHub (`git push`), já que o workflow roda nos runners do GitHub, não na máquina local.

## Estado atual

Não existe mais nenhum mock de domínio no front-end (segurados, comunicações, histórico, eventos) — foram removidos deliberadamente. O que existe hoje:

- **Eventos**: dado real da API do INMET (`getRealEvents`).
- **Segurados**: dado de TESTE explícito e documentado como tal (`src/services/testCustomersSource.ts`, `public/data/segurados-teste.json`) — não é um cadastro real, mas também não é um mock escondido; existe pra exercitar o cruzamento geográfico enquanto não há um cadastro real de segurados.
- **Comunicações e Histórico**: começam genuinamente vazios — não existe geração real de mensagens (Pessoa 3) nem simulação de envio acontecendo ainda, então essas telas só populam quando alguém interage com o fluxo.

Ainda sem backend real, banco de dados, autenticação real, IA real ou envio real de mensagens. A implementação de cada camada permite que o front-end substitua qualquer fonte por uma real no futuro sem reescrever a interface consumidora.
