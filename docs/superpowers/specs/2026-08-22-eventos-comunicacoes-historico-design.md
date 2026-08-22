# Eventos, Comunicações e Histórico — Spec

**Status:** Aprovado pelo usuário em 22/08/2026 (fundação, estrutura das telas, e regra de fidelidade visual — três rodadas de aprovação na sessão de brainstorming).

## Objetivo

Implementar as três telas que ficaram como placeholder no ciclo anterior (App Shell + Dashboard): **Eventos**, **Comunicações** e **Histórico**, com fidelidade total ao protótipo (`Vigia Prototype.dc.html`) e ao Design System já em produção neste repositório.

## Escopo

Front-end + mocks locais apenas. Sem backend real, sem APIs externas, sem autenticação, sem IA. Nenhuma tela além das três listadas. Nenhuma reinterpretação do layout do protótipo — ele e o Design System são a fonte de verdade visual; qualquer ambiguidade se resolve replicando o protótipo, não "melhorando" o design.

## Não fazer (fora de escopo deste ciclo)

- Toggle artificial de erro de API (`simularErroApi` do protótipo) — os três estados de erro usam falhas reais dos services mockados, mesmo padrão já usado no Dashboard.
- `regenCount` do protótipo — é estado declarado mas nunca lido em lugar nenhum da lógica original; não replicar.
- Qualquer filtro, coluna ou ação que não exista no protótipo (ex.: não adicionar clique nas linhas do Histórico, não adicionar busca no Histórico).
- Editar/excluir segurados, eventos ou regras — essas telas são somente leitura sobre os mocks, exceto o texto da comunicação.

## Arquitetura

### Roteamento

`/eventos` e `/eventos/:id` renderizam o mesmo componente `EventsPage` (idem `/comunicacoes` e `/comunicacoes/:id` → `CommunicationsPage`). O item selecionado é **derivado diretamente de `useParams().id`** — não existe estado React duplicado para isso.

- Clicar numa linha → `navigate('/eventos/' + id)`.
- Clicar na linha já selecionada → `navigate('/eventos')` (toggle off, replica `selectedEventId: prev === id ? null : id` do protótipo).
- Chegar via link externo (ex.: o card de "Eventos que exigem atenção" do Dashboard, que já linka para `/eventos/:id`) já mostra o painel de detalhe aberto.

`EventDetailPage.tsx` e `CommunicationDetailPage.tsx` são removidos — o conteúdo deles passa a viver dentro de `EventsPage`/`CommunicationsPage`.

### Mock store gravável

Hoje os services só leem arrays estáticos. Para que editar/regenerar/simular envio em uma comunicação apareça em qualquer tela que a exiba durante a sessão (Eventos, Comunicações, Histórico), os mocks de comunicações e histórico passam a viver por trás de um pequeno **store em memória, no nível do módulo** — mutável, mas só acessível através dos services (nenhuma página importa o store diretamente). Isso não é uma biblioteca de estado global: é um módulo TS comum com um array mutável e funções que o leem/escrevem, análogo a um banco de dados fake.

Depois de qualquer mutação, a página chama `reload()` (já fornecido por `useAsyncData`) para buscar o estado atual do store via o service — não há necessidade de Context, assinatura ou pub/sub.

## Tipos e Mocks novos

`src/types/customer.ts`

```ts
export interface Customer {
  nome: string;
  apolice: string;
  regiao: string;
  statusComunicacao: CommunicationStatus;
}
```

`src/mocks/customers.ts` — porta `CUSTOMERS_POOL` do protótipo (4 registros: Marina Alves/RES-88231, Carlos Eduardo Souza/RES-88450, Fernanda Lima/RES-77102, João Pedro Martins/RES-90112 — regiões e status exatamente como no protótipo). O protótipo reutiliza o mesmo pool para qualquer evento selecionado (não há filtro por evento) — replicar essa simplificação, não inventar uma associação por região.

`src/types/history.ts`

```ts
export interface HistoryEntry {
  id: string;
  eventoTipo: string;
  regiao: string;
  segurados: number;
  canal: CommunicationChannel;
  status: CommunicationStatus;
  horario: string;
}
```

`src/mocks/history.ts` — porta `HISTORY_INIT` do protótipo (4 registros h1–h4, mesmos valores).

`src/mocks/communicationMessages.ts` — porta `MESSAGES` (texto original por `commId`) e `REGEN_ALT` (texto alternativo "regenerado" por `commId`) do protótipo, verbatim.

## Services

`src/services/eventsService.ts` — adiciona `getEventById(id: string): Promise<WeatherEvent | null>` (busca em `eventsMock`, sem mutação).

`src/services/customersService.ts` (novo) — `getCustomersForEvent(eventId: string): Promise<Customer[]>` retorna o pool completo (ver nota acima), simulando latência via `simulateDelay`.

`src/services/communicationsService.ts` — vira o dono do store mutável de comunicações. Além do já existente `getAllCommunications()`:

- `getCommunicationById(id): Promise<CommunicationWithEvent | null>`
- `getCommunicationText(id): Promise<string>` — texto editado (se houver) ou o original de `communicationMessages`.
- `updateCommunicationText(id, text): Promise<void>` — grava o texto editado no store.
- `regenerateCommunicationText(id): Promise<void>` — grava `REGEN_ALT[id]` como texto atual.
- `simulateCommunicationSend(id): Promise<void>` — marca a comunicação como `"Simulada"` no store **e** chama `historyService` para acrescentar uma nova entrada (evento, região, segurados, canal, status `"Simulada"`, horário `"agora"` — replica `confirmSimulate` do protótipo).

`src/services/historyService.ts` (novo) — `getHistory(): Promise<HistoryEntry[]>` (seed + entradas adicionadas na sessão) e uma função interna `appendHistoryEntry` usada só por `communicationsService`.

## Componentes novos do Design System

`src/design-system/Modal.tsx` + `.module.css` — overlay (`position:fixed;inset:0;background:rgba(15,15,15,0.4)`) centralizando um card de 380px com header/body/footer, replicando o modal de confirmação do protótipo. Props: `title`, `children`, `onCancel`, `cancelLabel`, `onConfirm`, `confirmLabel`.

`src/design-system/Toast.tsx` + `.module.css` — canto inferior direito, sem bolinha, cor de fundo/texto pelo tom da notificação (`tonePalette`), conforme o documento de atualização do Design System já publicado. Props: `tone`, `message`. Fica montado condicionalmente pela página (sem gerenciador global de toasts — só uma tela fica visível por vez). A página que o exibe é responsável por escondê-lo depois de 3000ms (`setTimeout`, mesmo valor do protótipo) — o componente em si não tem temporizador interno, só renderiza enquanto a página mantiver `toast` no estado.

## Tela: Eventos (`src/pages/EventsPage.tsx`)

Layout: `PageHeader` → busca (`input`, placeholder "Buscar por tipo ou região") + filtro de severidade (`select`: Todas as severidades/Crítico/Alto/Moderado/Baixo) → `Panel` com `<ul>` de eventos filtrados; se um evento está selecionado, um painel de detalhe de 460px aparece ao lado e a lista vira `flex:1`.

**Linha de evento** (`features/events/components/EventRow.tsx`): mesmo padrão de tag corrigido no Dashboard — `StatusPill` (severidade) à direita junto da contagem de segurados. **Atenção:** a legenda secundária aqui é `"{regiao} · {status}"` (Ativo/Monitorando/Encerrado), **não** `"{regiao} · {detectadoEm}"` como no card do Dashboard — são componentes parecidos mas com dado diferente no protótipo; não reaproveitar `AttentionEventRow` diretamente, criar `EventRow` como componente próprio desta tela.

**Painel de detalhe** (`features/events/components/EventDetailPanel.tsx`):
1. Header: título (`tipo`) + subtítulo (`regiao · detectado às {detectadoEm} · previsão: {previsao}`) + badge de severidade.
2. "Regra aplicada" — `event.regra`.
3. "Por que estes segurados?" — 4 linhas fixas replicando o protótipo: `"{tipo} detectado em {regiao}"`, `"+ cliente possui {tipoSeguro}"`, `"+ endereço associado à área afetada"`, `"→ {segurados} segurados elegíveis para comunicação"`.
4. "Segurados impactados" — lista de `Customer` (nome/apólice/região + `StatusPill` de status).
5. Se existir uma `Communication` para este evento: "Comunicação preventiva" com `MessageEditorCard`.

## Tela: Comunicações (`src/pages/CommunicationsPage.tsx`)

Mesmo esqueleto de busca + filtro (placeholder "Buscar por evento ou canal"; filtro de status: Todos os status/Aguardando revisão/Revisada/Simulada/Erro) + lista + painel de 460px.

**Linha de comunicação** (`features/communications/components/CommunicationRow.tsx`): título/canal+segurados à esquerda, `StatusPill` de status à direita (sem horário nesta linha — o protótipo não mostra `geradoEm` na lista, só no painel de detalhe).

**Painel de detalhe** (`features/communications/components/CommunicationDetailPanel.tsx`):
1. Header: título (`eventoTipo`) + subtítulo (`regiao · canal · gerada às {geradoEm}`).
2. "Contexto do risco" — `"{tipo} · {severidade} · {regiao} — {regra}"`.
3. "Destinatários" — `{segurados} segurados`.
4. `MessageEditorCard`.

## `MessageEditorCard` (componente compartilhado)

`src/features/communications/components/MessageEditorCard.tsx` — usado por `EventDetailPanel` e `CommunicationDetailPanel`. Props: `communication`, `text`, `isEditing`, `onToggleEdit`, `onTextChange`, `onRegenerate`, `onRequestSimulate`.

- Header: canal (esquerda) + `StatusPill` de status (direita).
- Corpo: `textarea` (modo edição) ou texto simples (modo leitura).
- Rodapé: botão "Editar"/"Concluir edição" (toggle), "Regenerar", e "Simular envio" (empurrado para a direita, estilo primário).

O estado `isEditing` é local à página que renderiza o painel de detalhe, resetado sempre que o `id` selecionado muda (efeito `useEffect` sobre o `id` do parâmetro de rota) — replica o protótipo, que zera `editingEvent`/`editingComm` a cada nova seleção.

## Fluxo de simulação de envio

```text
Simular envio
      ↓
Modal de confirmação ("Confirmar simulação de envio" + resumo:
  "{segurados} segurados · {evento.tipo} · {evento.regiao} · {canal}")
      ↓
Confirmar simulação
      ↓
communicationsService.simulateCommunicationSend(id)
      ↓
Store mutado (comunicação → "Simulada"; nova entrada em Histórico)
      ↓
Fechar Modal
      ↓
Toast de sucesso ("Envio simulado com sucesso", tom success)
      ↓
reload() da página atual
      ↓
Status refletido na tela; qualquer outra tela que buscar essa
comunicação durante a sessão também verá "Simulada"
```

Cancelar no modal só fecha o modal, sem chamar o service.

## Tela: Histórico (`src/pages/HistoryPage.tsx`)

`PageHeader` → filtro de status (mesmas opções de Comunicações) → `Panel` com uma tabela (`<table>`) de colunas Evento / Região / Segurados / Comunicação (canal) / Status (`StatusPill`) / Horário. Sem busca, sem clique nas linhas — puramente uma grade somente-leitura, fiel ao protótipo. Dados via `historyService.getHistory()`.

## Estados (Eventos, Comunicações e Histórico)

- **Loading:** `Skeleton` (mesmo padrão do Dashboard) enquanto os dados iniciais carregam.
- **Empty** (lista/tabela filtrada sem resultados): `EmptyState` — Eventos: "Nenhum evento encontrado" / "Ajuste a busca ou o filtro de severidade para ver mais resultados."; Comunicações: "Nenhuma comunicação encontrada" / "Ajuste a busca ou o filtro de status."; Histórico: "Nenhum registro encontrado" / "Ajuste o filtro de status para ver mais resultados."
- **Error** (falha real do service): `AlertBanner` + botão "Tentar novamente" chamando `reload()` — mesmo padrão do Dashboard, sem toggle artificial. Eventos reaproveita a cópia do protótipo: "Não foi possível carregar os eventos" / "A API de dados climáticos está indisponível. Verifique a conexão e tente novamente." Comunicações e Histórico usam a mesma estrutura com textos análogos ao respectivo domínio.

## Critérios de aceite

- As três telas substituem os placeholders atuais; nenhuma outra tela é tocada além de ajustes estritamente necessários em `App.tsx` (remoção das rotas de detalhe separadas) e no card de evento do Dashboard, se necessário, para continuar linkando corretamente.
- Editar, regenerar e simular envio funcionam de ponta a ponta sobre os mocks, e uma mudança feita a partir do painel de Eventos é visível ao abrir a mesma comunicação em Comunicações, e gera uma linha nova em Histórico.
- `npm run lint`, `npm run typecheck`, `npm run test` e `npm run build` passam.
- Responsivo em 1440/1024/375px, sem overflow horizontal, seguindo os breakpoints já estabelecidos no App Shell/Dashboard.
- Nenhum valor de espaçamento/raio duplica um token existente sem usar `var(--space-N)`/`var(--radius-N)` (mesma regra já aplicada nas telas anteriores).
