# Eventos, Comunicações e Histórico Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Eventos, Comunicações and Histórico placeholders with the real screens from `Vigia Prototype.dc.html`, including a working edit/regenerate/simulate-send flow whose changes are visible from any screen that reads the same communication during the session.

**Architecture:** A small in-memory mutable store lives inside `communicationsService`/`historyService` (module-level arrays, never imported directly by UI) so mutations from one screen are visible from another via `reload()`. Eventos and Comunicações share one interaction shape — search + filter above a list, click a row to open a 460px detail panel beside it, selection driven by the optional `:id` route param rather than duplicate React state — and share one component, `MessageEditorCard`, for the edit/regenerate/simulate-send UI.

**Tech Stack:** Same as the rest of the app — React 19, React Router 7, TypeScript, CSS Modules, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-08-22-eventos-comunicacoes-historico-design.md` — read this for the full rationale; this plan implements it task by task.

## Global Constraints

- Front-end + local mocks only. No real backend, external APIs, auth, or AI.
- Do not reinterpret the prototype's layout or copy. Where this plan's code differs from your instinct, the prototype wins — every string and layout choice below is copied from `Vigia Prototype.dc.html` or the spec, not invented.
- No artificial API-error toggle. Error states come from real service-call failures, exactly like `DashboardPage` already does (`AlertBanner` + retry calling `reload()`).
- Do not replicate the prototype's `regenCount` state — it is declared but never read anywhere in the original logic.
- Any CSS value that exactly equals an existing `--space-N` (4/8/12/16/20/24/28/32px) or `--radius-sm|md|pill` (4/8/20px) token must use `var(--space-N)`/`var(--radius-*)`, not the literal number — this exact defect was found and fixed twice already on this branch's history; check it every time.
- Semantic HTML: `<button>` for actions, `<Link>`/`<NavLink>` for navigation, real `<ul>/<li>` for lists, no `outline: none` anywhere.
- Responsive at 1440/1024/375px, no horizontal overflow, matching the breakpoints already established in `AppShell.module.css`/`Sidebar.module.css`/`DashboardPage.module.css`.
- Toast auto-dismiss is 3000ms, timed by the page that shows it (`setTimeout`), not by the `Toast` component itself.
- Gate: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` must all pass.

---

### Task 1: Data layer — types, mocks, and services (customers, history, communications mutable store)

**Files:**
- Create: `src/types/customer.ts`
- Create: `src/types/history.ts`
- Create: `src/mocks/customers.ts`
- Create: `src/mocks/history.ts`
- Create: `src/mocks/communicationMessages.ts`
- Create: `src/services/customersService.ts`
- Create: `src/services/customersService.test.ts`
- Create: `src/services/historyService.ts`
- Create: `src/services/historyService.test.ts`
- Modify: `src/services/eventsService.ts` — add `getEventById`
- Modify: `src/services/eventsService.test.ts` — test `getEventById`
- Modify: `src/services/communicationsService.ts` — add the mutable store and 5 new functions
- Modify: `src/services/communicationsService.test.ts` — test the new functions and cross-read persistence

**Interfaces:**
- Consumes: `simulateDelay<T>(value: T): Promise<T>` (`services/simulateDelay.ts`), `CommunicationStatus`/`CommunicationChannel` (`types/communication.ts`), `eventsMock` (`mocks/events.ts`).
- Produces: `Customer { nome, apolice, regiao, statusComunicacao: CommunicationStatus }` (`types/customer.ts`); `HistoryEntry { id, eventoTipo, regiao, segurados, canal, status, horario }` (`types/history.ts`); `getCustomersForEvent(eventId: string): Promise<Customer[]>` (`services/customersService.ts`); `getHistory(): Promise<HistoryEntry[]>` and `appendHistoryEntry(entry: HistoryEntry): void` (`services/historyService.ts` — the latter is internal-use, called only from `communicationsService`); `getEventById(id: string): Promise<WeatherEvent | null>` and `getAllEvents(): Promise<WeatherEvent[]>` (`services/eventsService.ts` — note `getAllEvents` returns every event including `"Encerrado"` ones, unlike the existing `getActiveEvents`; the Eventos screen lists all of them, matching the prototype's `EVENTS.filter(...)` which never excludes closed events); `getCommunicationById(id: string): Promise<CommunicationWithEvent | null>`, `getCommunicationText(id: string): Promise<string>`, `updateCommunicationText(id: string, text: string): Promise<void>`, `regenerateCommunicationText(id: string): Promise<void>`, `simulateCommunicationSend(id: string): Promise<void>` (`services/communicationsService.ts`). Tasks 4–6 consume all of these by exact name.

- [ ] **Step 1: Create `src/types/customer.ts`**

```ts
import type { CommunicationStatus } from "./communication";

export interface Customer {
  nome: string;
  apolice: string;
  regiao: string;
  statusComunicacao: CommunicationStatus;
}
```

- [ ] **Step 2: Create `src/mocks/customers.ts`** (ported verbatim from the prototype's `CUSTOMERS_POOL`)

```ts
import type { Customer } from "../types/customer";

export const customersMock: Customer[] = [
  { nome: "Marina Alves", apolice: "RES-88231", regiao: "Porto Alegre, RS", statusComunicacao: "Simulada" },
  { nome: "Carlos Eduardo Souza", apolice: "RES-88450", regiao: "Porto Alegre, RS", statusComunicacao: "Simulada" },
  { nome: "Fernanda Lima", apolice: "RES-77102", regiao: "Canoas, RS", statusComunicacao: "Aguardando revisão" },
  { nome: "João Pedro Martins", apolice: "RES-90112", regiao: "Porto Alegre, RS", statusComunicacao: "Simulada" },
];
```

- [ ] **Step 3: Create `src/services/customersService.ts`**

```ts
import { customersMock } from "../mocks/customers";
import type { Customer } from "../types/customer";
import { simulateDelay } from "./simulateDelay";

/**
 * The prototype reuses the same customer pool for every event — there is no
 * per-event filtering in the source design. `eventId` is kept in the
 * signature so callers read naturally and the API can grow real filtering
 * later without changing call sites.
 */
export async function getCustomersForEvent(_eventId: string): Promise<Customer[]> {
  return simulateDelay(customersMock);
}
```

- [ ] **Step 4: Write the test — `src/services/customersService.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { getCustomersForEvent } from "./customersService";

describe("customersService", () => {
  it("returns the customer pool for any event id", async () => {
    const customers = await getCustomersForEvent("ev1");

    expect(customers).toHaveLength(4);
    expect(customers[0]).toMatchObject({ nome: "Marina Alves", apolice: "RES-88231" });
  });
});
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx vitest run src/services/customersService.test.ts
```

Expected: PASS (1 test, ~350ms).

- [ ] **Step 6: Create `src/types/history.ts`**

```ts
import type { CommunicationChannel, CommunicationStatus } from "./communication";

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

- [ ] **Step 7: Create `src/mocks/history.ts`** (ported verbatim from the prototype's `HISTORY_INIT`)

```ts
import type { HistoryEntry } from "../types/history";

export const historySeed: HistoryEntry[] = [
  { id: "h1", eventoTipo: "Chuva intensa", regiao: "RS · Porto Alegre", segurados: 1248, canal: "SMS", status: "Simulada", horario: "22/08 · 14:11" },
  { id: "h2", eventoTipo: "Granizo", regiao: "SC · Chapecó", segurados: 642, canal: "E-mail", status: "Aguardando revisão", horario: "22/08 · 13:55" },
  { id: "h3", eventoTipo: "Ventos fortes", regiao: "PR · Curitiba", segurados: 210, canal: "SMS", status: "Revisada", horario: "22/08 · 12:40" },
  { id: "h4", eventoTipo: "Chuva intensa", regiao: "SP · Campinas", segurados: 58, canal: "SMS", status: "Erro", horario: "22/08 · 09:20" },
];
```

- [ ] **Step 8: Create `src/services/historyService.ts`**

```ts
import { historySeed } from "../mocks/history";
import type { HistoryEntry } from "../types/history";
import { simulateDelay } from "./simulateDelay";

let historyStore: HistoryEntry[] = [...historySeed];

export async function getHistory(): Promise<HistoryEntry[]> {
  return simulateDelay(historyStore);
}

/** Internal write path — called only by communicationsService.simulateCommunicationSend. */
export function appendHistoryEntry(entry: HistoryEntry): void {
  historyStore = [entry, ...historyStore];
}
```

- [ ] **Step 9: Write the test — `src/services/historyService.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { appendHistoryEntry, getHistory } from "./historyService";

describe("historyService", () => {
  it("returns the seed entries", async () => {
    const history = await getHistory();

    expect(history.length).toBeGreaterThanOrEqual(4);
    expect(history.map((h) => h.id)).toContain("h1");
  });

  it("appendHistoryEntry adds a new entry to the front", async () => {
    const before = await getHistory();

    appendHistoryEntry({
      id: "h-test",
      eventoTipo: "Teste",
      regiao: "Teste",
      segurados: 1,
      canal: "SMS",
      status: "Simulada",
      horario: "agora",
    });

    const after = await getHistory();
    expect(after).toHaveLength(before.length + 1);
    expect(after[0].id).toBe("h-test");
  });
});
```

- [ ] **Step 10: Run the test to verify it passes**

```bash
npx vitest run src/services/historyService.test.ts
```

Expected: PASS (2 tests).

- [ ] **Step 11: Add `getEventById` to `src/services/eventsService.ts`** — append this function to the existing file (keep `listActiveEvents` and `getActiveEvents` as they are):

```ts
export async function getEventById(id: string): Promise<WeatherEvent | null> {
  const event = eventsMock.find((e) => e.id === id) ?? null;
  return simulateDelay(event);
}

export async function getAllEvents(): Promise<WeatherEvent[]> {
  return simulateDelay(eventsMock);
}
```

- [ ] **Step 12: Append the test to `src/services/eventsService.test.ts`** — add inside the existing `describe("eventsService", ...)` block, alongside the existing `getActiveEvents` test:

```ts
it("getEventById returns the matching event", async () => {
  const event = await getEventById("ev2");
  expect(event).toMatchObject({ id: "ev2", tipo: "Granizo" });
});

it("getEventById returns null for an unknown id", async () => {
  const event = await getEventById("does-not-exist");
  expect(event).toBeNull();
});

it("getAllEvents returns every event, including Encerrado ones", async () => {
  const events = await getAllEvents();
  expect(events).toHaveLength(4);
  expect(events.map((e) => e.status)).toContain("Encerrado");
});
```

Update the file's import line to also bring in the new functions:

```ts
import { getActiveEvents, getAllEvents, getEventById } from "./eventsService";
```

- [ ] **Step 13: Run the test to verify it passes**

```bash
npx vitest run src/services/eventsService.test.ts
```

Expected: PASS (4 tests).

- [ ] **Step 14: Create `src/mocks/communicationMessages.ts`** (ported verbatim from the prototype's `MESSAGES`/`REGEN_ALT`)

```ts
export const communicationMessages: Record<string, string> = {
  c1: "Olá! Identificamos previsão de chuva intensa na sua região nas próximas horas. Como medida preventiva, recomendamos verificar pontos de escoamento e proteger itens de valor. Em caso de dano, você pode registrar um sinistro pelo app.",
  c2: "Olá! Detectamos risco de granizo na sua região nas próximas horas. Recomendamos, se possível, guardar seu veículo em local coberto. Em caso de dano, você pode registrar um sinistro pelo app.",
  c3: "Olá! Identificamos ventos fortes em sua região. Recomendamos verificar itens soltos em áreas externas, como móveis e objetos de jardim.",
  c4: "Olá! Houve chuva intensa em sua região nas últimas horas. Caso tenha identificado qualquer dano, você pode registrar um sinistro pelo app.",
};

export const communicationRegenAlternatives: Record<string, string> = {
  c1: "Aviso: chuva intensa prevista para sua região. Verifique calhas e ralos e evite deixar veículos em áreas de alagamento conhecidas. Dúvidas? Fale com a central 24h.",
  c2: "Aviso: granizo pode ocorrer na sua região nas próximas horas. Proteja seu veículo, se possível, em garagem ou local coberto.",
  c3: "Aviso: ventos fortes na sua região. Evite ficar próximo a árvores e estruturas soltas nas próximas horas.",
  c4: "Registramos chuva intensa em sua região. Caso identifique qualquer dano na sua residência, acesse o app para abrir um sinistro.",
};
```

- [ ] **Step 15: Replace `src/services/communicationsService.ts` in full** — this adds the mutable store behind the existing `getAllCommunications` (which keeps its current external behavior/signature):

```ts
import { communicationsMock } from "../mocks/communications";
import { communicationMessages, communicationRegenAlternatives } from "../mocks/communicationMessages";
import { eventsMock } from "../mocks/events";
import type { Communication, CommunicationWithEvent } from "../types/communication";
import type { HistoryEntry } from "../types/history";
import { appendHistoryEntry } from "./historyService";
import { simulateDelay } from "./simulateDelay";

let communicationsStore: Communication[] = communicationsMock.map((c) => ({ ...c }));
const editedTextsStore: Record<string, string> = {};

function withEventoTipo(communication: Communication): CommunicationWithEvent {
  const event = eventsMock.find((e) => e.id === communication.eventId);
  return { ...communication, eventoTipo: event ? event.tipo : "Evento desconhecido" };
}

function listAllCommunications(): CommunicationWithEvent[] {
  return communicationsStore.map(withEventoTipo);
}

export async function getAllCommunications(): Promise<CommunicationWithEvent[]> {
  return simulateDelay(listAllCommunications());
}

export async function getCommunicationById(id: string): Promise<CommunicationWithEvent | null> {
  const communication = communicationsStore.find((c) => c.id === id);
  return simulateDelay(communication ? withEventoTipo(communication) : null);
}

export async function getCommunicationText(id: string): Promise<string> {
  const text = editedTextsStore[id] ?? communicationMessages[id] ?? "";
  return simulateDelay(text);
}

export async function updateCommunicationText(id: string, text: string): Promise<void> {
  editedTextsStore[id] = text;
  return simulateDelay(undefined);
}

export async function regenerateCommunicationText(id: string): Promise<void> {
  const alternative = communicationRegenAlternatives[id];
  if (alternative) {
    editedTextsStore[id] = alternative;
  }
  return simulateDelay(undefined);
}

export async function simulateCommunicationSend(id: string): Promise<void> {
  const communication = communicationsStore.find((c) => c.id === id);
  if (!communication) {
    return simulateDelay(undefined);
  }

  communicationsStore = communicationsStore.map((c) => (c.id === id ? { ...c, status: "Simulada" as const } : c));

  const event = eventsMock.find((e) => e.id === communication.eventId);
  const entry: HistoryEntry = {
    id: `h-${Date.now()}`,
    eventoTipo: event ? event.tipo : "Evento desconhecido",
    regiao: event ? event.regiao : "",
    segurados: communication.segurados,
    canal: communication.canal,
    status: "Simulada",
    horario: "agora",
  };
  appendHistoryEntry(entry);

  return simulateDelay(undefined);
}
```

- [ ] **Step 16: Replace `src/services/communicationsService.test.ts` in full**

```ts
import { describe, expect, it } from "vitest";
import {
  getAllCommunications,
  getCommunicationById,
  getCommunicationText,
  regenerateCommunicationText,
  simulateCommunicationSend,
  updateCommunicationText,
} from "./communicationsService";
import { getHistory } from "./historyService";

describe("communicationsService", () => {
  it("returns every communication enriched with its event's tipo", async () => {
    const communications = await getAllCommunications();

    expect(communications).toHaveLength(4);
    expect(communications[0]).toMatchObject({ id: "c1", eventoTipo: "Chuva intensa" });
    expect(communications[1]).toMatchObject({ id: "c2", eventoTipo: "Granizo" });
  });

  it("getCommunicationById returns null for an unknown id", async () => {
    const result = await getCommunicationById("does-not-exist");
    expect(result).toBeNull();
  });

  it("getCommunicationText returns the original message before any edit", async () => {
    const text = await getCommunicationText("c3");
    expect(text).toBe(
      "Olá! Identificamos ventos fortes em sua região. Recomendamos verificar itens soltos em áreas externas, como móveis e objetos de jardim.",
    );
  });

  it("updateCommunicationText persists an edit that getCommunicationText then returns", async () => {
    await updateCommunicationText("c3", "Texto editado manualmente.");
    const text = await getCommunicationText("c3");
    expect(text).toBe("Texto editado manualmente.");
  });

  it("regenerateCommunicationText replaces the current text with the alternative", async () => {
    await regenerateCommunicationText("c4");
    const text = await getCommunicationText("c4");
    expect(text).toBe(
      "Registramos chuva intensa em sua região. Caso identifique qualquer dano na sua residência, acesse o app para abrir um sinistro.",
    );
  });

  it("simulateCommunicationSend marks the communication Simulada, is visible from every read path, and appends a history entry", async () => {
    const before = await getHistory();

    await simulateCommunicationSend("c2");

    const byId = await getCommunicationById("c2");
    expect(byId?.status).toBe("Simulada");

    const all = await getAllCommunications();
    expect(all.find((c) => c.id === "c2")?.status).toBe("Simulada");

    const after = await getHistory();
    expect(after).toHaveLength(before.length + 1);
    expect(after[0]).toMatchObject({
      eventoTipo: "Granizo",
      regiao: "SC · Chapecó",
      canal: "E-mail",
      status: "Simulada",
      horario: "agora",
    });
  });
});
```

- [ ] **Step 17: Run the test to verify it passes**

```bash
npx vitest run src/services/communicationsService.test.ts
```

Expected: PASS (6 tests).

- [ ] **Step 18: Run the full test suite and typecheck**

```bash
npm run typecheck
npm run test
```

Expected: no type errors; every test in the suite passes.

- [ ] **Step 19: Commit**

```bash
git add src/types/customer.ts src/types/history.ts src/mocks/customers.ts src/mocks/history.ts src/mocks/communicationMessages.ts src/services/customersService.ts src/services/customersService.test.ts src/services/historyService.ts src/services/historyService.test.ts src/services/eventsService.ts src/services/eventsService.test.ts src/services/communicationsService.ts src/services/communicationsService.test.ts
git commit -m "feat: add customers/history data layer and a writable communications store"
```

---

### Task 2: Design-system components — `Modal` and `Toast`

**Files:**
- Create: `src/design-system/Modal.tsx`
- Create: `src/design-system/Modal.module.css`
- Create: `src/design-system/Modal.test.tsx`
- Create: `src/design-system/Toast.tsx`
- Create: `src/design-system/Toast.module.css`
- Create: `src/design-system/Toast.test.tsx`

**Interfaces:**
- Consumes: `tonePalette`, `SemanticTone` (`design-system/tokens.ts`).
- Produces: `Modal({ title, children, cancelLabel, onCancel, confirmLabel, onConfirm })`; `Toast({ tone, message })`. Task 4–5 consume both by exact name to build the simulate-send flow.

- [ ] **Step 1: Write the failing test — `src/design-system/Modal.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders the title, body and both actions, and focuses cancel on mount", () => {
    render(
      <Modal
        title="Confirmar simulação de envio"
        cancelLabel="Cancelar"
        onCancel={vi.fn()}
        confirmLabel="Confirmar simulação"
        onConfirm={vi.fn()}
      >
        <p>1.248 segurados · Chuva intensa · RS · Porto Alegre · SMS</p>
      </Modal>,
    );

    expect(screen.getByRole("dialog", { name: "Confirmar simulação de envio" })).toBeInTheDocument();
    expect(screen.getByText(/1\.248 segurados/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
  });

  it("calls onConfirm when the confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <Modal title="t" cancelLabel="Cancelar" onCancel={vi.fn()} confirmLabel="Confirmar" onConfirm={onConfirm}>
        body
      </Modal>,
    );

    await user.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onCancel when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <Modal title="t" cancelLabel="Cancelar" onCancel={onCancel} confirmLabel="Confirmar" onConfirm={vi.fn()}>
        body
      </Modal>,
    );

    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/design-system/Modal.test.tsx
```

Expected: FAIL with "Cannot find module './Modal'".

- [ ] **Step 3: Create `src/design-system/Modal.tsx`**

```tsx
import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import styles from "./Modal.module.css";

interface ModalProps {
  title: string;
  children: ReactNode;
  cancelLabel: string;
  onCancel: () => void;
  confirmLabel: string;
  onConfirm: () => void;
}

export function Modal({ title, children, cancelLabel, onCancel, confirmLabel, onConfirm }: ModalProps) {
  const titleId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className={styles.overlay}>
      <div className={styles.card} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={styles.header}>
          <p id={titleId} className={styles.title}>
            {title}
          </p>
        </div>
        <div className={styles.body}>{children}</div>
        <div className={styles.footer}>
          <button type="button" ref={cancelButtonRef} className={styles.cancelButton} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={styles.confirmButton} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/design-system/Modal.module.css`**

```css
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 15, 15, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.card {
  width: 380px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-modal);
}

.header {
  padding: var(--space-4) 18px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.body {
  padding: var(--space-4) 18px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.footer {
  padding: 14px 18px;
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancelButton {
  padding: var(--space-2) 14px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-primary-dark);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.confirmButton {
  padding: var(--space-2) 14px;
  border-radius: var(--radius-sm);
  border: none;
  background: var(--color-primary-dark);
  color: var(--color-surface);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx vitest run src/design-system/Modal.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 6: Write the failing test — `src/design-system/Toast.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toast } from "./Toast";

describe("Toast", () => {
  it("renders the message with the tone's inverted colors and no dot", () => {
    render(<Toast tone="success" message="Envio simulado com sucesso" />);

    const toast = screen.getByText("Envio simulado com sucesso");
    expect(toast.style.backgroundColor).toBe("rgb(30, 107, 30)");
    expect(toast.querySelector("span")).toBeNull();
  });
});
```

- [ ] **Step 7: Run it to verify it fails, then create `src/design-system/Toast.tsx`**

```bash
npx vitest run src/design-system/Toast.test.tsx
```

```tsx
import { tonePalette, type SemanticTone } from "./tokens";
import styles from "./Toast.module.css";

interface ToastProps {
  tone: SemanticTone;
  message: string;
}

/**
 * Background/text use the tone's text/bg colors inverted (not bg/text
 * directly) — this is what makes a success toast solid green instead of a
 * pale green tint, per the Design System update (tags/toasts no longer use
 * a dot; toasts take the color of the notification they represent).
 */
export function Toast({ tone, message }: ToastProps) {
  const palette = tonePalette[tone];

  return (
    <div className={styles.toast} style={{ backgroundColor: palette.text, color: palette.bg }} role="status">
      {message}
    </div>
  );
}
```

- [ ] **Step 8: Create `src/design-system/Toast.module.css`**

```css
.toast {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(15, 15, 15, 0.15);
  z-index: 60;
}
```

- [ ] **Step 9: Run the test to verify it passes**

```bash
npx vitest run src/design-system/Toast.test.tsx
```

Expected: PASS (1 test).

- [ ] **Step 10: Run the full test suite, typecheck, and lint**

```bash
npm run typecheck
npm run lint
npm run test
```

Expected: no type errors, no lint issues, every test passes.

- [ ] **Step 11: Commit**

```bash
git add src/design-system/Modal.tsx src/design-system/Modal.module.css src/design-system/Modal.test.tsx src/design-system/Toast.tsx src/design-system/Toast.module.css src/design-system/Toast.test.tsx
git commit -m "feat: add Modal and Toast design-system components"
```

---

### Task 3: `MessageEditorCard` — the shared edit/regenerate/simulate-send widget

**Files:**
- Create: `src/features/communications/components/MessageEditorCard.tsx`
- Create: `src/features/communications/components/MessageEditorCard.module.css`
- Create: `src/features/communications/components/MessageEditorCard.test.tsx`

**Interfaces:**
- Consumes: `StatusPill` (`design-system/StatusPill.tsx`), `communicationStatusTone` (`design-system/statusTone.ts`), `CommunicationWithEvent` (`types/communication.ts`), and (for the hook) `getCommunicationText`, `regenerateCommunicationText`, `simulateCommunicationSend`, `updateCommunicationText` (`services/communicationsService.ts`, Task 1).
- Produces: `MessageEditorCard({ communication, text, isEditing, onToggleEdit, onTextChange, onRegenerate, onRequestSimulate })` (presentational, no state, no service calls); `useMessageEditor(communicationId: string | null, onSimulated: () => void)` returning `{ text, isEditing, isConfirmOpen, toastMessage, onToggleEdit, onTextChange, onRegenerate, onRequestSimulate, onCancelSimulate, onConfirmSimulate }` — this hook owns every piece of state and every service call the edit/regenerate/simulate flow needs. Task 4 (Eventos) and Task 5 (Comunicações) each call this one hook per selected communication and wire its return value into `MessageEditorCard` plus their own `Modal`/`Toast`; neither page re-implements any of this logic.

- [ ] **Step 1: Write the failing test — `src/features/communications/components/MessageEditorCard.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MessageEditorCard } from "./MessageEditorCard";
import type { CommunicationWithEvent } from "../../../types/communication";

const communication: CommunicationWithEvent = {
  id: "c1",
  eventId: "ev1",
  canal: "SMS",
  status: "Simulada",
  segurados: 1248,
  geradoEm: "14:11",
  eventoTipo: "Chuva intensa",
};

describe("MessageEditorCard", () => {
  it("shows the channel, status and message text in read mode", () => {
    render(
      <MessageEditorCard
        communication={communication}
        text="Olá! Identificamos previsão de chuva intensa..."
        isEditing={false}
        onToggleEdit={vi.fn()}
        onTextChange={vi.fn()}
        onRegenerate={vi.fn()}
        onRequestSimulate={vi.fn()}
      />,
    );

    expect(screen.getByText("SMS")).toBeInTheDocument();
    expect(screen.getByText("Simulada")).toBeInTheDocument();
    expect(screen.getByText("Olá! Identificamos previsão de chuva intensa...")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("shows a textarea with the current text in edit mode, and reports changes", async () => {
    const user = userEvent.setup();
    const onTextChange = vi.fn();
    render(
      <MessageEditorCard
        communication={communication}
        text="Texto atual"
        isEditing
        onToggleEdit={vi.fn()}
        onTextChange={onTextChange}
        onRegenerate={vi.fn()}
        onRequestSimulate={vi.fn()}
      />,
    );

    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("Texto atual");

    await user.type(textarea, "!");
    expect(onTextChange).toHaveBeenCalled();
  });

  it("toggles the edit button label between Editar and Concluir edição", () => {
    const { rerender } = render(
      <MessageEditorCard
        communication={communication}
        text="t"
        isEditing={false}
        onToggleEdit={vi.fn()}
        onTextChange={vi.fn()}
        onRegenerate={vi.fn()}
        onRequestSimulate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();

    rerender(
      <MessageEditorCard
        communication={communication}
        text="t"
        isEditing
        onToggleEdit={vi.fn()}
        onTextChange={vi.fn()}
        onRegenerate={vi.fn()}
        onRequestSimulate={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Concluir edição" })).toBeInTheDocument();
  });

  it("calls onRegenerate and onRequestSimulate when their buttons are clicked", async () => {
    const user = userEvent.setup();
    const onRegenerate = vi.fn();
    const onRequestSimulate = vi.fn();
    render(
      <MessageEditorCard
        communication={communication}
        text="t"
        isEditing={false}
        onToggleEdit={vi.fn()}
        onTextChange={vi.fn()}
        onRegenerate={onRegenerate}
        onRequestSimulate={onRequestSimulate}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Regenerar" }));
    expect(onRegenerate).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Simular envio" }));
    expect(onRequestSimulate).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/features/communications/components/MessageEditorCard.test.tsx
```

Expected: FAIL with "Cannot find module './MessageEditorCard'".

- [ ] **Step 3: Create `src/features/communications/components/MessageEditorCard.tsx`**

```tsx
import type { ChangeEvent } from "react";
import { StatusPill } from "../../../design-system/StatusPill";
import { communicationStatusTone } from "../../../design-system/statusTone";
import type { CommunicationWithEvent } from "../../../types/communication";
import styles from "./MessageEditorCard.module.css";

interface MessageEditorCardProps {
  communication: CommunicationWithEvent;
  text: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onTextChange: (text: string) => void;
  onRegenerate: () => void;
  onRequestSimulate: () => void;
}

export function MessageEditorCard({
  communication,
  text,
  isEditing,
  onToggleEdit,
  onTextChange,
  onRegenerate,
  onRequestSimulate,
}: MessageEditorCardProps) {
  function handleTextareaChange(event: ChangeEvent<HTMLTextAreaElement>) {
    onTextChange(event.target.value);
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.canal}>{communication.canal}</span>
        <StatusPill tone={communicationStatusTone(communication.status)} label={communication.status} />
      </div>
      <div className={styles.body}>
        {isEditing ? (
          <textarea className={styles.textarea} value={text} onChange={handleTextareaChange} rows={4} />
        ) : (
          <p className={styles.text}>{text}</p>
        )}
      </div>
      <div className={styles.footer}>
        <button type="button" className={styles.secondaryButton} onClick={onToggleEdit}>
          {isEditing ? "Concluir edição" : "Editar"}
        </button>
        <button type="button" className={styles.secondaryButton} onClick={onRegenerate}>
          Regenerar
        </button>
        <button type="button" className={styles.primaryButton} onClick={onRequestSimulate}>
          Simular envio
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/features/communications/components/MessageEditorCard.module.css`**

```css
.card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.header {
  padding: var(--space-3) 14px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.canal {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.body {
  padding: 14px;
}

.text {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}

.textarea {
  width: 100%;
  padding: var(--space-2) 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 13px;
  font-family: inherit;
  box-sizing: border-box;
  resize: vertical;
}

.footer {
  padding: var(--space-3) 14px;
  border-top: 1px solid var(--color-border-subtle);
  display: flex;
  gap: var(--space-2);
}

.secondaryButton {
  padding: 7px var(--space-3);
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--color-primary-dark);
  background: var(--color-surface);
  color: var(--color-primary-dark);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.primaryButton {
  padding: 7px var(--space-3);
  border-radius: var(--radius-sm);
  border: none;
  background: var(--color-primary-dark);
  color: var(--color-surface);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx vitest run src/features/communications/components/MessageEditorCard.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 6: Write the failing test for the logic hook — `src/features/communications/useMessageEditor.test.ts`**

```ts
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMessageEditor } from "./useMessageEditor";
import * as communicationsService from "../../services/communicationsService";

describe("useMessageEditor", () => {
  it("loads the current text for the given communication id", async () => {
    const { result } = renderHook(() => useMessageEditor("c3", vi.fn()));

    await waitFor(() =>
      expect(result.current.text).toBe(
        "Olá! Identificamos ventos fortes em sua região. Recomendamos verificar itens soltos em áreas externas, como móveis e objetos de jardim.",
      ),
    );
  });

  it("onTextChange updates local text immediately and persists it via the service", async () => {
    const { result } = renderHook(() => useMessageEditor("c3", vi.fn()));
    await waitFor(() => expect(result.current.text).not.toBe(""));

    act(() => {
      result.current.onTextChange("Novo texto");
    });

    expect(result.current.text).toBe("Novo texto");
    await waitFor(async () => expect(await communicationsService.getCommunicationText("c3")).toBe("Novo texto"));
  });

  it("onRegenerate replaces the text with the service's regenerated alternative", async () => {
    const { result } = renderHook(() => useMessageEditor("c4", vi.fn()));
    await waitFor(() => expect(result.current.text).not.toBe(""));

    await act(async () => {
      await result.current.onRegenerate();
    });

    expect(result.current.text).toBe(
      "Registramos chuva intensa em sua região. Caso identifique qualquer dano na sua residência, acesse o app para abrir um sinistro.",
    );
  });

  it("onRequestSimulate opens the confirm state, onCancelSimulate closes it without calling the service", async () => {
    const simulateSpy = vi.spyOn(communicationsService, "simulateCommunicationSend");
    const { result } = renderHook(() => useMessageEditor("c1", vi.fn()));

    act(() => {
      result.current.onRequestSimulate();
    });
    expect(result.current.isConfirmOpen).toBe(true);

    act(() => {
      result.current.onCancelSimulate();
    });
    expect(result.current.isConfirmOpen).toBe(false);
    expect(simulateSpy).not.toHaveBeenCalled();
  });

  it("onConfirmSimulate calls the service, closes the confirm state, shows a toast, and calls onSimulated", async () => {
    const onSimulated = vi.fn();
    const { result } = renderHook(() => useMessageEditor("c1", onSimulated));

    act(() => {
      result.current.onRequestSimulate();
    });

    await act(async () => {
      await result.current.onConfirmSimulate();
    });

    expect(result.current.isConfirmOpen).toBe(false);
    expect(result.current.toastMessage).toBe("Envio simulado com sucesso");
    expect(onSimulated).toHaveBeenCalledOnce();
  });

  it("resets isEditing and isConfirmOpen when the communication id changes", async () => {
    const { result, rerender } = renderHook(({ id }) => useMessageEditor(id, vi.fn()), {
      initialProps: { id: "c1" as string | null },
    });

    act(() => {
      result.current.onToggleEdit();
      result.current.onRequestSimulate();
    });
    expect(result.current.isEditing).toBe(true);
    expect(result.current.isConfirmOpen).toBe(true);

    rerender({ id: "c2" });

    expect(result.current.isEditing).toBe(false);
    expect(result.current.isConfirmOpen).toBe(false);
  });
});
```

- [ ] **Step 7: Run it to verify it fails**

```bash
npx vitest run src/features/communications/useMessageEditor.test.ts
```

Expected: FAIL with "Cannot find module './useMessageEditor'".

- [ ] **Step 8: Create `src/features/communications/useMessageEditor.ts`**

```ts
import { useEffect, useRef, useState } from "react";
import {
  getCommunicationText,
  regenerateCommunicationText,
  simulateCommunicationSend,
  updateCommunicationText,
} from "../../services/communicationsService";

const TOAST_DURATION_MS = 3000;

export function useMessageEditor(communicationId: string | null, onSimulated: () => void) {
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Kept in sync every render (not in an effect) so in-flight async handlers
  // below can tell, after an `await`, whether the selection has since moved
  // on to a different communication and their result should be discarded.
  const currentIdRef = useRef(communicationId);
  currentIdRef.current = communicationId;
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsEditing(false);
    setIsConfirmOpen(false);
    // Clear immediately on every id change (not only to null) — otherwise the
    // previous communication's text stays on screen for the ~350ms it takes
    // the new one to load, which reads as a mismatch against the header
    // (channel/status), which updates immediately from the parent's data.
    setText("");

    if (!communicationId) {
      return;
    }

    let active = true;
    getCommunicationText(communicationId).then((value) => {
      if (active) setText(value);
    });
    return () => {
      active = false;
    };
  }, [communicationId]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  function onTextChange(value: string) {
    setText(value);
    if (communicationId) {
      updateCommunicationText(communicationId, value);
    }
  }

  function onToggleEdit() {
    setIsEditing((prev) => !prev);
  }

  async function onRegenerate() {
    if (!communicationId) return;
    const requestId = communicationId;
    await regenerateCommunicationText(requestId);
    const value = await getCommunicationText(requestId);
    if (currentIdRef.current === requestId) {
      setText(value);
    }
  }

  function onRequestSimulate() {
    setIsConfirmOpen(true);
  }

  function onCancelSimulate() {
    setIsConfirmOpen(false);
  }

  async function onConfirmSimulate() {
    if (!communicationId) return;
    const requestId = communicationId;
    await simulateCommunicationSend(requestId);
    setIsConfirmOpen(false);
    onSimulated();

    if (currentIdRef.current === requestId) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToastMessage("Envio simulado com sucesso");
      toastTimeoutRef.current = setTimeout(() => setToastMessage(null), TOAST_DURATION_MS);
    }
  }

  return {
    text,
    isEditing,
    isConfirmOpen,
    toastMessage,
    onToggleEdit,
    onTextChange,
    onRegenerate,
    onRequestSimulate,
    onCancelSimulate,
    onConfirmSimulate,
  };
}
```

- [ ] **Step 9: Run the test to verify it passes**

```bash
npx vitest run src/features/communications/useMessageEditor.test.ts
```

Expected: PASS (6 tests).

- [ ] **Step 10: Run the full test suite, typecheck, and lint**

```bash
npm run typecheck
npm run lint
npm run test
```

Expected: no type errors, no lint issues, every test passes.

- [ ] **Step 11: Commit**

```bash
git add src/features/communications/components/MessageEditorCard.tsx src/features/communications/components/MessageEditorCard.module.css src/features/communications/components/MessageEditorCard.test.tsx src/features/communications/useMessageEditor.ts src/features/communications/useMessageEditor.test.ts
git commit -m "feat: add shared MessageEditorCard and useMessageEditor for the edit/regenerate/simulate flow"
```

---

### Task 4: Eventos screen

**Files:**
- Create: `src/features/events/useEventsPageData.ts`
- Create: `src/features/events/useEventsPageData.test.ts`
- Create: `src/features/events/components/EventRow.tsx`
- Create: `src/features/events/components/EventRow.module.css`
- Create: `src/features/events/components/EventDetailPanel.tsx`
- Create: `src/features/events/components/EventDetailPanel.module.css`
- Create: `src/features/events/components/EventDetailPanel.test.tsx`
- Modify (full rewrite): `src/pages/EventsPage.tsx`
- Create: `src/pages/listDetailPage.module.css` — shared CSS partial for the filters/list/detail-panel/skeleton/retry/confirm-modal-text classes; Task 5's `CommunicationsPage` imports this exact same file rather than getting its own copy, since that page's layout shell is pixel-identical (only the list/detail content differs, and that content lives in each page's own feature components, not in this shell CSS)
- Create: `src/pages/EventsPage.test.tsx`
- Modify: `src/design-system/index.css` — add the shared `vg-fade` keyframe used by both detail panels
- Modify: `src/app/App.tsx` — `/eventos/:id` renders `EventsPage`, not `EventDetailPage`
- Delete: `src/pages/EventDetailPage.tsx`

**Interfaces:**
- Consumes: `useAsyncData` (`hooks/useAsyncData.ts`); `getAllEvents` (`services/eventsService.ts`, Task 1); `getAllCommunications` (`services/communicationsService.ts`, Task 1); `getCustomersForEvent` (`services/customersService.ts`, Task 1); `StatusPill`, `Panel`, `EmptyState`, `AlertBanner`, `Skeleton`, `Modal`, `Toast` (`design-system/`); `severityTone` (`design-system/statusTone.ts`); `PageHeader` (`components/layout/PageHeader.tsx`); `MessageEditorCard`, `useMessageEditor` (`features/communications/`, Task 3); `WeatherEvent` (`types/event.ts`); `CommunicationWithEvent` (`types/communication.ts`); `Customer` (`types/customer.ts`).
- Produces (in addition to the page itself): `src/pages/listDetailPage.module.css` with exactly these class names — `.filters`, `.search`, `.select`, `.layout`, `.listColumn`, `.list`, `.skeletonGroup`, `.retryButton`, `.confirmIntro`, `.confirmSummary` — Task 5 imports this file by exact relative path (`../pages/listDetailPage.module.css` is wrong; both pages live in the same `src/pages/` directory, so Task 5 uses `./listDetailPage.module.css`, identical to how this task uses it) and must not create its own copy.
- Produces: `EventsPageData { events: WeatherEvent[]; communicationsByEventId: Record<string, CommunicationWithEvent> }` and `useEventsPageData()` returning the standard `useAsyncData` shape over it; `EventRow({ event, isSelected })`; `EventDetailPanel({ event, communication, customers, messageEditor })` where `messageEditor` is exactly what `useMessageEditor` returns. Nothing outside this task consumes these.

**Note on visual fidelity (read before Step 1):** the prototype's own Eventos list row places the severity badge *before* the title, with the segurados count alone on the right (`badge → title/region-status → … → count`). That is the *old* layout — the tag-position correction already applied to `AttentionEventRow` (and written into the published Design System update) established the badge belongs paired with the count on the right for every row that shows a count. `EventRow` follows that already-corrected pattern, not the prototype's original ordering — the two other things about the row (bold title, secondary `{regiao} · {status}` line, border/radius/hover) still come straight from the prototype. This is applying an already-approved correction consistently, not a new reinterpretation.

- [ ] **Step 1: Write the failing test — `src/features/events/useEventsPageData.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { useEventsPageData } from "./useEventsPageData";
import { renderHook, waitFor } from "@testing-library/react";

describe("useEventsPageData", () => {
  it("loads every event and a lookup of each event's communication", async () => {
    const { result } = renderHook(() => useEventsPageData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.events).toHaveLength(4);
    expect(result.current.data?.communicationsByEventId.ev1).toMatchObject({ id: "c1", canal: "SMS" });
    expect(result.current.data?.communicationsByEventId.ev2).toMatchObject({ id: "c2", canal: "E-mail" });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/features/events/useEventsPageData.test.ts
```

Expected: FAIL with "Cannot find module './useEventsPageData'".

- [ ] **Step 3: Create `src/features/events/useEventsPageData.ts`**

```ts
import { useAsyncData } from "../../hooks/useAsyncData";
import { getAllCommunications } from "../../services/communicationsService";
import { getAllEvents } from "../../services/eventsService";
import type { CommunicationWithEvent } from "../../types/communication";
import type { WeatherEvent } from "../../types/event";

export interface EventsPageData {
  events: WeatherEvent[];
  communicationsByEventId: Record<string, CommunicationWithEvent>;
}

async function loadEventsPageData(): Promise<EventsPageData> {
  const [events, communications] = await Promise.all([getAllEvents(), getAllCommunications()]);

  const communicationsByEventId: Record<string, CommunicationWithEvent> = {};
  for (const communication of communications) {
    communicationsByEventId[communication.eventId] = communication;
  }

  return { events, communicationsByEventId };
}

export function useEventsPageData() {
  return useAsyncData(loadEventsPageData, []);
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run src/features/events/useEventsPageData.test.ts
```

Expected: PASS (1 test, ~350ms).

- [ ] **Step 5: Create `src/features/events/components/EventRow.tsx`** (no dedicated test — pure presentational composition of already-tested `StatusPill`; behavior is covered end-to-end by `EventsPage.test.tsx` in Step 21)

```tsx
import { Link } from "react-router-dom";
import { StatusPill } from "../../../design-system/StatusPill";
import { severityTone } from "../../../design-system/statusTone";
import type { WeatherEvent } from "../../../types/event";
import styles from "./EventRow.module.css";

interface EventRowProps {
  event: WeatherEvent;
  isSelected: boolean;
}

export function EventRow({ event, isSelected }: EventRowProps) {
  return (
    <li>
      <Link
        to={isSelected ? "/eventos" : `/eventos/${event.id}`}
        className={isSelected ? `${styles.row} ${styles.rowSelected}` : styles.row}
      >
        <span className={styles.textGroup}>
          <span className={styles.tipo}>{event.tipo}</span>
          <span className={styles.meta}>
            {event.regiao} · {event.status}
          </span>
        </span>
        <span className={styles.statsGroup}>
          <StatusPill tone={severityTone(event.severidade)} label={event.severidade} />
          <span className={styles.count}>{event.segurados.toLocaleString("pt-BR")} segurados</span>
        </span>
      </Link>
    </li>
  );
}
```

- [ ] **Step 6: Create `src/features/events/components/EventRow.module.css`**

```css
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 14px var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
  text-decoration: none;
  color: inherit;
}

.row:hover {
  background: var(--color-surface-muted);
}

li:last-child .row {
  border-bottom: none;
}

.rowSelected {
  background: rgba(42, 238, 239, 0.08);
}

.rowSelected:hover {
  background: rgba(42, 238, 239, 0.12);
}

.textGroup {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tipo {
  font-size: 14px;
  font-weight: 600;
}

.meta {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.statsGroup {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.count {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
```

- [ ] **Step 7: Add the shared `vg-fade` keyframe to `src/design-system/index.css`** — append at the end of the file (both this panel and the Comunicações one in Task 5 use it; defining it once here avoids duplicating the same `@keyframes` block in two CSS modules):

```css
@keyframes vg-fade {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

- [ ] **Step 8: Write the failing test — `src/features/events/components/EventDetailPanel.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EventDetailPanel } from "./EventDetailPanel";
import type { WeatherEvent } from "../../../types/event";
import type { Customer } from "../../../types/customer";
import type { CommunicationWithEvent } from "../../../types/communication";

const event: WeatherEvent = {
  id: "ev1",
  tipo: "Chuva intensa",
  severidade: "Crítico",
  regiao: "RS · Porto Alegre",
  status: "Ativo",
  detectadoEm: "14:02",
  previsao: "6 a 12 horas",
  segurados: 1248,
  regra: "Clientes com seguro residencial em endereços na área de alagamento devem receber comunicação preventiva.",
  tipoSeguro: "seguro residencial",
};

const customers: Customer[] = [
  { nome: "Marina Alves", apolice: "RES-88231", regiao: "Porto Alegre, RS", statusComunicacao: "Simulada" },
];

const communication: CommunicationWithEvent = {
  id: "c1",
  eventId: "ev1",
  canal: "SMS",
  status: "Simulada",
  segurados: 1248,
  geradoEm: "14:11",
  eventoTipo: "Chuva intensa",
};

const messageEditor = {
  text: "Texto atual",
  isEditing: false,
  isConfirmOpen: false,
  toastMessage: null,
  onToggleEdit: vi.fn(),
  onTextChange: vi.fn(),
  onRegenerate: vi.fn(),
  onRequestSimulate: vi.fn(),
  onCancelSimulate: vi.fn(),
  onConfirmSimulate: vi.fn(),
};

describe("EventDetailPanel", () => {
  it("renders the rule, the why-these-customers reasoning, and the customer list", () => {
    render(
      <EventDetailPanel event={event} communication={communication} customers={customers} messageEditor={messageEditor} />,
    );

    expect(screen.getByText("Chuva intensa")).toBeInTheDocument();
    expect(screen.getByText(event.regra)).toBeInTheDocument();
    expect(screen.getByText("+ cliente possui seguro residencial")).toBeInTheDocument();
    expect(screen.getByText("→ 1.248 segurados elegíveis para comunicação")).toBeInTheDocument();
    expect(screen.getByText("Marina Alves")).toBeInTheDocument();
  });

  it("renders the MessageEditorCard when a communication exists", () => {
    render(
      <EventDetailPanel event={event} communication={communication} customers={customers} messageEditor={messageEditor} />,
    );

    expect(screen.getByText("Comunicação preventiva")).toBeInTheDocument();
    expect(screen.getByText("Texto atual")).toBeInTheDocument();
  });

  it("does not render the MessageEditorCard section when there is no communication", () => {
    render(<EventDetailPanel event={event} communication={null} customers={customers} messageEditor={messageEditor} />);

    expect(screen.queryByText("Comunicação preventiva")).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 9: Run it to verify it fails**

```bash
npx vitest run src/features/events/components/EventDetailPanel.test.tsx
```

Expected: FAIL with "Cannot find module './EventDetailPanel'".

- [ ] **Step 10: Create `src/features/events/components/EventDetailPanel.tsx`**

```tsx
import { StatusPill } from "../../../design-system/StatusPill";
import { communicationStatusTone, severityTone } from "../../../design-system/statusTone";
import { MessageEditorCard } from "../../communications/components/MessageEditorCard";
import type { useMessageEditor } from "../../communications/useMessageEditor";
import type { CommunicationWithEvent } from "../../../types/communication";
import type { Customer } from "../../../types/customer";
import type { WeatherEvent } from "../../../types/event";
import styles from "./EventDetailPanel.module.css";

interface EventDetailPanelProps {
  event: WeatherEvent;
  communication: CommunicationWithEvent | null;
  customers: Customer[];
  messageEditor: ReturnType<typeof useMessageEditor>;
}

export function EventDetailPanel({ event, communication, customers, messageEditor }: EventDetailPanelProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p className={styles.title}>{event.tipo}</p>
          <p className={styles.subtitle}>
            {event.regiao} · detectado às {event.detectadoEm} · previsão: {event.previsao}
          </p>
        </div>
        <StatusPill tone={severityTone(event.severidade)} label={event.severidade} />
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Regra aplicada</p>
        <p className={styles.sectionText}>{event.regra}</p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Por que estes segurados?</p>
        <div className={styles.whyList}>
          <p className={styles.whyLine}>
            {event.tipo} detectado em {event.regiao}
          </p>
          <p className={styles.whyLineMuted}>+ cliente possui {event.tipoSeguro}</p>
          <p className={styles.whyLineMuted}>+ endereço associado à área afetada</p>
          <p className={styles.whyLineStrong}>
            → {event.segurados.toLocaleString("pt-BR")} segurados elegíveis para comunicação
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Segurados impactados</p>
        <div className={styles.customerList}>
          {customers.map((customer) => (
            <div key={customer.apolice} className={styles.customerRow}>
              <div>
                <p className={styles.customerName}>{customer.nome}</p>
                <p className={styles.customerMeta}>
                  {customer.apolice} · {customer.regiao}
                </p>
              </div>
              <StatusPill
                tone={communicationStatusTone(customer.statusComunicacao)}
                label={customer.statusComunicacao}
              />
            </div>
          ))}
        </div>
      </div>

      {communication ? (
        <div className={styles.sectionLast}>
          <p className={styles.sectionLabel}>Comunicação preventiva</p>
          <MessageEditorCard
            communication={communication}
            text={messageEditor.text}
            isEditing={messageEditor.isEditing}
            onToggleEdit={messageEditor.onToggleEdit}
            onTextChange={messageEditor.onTextChange}
            onRegenerate={messageEditor.onRegenerate}
            onRequestSimulate={messageEditor.onRequestSimulate}
          />
        </div>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 11: Create `src/features/events/components/EventDetailPanel.module.css`** — the customer-row divider uses a literal `#F5F6F6` in the prototype, one shade lighter than our `--color-border-subtle` (`#EEF0F0`); reusing the existing token here instead of introducing a near-duplicate one is a deliberate, minor simplification, not a fidelity gap:

```css
.panel {
  width: 460px;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  animation: vg-fade 0.15s ease-out;
}

.header {
  padding: var(--space-4) 18px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-2);
}

.title {
  margin: 0 0 2px;
  font-size: 16px;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.section {
  padding: var(--space-4) 18px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.sectionLast {
  padding: var(--space-4) 18px;
}

.sectionLabel {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.sectionText {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}

.whyList {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}

.whyLine {
  margin: 0;
}

.whyLineMuted {
  margin: 0;
  color: var(--color-text-secondary);
}

.whyLineStrong {
  margin: 0;
  font-weight: 600;
}

.customerList {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.customerRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-border-subtle);
}

.customerRow:last-child {
  border-bottom: none;
}

.customerName {
  margin: 0;
  font-weight: 500;
}

.customerMeta {
  margin: 1px 0 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}
```

- [ ] **Step 12: Run the test to verify it passes**

```bash
npx vitest run src/features/events/components/EventDetailPanel.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 13: Write the failing test — `src/pages/EventsPage.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { EventsPage } from "./EventsPage";
import * as eventsService from "../services/eventsService";

function renderEventsPage(initialPath = "/eventos") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/eventos" element={<EventsPage />} />
        <Route path="/eventos/:id" element={<EventsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("EventsPage", () => {
  it("lists every event and shows the detail panel for the id in the URL", async () => {
    renderEventsPage("/eventos/ev1");

    expect(await screen.findByText("Regra aplicada")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Clientes com seguro residencial em endereços na área de alagamento devem receber comunicação preventiva.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Granizo")).toBeInTheDocument();
  });

  it("filters the list by search text", async () => {
    const user = userEvent.setup();
    renderEventsPage();

    await screen.findByText("Ventos fortes");
    await user.type(screen.getByLabelText("Buscar eventos por tipo ou região"), "granizo");

    expect(screen.queryByText("Ventos fortes")).not.toBeInTheDocument();
    expect(screen.getByText("Granizo")).toBeInTheDocument();
  });

  it("filters the list by severity", async () => {
    const user = userEvent.setup();
    renderEventsPage();

    await screen.findByText("Ventos fortes");
    await user.selectOptions(screen.getByLabelText("Filtrar por severidade"), "Crítico");

    expect(screen.getByText("Chuva intensa")).toBeInTheDocument();
    expect(screen.queryByText("Granizo")).not.toBeInTheDocument();
  });

  it("shows an empty state when no event matches the filters", async () => {
    const user = userEvent.setup();
    renderEventsPage();

    await screen.findByText("Ventos fortes");
    await user.type(screen.getByLabelText("Buscar eventos por tipo ou região"), "nada-existe");

    expect(await screen.findByText("Nenhum evento encontrado")).toBeInTheDocument();
  });

  it("shows an error banner with a working retry when loading fails", async () => {
    vi.spyOn(eventsService, "getAllEvents").mockRejectedValueOnce(new Error("network down"));

    renderEventsPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível carregar os eventos");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 14: Run it to verify it fails**

```bash
npx vitest run src/pages/EventsPage.test.tsx
```

Expected: FAIL — `EventsPage` still renders the Task-1-era "Tela em construção" placeholder, so none of the new assertions find their targets.

- [ ] **Step 15: Replace `src/pages/EventsPage.tsx` in full**

```tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { AlertBanner } from "../design-system/AlertBanner";
import { EmptyState } from "../design-system/EmptyState";
import { Modal } from "../design-system/Modal";
import { Panel } from "../design-system/Panel";
import { Skeleton } from "../design-system/Skeleton";
import { Toast } from "../design-system/Toast";
import { useMessageEditor } from "../features/communications/useMessageEditor";
import { EventDetailPanel } from "../features/events/components/EventDetailPanel";
import { EventRow } from "../features/events/components/EventRow";
import { useEventsPageData } from "../features/events/useEventsPageData";
import { useAsyncData } from "../hooks/useAsyncData";
import { getCustomersForEvent } from "../services/customersService";
import type { Customer } from "../types/customer";
import type { Severity } from "../types/event";
import styles from "./listDetailPage.module.css";

const SEVERITY_OPTIONS: { value: Severity | "todas"; label: string }[] = [
  { value: "todas", label: "Todas as severidades" },
  { value: "Crítico", label: "Crítico" },
  { value: "Alto", label: "Alto" },
  { value: "Moderado", label: "Moderado" },
  { value: "Baixo", label: "Baixo" },
];

export function EventsPage() {
  const { id: selectedId } = useParams<{ id?: string }>();
  const { data, loading, error, reload } = useEventsPageData();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "todas">("todas");

  const selectedEvent = data?.events.find((event) => event.id === selectedId) ?? null;
  const selectedCommunication = selectedEvent ? (data?.communicationsByEventId[selectedEvent.id] ?? null) : null;

  const { data: customers } = useAsyncData(
    () => (selectedEvent ? getCustomersForEvent(selectedEvent.id) : Promise.resolve<Customer[]>([])),
    [selectedEvent?.id],
  );

  const messageEditor = useMessageEditor(selectedCommunication?.id ?? null, reload);

  const filteredEvents =
    data?.events.filter((event) => {
      const query = search.trim().toLowerCase();
      const matchesQuery =
        !query || event.tipo.toLowerCase().includes(query) || event.regiao.toLowerCase().includes(query);
      const matchesSeverity = severityFilter === "todas" || event.severidade === severityFilter;
      return matchesQuery && matchesSeverity;
    }) ?? [];

  return (
    <div>
      <PageHeader title="Eventos climáticos" subtitle="Acompanhe os eventos detectados e seu impacto nos segurados" />

      {loading && !data ? (
        <div className={styles.skeletonGroup}>
          <Skeleton height={40} />
          <Skeleton height={120} />
        </div>
      ) : null}

      {error ? (
        <AlertBanner
          title="Não foi possível carregar os eventos"
          description="A API de dados climáticos está indisponível. Verifique a conexão e tente novamente."
          action={
            <button type="button" className={styles.retryButton} onClick={reload}>
              Tentar novamente
            </button>
          }
        />
      ) : null}

      {data ? (
        <>
          <div className={styles.filters}>
            <input
              type="text"
              className={styles.search}
              placeholder="Buscar por tipo ou região"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar eventos por tipo ou região"
            />
            <select
              className={styles.select}
              value={severityFilter}
              onChange={(event) => setSeverityFilter(event.target.value as Severity | "todas")}
              aria-label="Filtrar por severidade"
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.layout}>
            <div className={styles.listColumn}>
              {filteredEvents.length === 0 ? (
                <EmptyState
                  title="Nenhum evento encontrado"
                  description="Ajuste a busca ou o filtro de severidade para ver mais resultados."
                />
              ) : (
                <Panel>
                  <ul className={styles.list}>
                    {filteredEvents.map((event) => (
                      <EventRow key={event.id} event={event} isSelected={event.id === selectedId} />
                    ))}
                  </ul>
                </Panel>
              )}
            </div>

            {selectedEvent ? (
              <EventDetailPanel
                event={selectedEvent}
                communication={selectedCommunication}
                customers={customers ?? []}
                messageEditor={messageEditor}
              />
            ) : null}
          </div>
        </>
      ) : null}

      {messageEditor.isConfirmOpen && selectedCommunication && selectedEvent ? (
        <Modal
          title="Confirmar simulação de envio"
          cancelLabel="Cancelar"
          onCancel={messageEditor.onCancelSimulate}
          confirmLabel="Confirmar simulação"
          onConfirm={messageEditor.onConfirmSimulate}
        >
          <p className={styles.confirmIntro}>Você está prestes a simular o envio para:</p>
          <p className={styles.confirmSummary}>
            {selectedCommunication.segurados.toLocaleString("pt-BR")} segurados · {selectedEvent.tipo} ·{" "}
            {selectedEvent.regiao} · {selectedCommunication.canal}
          </p>
        </Modal>
      ) : null}

      {messageEditor.toastMessage ? <Toast tone="success" message={messageEditor.toastMessage} /> : null}
    </div>
  );
}
```

- [ ] **Step 16: Create `src/pages/listDetailPage.module.css`** — this is a shared partial, not page-specific: Task 5's `CommunicationsPage` imports this exact file too, since its list/filter/detail-panel shell is pixel-identical to this one (only the row/panel content differs, and that lives in each feature's own components). Do not name it `EventsPage.module.css` and do not duplicate these rules into a second file later.

```css
.filters {
  display: flex;
  gap: var(--space-3);
  margin-bottom: 18px;
}

.search {
  flex: 1;
  max-width: 320px;
  padding: 9px var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 14px;
  box-sizing: border-box;
}

.select {
  padding: 9px var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 14px;
  background: var(--color-surface);
}

.layout {
  display: flex;
  gap: var(--space-5);
  align-items: flex-start;
}

.listColumn {
  flex: 1;
  min-width: 0;
}

.list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.skeletonGroup {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-7);
}

.retryButton {
  padding: 6px var(--space-3);
  border-radius: var(--radius-sm);
  border: 1.5px solid currentColor;
  background: transparent;
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.confirmIntro {
  margin: 0 0 10px;
  color: var(--color-text-secondary);
}

.confirmSummary {
  margin: 0;
  color: var(--color-text);
}

@media (max-width: 1024px) {
  .layout {
    flex-direction: column;
  }
}
```

- [ ] **Step 17: Run the test to verify it passes**

```bash
npx vitest run src/pages/EventsPage.test.tsx
```

Expected: PASS (5 tests).

- [ ] **Step 18: Point `/eventos/:id` at `EventsPage` in `src/app/App.tsx`** — remove the `EventDetailPage` import and its route, reuse `EventsPage` for both paths:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { EventsPage } from "../pages/EventsPage";
import { CommunicationsPage } from "../pages/CommunicationsPage";
import { CommunicationDetailPage } from "../pages/CommunicationDetailPage";
import { HistoryPage } from "../pages/HistoryPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/eventos/:id" element={<EventsPage />} />
          <Route path="/comunicacoes" element={<CommunicationsPage />} />
          <Route path="/comunicacoes/:id" element={<CommunicationDetailPage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

(`CommunicationDetailPage` and its route are replaced in Task 5 — leave that import and route exactly as shown here for now, don't touch them in this task.)

- [ ] **Step 19: Delete the now-unused detail page**

```bash
rm src/pages/EventDetailPage.tsx
```

- [ ] **Step 20: Run the full test suite, typecheck, lint, and build**

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Expected: all four pass. `npm run test` should show one fewer test file than before this task started only if `EventDetailPage` had its own test file (it doesn't — check `src/pages/` for stray `EventDetailPage.test.tsx` and delete it too if present).

- [ ] **Step 21: Commit**

```bash
git add -A
git commit -m "feat: implement Eventos screen (list, filters, detail panel, simulate-send flow)"
```

---

### Task 5: Comunicações screen

**Files:**
- Create: `src/features/communications/useCommunicationsPageData.ts`
- Create: `src/features/communications/useCommunicationsPageData.test.ts`
- Create: `src/features/communications/components/CommunicationRow.tsx`
- Create: `src/features/communications/components/CommunicationRow.module.css`
- Create: `src/features/communications/components/CommunicationDetailPanel.tsx`
- Create: `src/features/communications/components/CommunicationDetailPanel.module.css`
- Create: `src/features/communications/components/CommunicationDetailPanel.test.tsx`
- Modify (full rewrite): `src/pages/CommunicationsPage.tsx`
- Create: `src/pages/CommunicationsPage.test.tsx`
- Modify: `src/app/App.tsx` — `/comunicacoes/:id` renders `CommunicationsPage`, not `CommunicationDetailPage`
- Delete: `src/pages/CommunicationDetailPage.tsx`

**Do not create a `CommunicationsPage.module.css` file.** This page's filters/list/detail-panel shell is pixel-identical to `EventsPage`'s, and Task 4 already created the shared partial for it — `CommunicationsPage.tsx` imports `./listDetailPage.module.css`, the same file `EventsPage.tsx` imports. Creating a second copy of those rules is exactly the kind of duplication this plan calls out as a defect elsewhere (see the Global Constraints on repeated literals) — the shell styling has zero page-specific differences, so there is nothing to put in a second file.

**Interfaces:**
- Consumes: everything Task 4 consumed, plus `MessageEditorCard`, `useMessageEditor` (Task 3, already built — this task is the second and last consumer); `getAllEvents` (Task 1, already used by Task 4 too); `src/pages/listDetailPage.module.css` (Task 4 — reused as-is, not recreated).
- Produces: `CommunicationsPageData { communications: CommunicationWithEvent[]; eventsById: Record<string, WeatherEvent> }` and `useCommunicationsPageData()`; `CommunicationRow({ communication, isSelected })`; `CommunicationDetailPanel({ communication, event, messageEditor })`. Nothing outside this task consumes these.

**Note on visual fidelity:** the prototype's Comunicações detail panel actually lays out its message section slightly differently from the Eventos one (label + status pill inline above a plain text block, buttons in a separate footer strip) rather than as one bordered sub-card. The approved spec explicitly calls for reusing `MessageEditorCard` — the *same* bordered sub-card — in both detail panels, which is a deliberate, already-approved unification, not a new reinterpretation. Implement it exactly as `MessageEditorCard` already renders; do not add a second, separately-styled message block to try to match the prototype's Comunicações-specific markup more closely.

- [ ] **Step 1: Write the failing test — `src/features/communications/useCommunicationsPageData.test.ts`**

```ts
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCommunicationsPageData } from "./useCommunicationsPageData";

describe("useCommunicationsPageData", () => {
  it("loads every communication and a lookup of every event by id", async () => {
    const { result } = renderHook(() => useCommunicationsPageData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.communications).toHaveLength(4);
    expect(result.current.data?.eventsById.ev1).toMatchObject({ tipo: "Chuva intensa" });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/features/communications/useCommunicationsPageData.test.ts
```

Expected: FAIL with "Cannot find module './useCommunicationsPageData'".

- [ ] **Step 3: Create `src/features/communications/useCommunicationsPageData.ts`**

```ts
import { useAsyncData } from "../../hooks/useAsyncData";
import { getAllCommunications } from "../../services/communicationsService";
import { getAllEvents } from "../../services/eventsService";
import type { CommunicationWithEvent } from "../../types/communication";
import type { WeatherEvent } from "../../types/event";

export interface CommunicationsPageData {
  communications: CommunicationWithEvent[];
  eventsById: Record<string, WeatherEvent>;
}

async function loadCommunicationsPageData(): Promise<CommunicationsPageData> {
  const [communications, events] = await Promise.all([getAllCommunications(), getAllEvents()]);

  const eventsById: Record<string, WeatherEvent> = {};
  for (const event of events) {
    eventsById[event.id] = event;
  }

  return { communications, eventsById };
}

export function useCommunicationsPageData() {
  return useAsyncData(loadCommunicationsPageData, []);
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run src/features/communications/useCommunicationsPageData.test.ts
```

Expected: PASS (1 test, ~350ms).

- [ ] **Step 5: Create `src/features/communications/components/CommunicationRow.tsx`** (no dedicated test — same rationale as `EventRow` in Task 4; covered end-to-end by `CommunicationsPage.test.tsx`)

```tsx
import { Link } from "react-router-dom";
import { StatusPill } from "../../../design-system/StatusPill";
import { communicationStatusTone } from "../../../design-system/statusTone";
import type { CommunicationWithEvent } from "../../../types/communication";
import styles from "./CommunicationRow.module.css";

interface CommunicationRowProps {
  communication: CommunicationWithEvent;
  isSelected: boolean;
}

export function CommunicationRow({ communication, isSelected }: CommunicationRowProps) {
  return (
    <li>
      <Link
        to={isSelected ? "/comunicacoes" : `/comunicacoes/${communication.id}`}
        className={isSelected ? `${styles.row} ${styles.rowSelected}` : styles.row}
      >
        <span className={styles.textGroup}>
          <span className={styles.tipo}>{communication.eventoTipo}</span>
          <span className={styles.meta}>
            {communication.canal} · {communication.segurados.toLocaleString("pt-BR")} segurados ·{" "}
            {communication.geradoEm}
          </span>
        </span>
        <StatusPill tone={communicationStatusTone(communication.status)} label={communication.status} />
      </Link>
    </li>
  );
}
```

- [ ] **Step 6: Create `src/features/communications/components/CommunicationRow.module.css`**

```css
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 14px var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
  text-decoration: none;
  color: inherit;
}

.row:hover {
  background: var(--color-surface-muted);
}

li:last-child .row {
  border-bottom: none;
}

.rowSelected {
  background: rgba(42, 238, 239, 0.08);
}

.rowSelected:hover {
  background: rgba(42, 238, 239, 0.12);
}

.textGroup {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tipo {
  font-size: 14px;
  font-weight: 600;
}

.meta {
  font-size: 12px;
  color: var(--color-text-secondary);
}
```

- [ ] **Step 7: Write the failing test — `src/features/communications/components/CommunicationDetailPanel.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CommunicationDetailPanel } from "./CommunicationDetailPanel";
import type { CommunicationWithEvent } from "../../../types/communication";
import type { WeatherEvent } from "../../../types/event";

const communication: CommunicationWithEvent = {
  id: "c1",
  eventId: "ev1",
  canal: "SMS",
  status: "Simulada",
  segurados: 1248,
  geradoEm: "14:11",
  eventoTipo: "Chuva intensa",
};

const event: WeatherEvent = {
  id: "ev1",
  tipo: "Chuva intensa",
  severidade: "Crítico",
  regiao: "RS · Porto Alegre",
  status: "Ativo",
  detectadoEm: "14:02",
  previsao: "6 a 12 horas",
  segurados: 1248,
  regra: "Clientes com seguro residencial em endereços na área de alagamento devem receber comunicação preventiva.",
  tipoSeguro: "seguro residencial",
};

const messageEditor = {
  text: "Texto atual",
  isEditing: false,
  isConfirmOpen: false,
  toastMessage: null,
  onToggleEdit: vi.fn(),
  onTextChange: vi.fn(),
  onRegenerate: vi.fn(),
  onRequestSimulate: vi.fn(),
  onCancelSimulate: vi.fn(),
  onConfirmSimulate: vi.fn(),
};

describe("CommunicationDetailPanel", () => {
  it("renders the context sentence built from the event, recipients count, and the message editor", () => {
    render(<CommunicationDetailPanel communication={communication} event={event} messageEditor={messageEditor} />);

    expect(
      screen.getByText(
        "Chuva intensa · Crítico · RS · Porto Alegre — Clientes com seguro residencial em endereços na área de alagamento devem receber comunicação preventiva.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("1.248 segurados")).toBeInTheDocument();
    expect(screen.getByText("Texto atual")).toBeInTheDocument();
  });

  it("falls back to the communication's eventoTipo for context when the event isn't loaded yet", () => {
    render(<CommunicationDetailPanel communication={communication} event={null} messageEditor={messageEditor} />);

    expect(screen.getByText("Chuva intensa")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Run it to verify it fails**

```bash
npx vitest run src/features/communications/components/CommunicationDetailPanel.test.tsx
```

Expected: FAIL with "Cannot find module './CommunicationDetailPanel'".

- [ ] **Step 9: Create `src/features/communications/components/CommunicationDetailPanel.tsx`**

```tsx
import { MessageEditorCard } from "./MessageEditorCard";
import type { useMessageEditor } from "../useMessageEditor";
import type { CommunicationWithEvent } from "../../../types/communication";
import type { WeatherEvent } from "../../../types/event";
import styles from "./CommunicationDetailPanel.module.css";

interface CommunicationDetailPanelProps {
  communication: CommunicationWithEvent;
  event: WeatherEvent | null;
  messageEditor: ReturnType<typeof useMessageEditor>;
}

export function CommunicationDetailPanel({ communication, event, messageEditor }: CommunicationDetailPanelProps) {
  const contexto = event
    ? `${event.tipo} · ${event.severidade} · ${event.regiao} — ${event.regra}`
    : communication.eventoTipo;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <p className={styles.title}>{communication.eventoTipo}</p>
        <p className={styles.subtitle}>
          {event ? `${event.regiao} · ` : ""}
          {communication.canal} · gerada às {communication.geradoEm}
        </p>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Contexto do risco</p>
        <p className={styles.sectionText}>{contexto}</p>
      </div>

      <div className={styles.recipientsRow}>
        <span className={styles.recipientsLabel}>Destinatários</span>
        <span className={styles.recipientsValue}>{communication.segurados.toLocaleString("pt-BR")} segurados</span>
      </div>

      <div className={styles.sectionLast}>
        <MessageEditorCard
          communication={communication}
          text={messageEditor.text}
          isEditing={messageEditor.isEditing}
          onToggleEdit={messageEditor.onToggleEdit}
          onTextChange={messageEditor.onTextChange}
          onRegenerate={messageEditor.onRegenerate}
          onRequestSimulate={messageEditor.onRequestSimulate}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Create `src/features/communications/components/CommunicationDetailPanel.module.css`**

```css
.panel {
  width: 460px;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  animation: vg-fade 0.15s ease-out;
}

.header {
  padding: var(--space-4) 18px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.title {
  margin: 0 0 2px;
  font-size: 16px;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.section {
  padding: var(--space-4) 18px;
  border-bottom: 1px solid var(--color-border-subtle);
}

.sectionLabel {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-tertiary);
}

.sectionText {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.recipientsRow {
  padding: var(--space-4) 18px;
  border-bottom: 1px solid var(--color-border-subtle);
  display: flex;
  justify-content: space-between;
}

.recipientsLabel {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.recipientsValue {
  font-size: 13px;
  font-weight: 600;
}

.sectionLast {
  padding: var(--space-4) 18px;
}
```

- [ ] **Step 11: Run the test to verify it passes**

```bash
npx vitest run src/features/communications/components/CommunicationDetailPanel.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 12: Write the failing test — `src/pages/CommunicationsPage.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { CommunicationsPage } from "./CommunicationsPage";
import * as communicationsService from "../services/communicationsService";

function renderCommunicationsPage(initialPath = "/comunicacoes") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/comunicacoes" element={<CommunicationsPage />} />
        <Route path="/comunicacoes/:id" element={<CommunicationsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("CommunicationsPage", () => {
  it("lists every communication and shows the detail panel for the id in the URL", async () => {
    renderCommunicationsPage("/comunicacoes/c2");

    expect(await screen.findByText("Contexto do risco")).toBeInTheDocument();
    expect(screen.getByText("Destinatários")).toBeInTheDocument();
    expect(screen.getByText("Granizo · Alto · SC · Chapecó — ", { exact: false })).toBeInTheDocument();
  });

  it("filters the list by search text", async () => {
    const user = userEvent.setup();
    renderCommunicationsPage();

    await screen.findByText("Ventos fortes");
    await user.type(screen.getByLabelText("Buscar comunicações por evento ou canal"), "granizo");

    expect(screen.queryByText("Ventos fortes")).not.toBeInTheDocument();
    expect(screen.getByText("Granizo")).toBeInTheDocument();
  });

  it("filters the list by status", async () => {
    const user = userEvent.setup();
    renderCommunicationsPage();

    await screen.findByText("Ventos fortes");
    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "Erro");

    expect(screen.getByText("Chuva intensa")).toBeInTheDocument();
    expect(screen.queryByText("Ventos fortes")).not.toBeInTheDocument();
  });

  it("shows an empty state when no communication matches the filters", async () => {
    const user = userEvent.setup();
    renderCommunicationsPage();

    await screen.findByText("Ventos fortes");
    await user.type(screen.getByLabelText("Buscar comunicações por evento ou canal"), "nada-existe");

    expect(await screen.findByText("Nenhuma comunicação encontrada")).toBeInTheDocument();
  });

  it("shows an error banner with a working retry when loading fails", async () => {
    vi.spyOn(communicationsService, "getAllCommunications").mockRejectedValueOnce(new Error("network down"));

    renderCommunicationsPage();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível carregar as comunicações");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });

  it("simulating a send updates the status pill and is reflected after reload", async () => {
    const user = userEvent.setup();
    renderCommunicationsPage("/comunicacoes/c2");

    await screen.findByText("Contexto do risco");
    await user.click(screen.getByRole("button", { name: "Simular envio" }));

    const dialog = await screen.findByRole("dialog", { name: "Confirmar simulação de envio" });
    expect(dialog).toHaveTextContent("642 segurados");
    expect(dialog).toHaveTextContent("Granizo");

    await user.click(screen.getByRole("button", { name: "Confirmar simulação" }));

    expect(await screen.findByText("Envio simulado com sucesso")).toBeInTheDocument();
  });
});
```

- [ ] **Step 13: Run it to verify it fails**

```bash
npx vitest run src/pages/CommunicationsPage.test.tsx
```

Expected: FAIL — `CommunicationsPage` still renders the Task-1-era "Tela em construção" placeholder.

- [ ] **Step 14: Replace `src/pages/CommunicationsPage.tsx` in full**

```tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import { PageHeader } from "../components/layout/PageHeader";
import { AlertBanner } from "../design-system/AlertBanner";
import { EmptyState } from "../design-system/EmptyState";
import { Modal } from "../design-system/Modal";
import { Panel } from "../design-system/Panel";
import { Skeleton } from "../design-system/Skeleton";
import { Toast } from "../design-system/Toast";
import { CommunicationDetailPanel } from "../features/communications/components/CommunicationDetailPanel";
import { CommunicationRow } from "../features/communications/components/CommunicationRow";
import { useCommunicationsPageData } from "../features/communications/useCommunicationsPageData";
import { useMessageEditor } from "../features/communications/useMessageEditor";
import type { CommunicationStatus } from "../types/communication";
import styles from "./listDetailPage.module.css";

const STATUS_OPTIONS: { value: CommunicationStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os status" },
  { value: "Aguardando revisão", label: "Aguardando revisão" },
  { value: "Revisada", label: "Revisada" },
  { value: "Simulada", label: "Simulada" },
  { value: "Erro", label: "Erro" },
];

export function CommunicationsPage() {
  const { id: selectedId } = useParams<{ id?: string }>();
  const { data, loading, error, reload } = useCommunicationsPageData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CommunicationStatus | "todos">("todos");

  const selectedCommunication = data?.communications.find((c) => c.id === selectedId) ?? null;
  const selectedEvent = selectedCommunication ? (data?.eventsById[selectedCommunication.eventId] ?? null) : null;

  const messageEditor = useMessageEditor(selectedCommunication?.id ?? null, reload);

  const filteredCommunications =
    data?.communications.filter((communication) => {
      const query = search.trim().toLowerCase();
      const matchesQuery =
        !query ||
        communication.eventoTipo.toLowerCase().includes(query) ||
        communication.canal.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "todos" || communication.status === statusFilter;
      return matchesQuery && matchesStatus;
    }) ?? [];

  return (
    <div>
      <PageHeader title="Comunicações" subtitle="Mensagens preventivas geradas pela IA" />

      {loading && !data ? (
        <div className={styles.skeletonGroup}>
          <Skeleton height={40} />
          <Skeleton height={120} />
        </div>
      ) : null}

      {error ? (
        <AlertBanner
          title="Não foi possível carregar as comunicações"
          description="A conexão com o serviço de comunicações foi interrompida. Tente novamente em alguns instantes."
          action={
            <button type="button" className={styles.retryButton} onClick={reload}>
              Tentar novamente
            </button>
          }
        />
      ) : null}

      {data ? (
        <>
          <div className={styles.filters}>
            <input
              type="text"
              className={styles.search}
              placeholder="Buscar por evento ou canal"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Buscar comunicações por evento ou canal"
            />
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as CommunicationStatus | "todos")}
              aria-label="Filtrar por status"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.layout}>
            <div className={styles.listColumn}>
              {filteredCommunications.length === 0 ? (
                <EmptyState
                  title="Nenhuma comunicação encontrada"
                  description="Ajuste a busca ou o filtro de status."
                />
              ) : (
                <Panel>
                  <ul className={styles.list}>
                    {filteredCommunications.map((communication) => (
                      <CommunicationRow
                        key={communication.id}
                        communication={communication}
                        isSelected={communication.id === selectedId}
                      />
                    ))}
                  </ul>
                </Panel>
              )}
            </div>

            {selectedCommunication ? (
              <CommunicationDetailPanel
                communication={selectedCommunication}
                event={selectedEvent}
                messageEditor={messageEditor}
              />
            ) : null}
          </div>
        </>
      ) : null}

      {messageEditor.isConfirmOpen && selectedCommunication ? (
        <Modal
          title="Confirmar simulação de envio"
          cancelLabel="Cancelar"
          onCancel={messageEditor.onCancelSimulate}
          confirmLabel="Confirmar simulação"
          onConfirm={messageEditor.onConfirmSimulate}
        >
          <p className={styles.confirmIntro}>Você está prestes a simular o envio para:</p>
          <p className={styles.confirmSummary}>
            {selectedCommunication.segurados.toLocaleString("pt-BR")} segurados · {selectedCommunication.eventoTipo}{" "}
            · {selectedEvent ? `${selectedEvent.regiao} · ` : ""}
            {selectedCommunication.canal}
          </p>
        </Modal>
      ) : null}

      {messageEditor.toastMessage ? <Toast tone="success" message={messageEditor.toastMessage} /> : null}
    </div>
  );
}
```

- [ ] **Step 15: Run the test to verify it passes** — no new CSS file needed for this step; `CommunicationsPage.tsx` already imports the shared `./listDetailPage.module.css` created in Task 4, Step 16

```bash
npx vitest run src/pages/CommunicationsPage.test.tsx
```

Expected: PASS (6 tests).

- [ ] **Step 16: Point `/comunicacoes/:id` at `CommunicationsPage` in `src/app/App.tsx`** — remove the `CommunicationDetailPage` import and its route:

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { EventsPage } from "../pages/EventsPage";
import { CommunicationsPage } from "../pages/CommunicationsPage";
import { HistoryPage } from "../pages/HistoryPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/eventos/:id" element={<EventsPage />} />
          <Route path="/comunicacoes" element={<CommunicationsPage />} />
          <Route path="/comunicacoes/:id" element={<CommunicationsPage />} />
          <Route path="/historico" element={<HistoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 17: Delete the now-unused detail page**

```bash
rm src/pages/CommunicationDetailPage.tsx
```

Also update `src/app/App.test.tsx` if it references `/comunicacoes/:id` expecting the old placeholder text — check the file; if its assertions only cover `/` and `/eventos`, no change is needed there.

- [ ] **Step 18: Run the full test suite, typecheck, lint, and build**

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Expected: all four pass.

- [ ] **Step 19: Commit**

```bash
git add -A
git commit -m "feat: implement Comunicações screen (list, filters, detail panel, simulate-send flow)"
```

---

### Task 6: Histórico screen

**Files:**
- Create: `src/features/history/useHistoryData.ts`
- Create: `src/features/history/useHistoryData.test.ts`
- Modify (full rewrite): `src/pages/HistoryPage.tsx`
- Create: `src/pages/HistoryPage.module.css`
- Create: `src/pages/HistoryPage.test.tsx`

**Interfaces:**
- Consumes: `useAsyncData` (`hooks/useAsyncData.ts`); `getHistory` (`services/historyService.ts`, Task 1); `StatusPill`, `Panel`, `EmptyState`, `AlertBanner`, `Skeleton` (`design-system/`); `communicationStatusTone` (`design-system/statusTone.ts`); `PageHeader` (`components/layout/PageHeader.tsx`); `HistoryEntry` (`types/history.ts`).
- Produces: `useHistoryData()` returning the standard `useAsyncData` shape over `HistoryEntry[]`. Nothing outside this task consumes it — this is the last task that touches new screens.

- [ ] **Step 1: Write the failing test — `src/features/history/useHistoryData.test.ts`**

```ts
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useHistoryData } from "./useHistoryData";

describe("useHistoryData", () => {
  it("loads the history entries", async () => {
    const { result } = renderHook(() => useHistoryData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data?.length).toBeGreaterThanOrEqual(4);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/features/history/useHistoryData.test.ts
```

Expected: FAIL with "Cannot find module './useHistoryData'".

- [ ] **Step 3: Create `src/features/history/useHistoryData.ts`**

```ts
import { useAsyncData } from "../../hooks/useAsyncData";
import { getHistory } from "../../services/historyService";

export function useHistoryData() {
  return useAsyncData(getHistory, []);
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run src/features/history/useHistoryData.test.ts
```

Expected: PASS (1 test, ~350ms).

- [ ] **Step 5: Write the failing test — `src/pages/HistoryPage.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { HistoryPage } from "./HistoryPage";
import * as historyService from "../services/historyService";

describe("HistoryPage", () => {
  it("renders every history entry as a table row", async () => {
    render(<HistoryPage />);

    expect(await screen.findByText("Granizo")).toBeInTheDocument();
    expect(screen.getByText("Ventos fortes")).toBeInTheDocument();
    expect(screen.getAllByText("Chuva intensa")).toHaveLength(2);
  });

  it("filters by status", async () => {
    const user = userEvent.setup();
    render(<HistoryPage />);

    await screen.findByText("Ventos fortes");
    await user.selectOptions(screen.getByLabelText("Filtrar por status"), "Erro");

    expect(screen.queryByText("Ventos fortes")).not.toBeInTheDocument();
    expect(screen.getAllByText("Chuva intensa")).toHaveLength(1);
  });

  it("shows an empty state when there is nothing to display", async () => {
    vi.spyOn(historyService, "getHistory").mockResolvedValueOnce([]);

    render(<HistoryPage />);

    expect(await screen.findByText("Nenhum registro encontrado")).toBeInTheDocument();
  });

  it("shows an error banner with a working retry when loading fails", async () => {
    vi.spyOn(historyService, "getHistory").mockRejectedValueOnce(new Error("network down"));

    render(<HistoryPage />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Não foi possível carregar o histórico");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run it to verify it fails**

```bash
npx vitest run src/pages/HistoryPage.test.tsx
```

Expected: FAIL — `HistoryPage` still renders the Task-1-era "Tela em construção" placeholder.

- [ ] **Step 7: Replace `src/pages/HistoryPage.tsx` in full**

```tsx
import { useState } from "react";
import { PageHeader } from "../components/layout/PageHeader";
import { AlertBanner } from "../design-system/AlertBanner";
import { EmptyState } from "../design-system/EmptyState";
import { Panel } from "../design-system/Panel";
import { Skeleton } from "../design-system/Skeleton";
import { StatusPill } from "../design-system/StatusPill";
import { communicationStatusTone } from "../design-system/statusTone";
import { useHistoryData } from "../features/history/useHistoryData";
import type { CommunicationStatus } from "../types/communication";
import styles from "./HistoryPage.module.css";

const STATUS_OPTIONS: { value: CommunicationStatus | "todos"; label: string }[] = [
  { value: "todos", label: "Todos os status" },
  { value: "Aguardando revisão", label: "Aguardando revisão" },
  { value: "Revisada", label: "Revisada" },
  { value: "Simulada", label: "Simulada" },
  { value: "Erro", label: "Erro" },
];

export function HistoryPage() {
  const { data, loading, error, reload } = useHistoryData();
  const [statusFilter, setStatusFilter] = useState<CommunicationStatus | "todos">("todos");

  const filteredHistory = data?.filter((entry) => statusFilter === "todos" || entry.status === statusFilter) ?? [];

  return (
    <div>
      <PageHeader title="Histórico" subtitle="Registro de eventos, comunicações e simulações de envio" />

      {loading && !data ? (
        <div className={styles.skeletonGroup}>
          <Skeleton height={40} />
          <Skeleton height={160} />
        </div>
      ) : null}

      {error ? (
        <AlertBanner
          title="Não foi possível carregar o histórico"
          description="Tente novamente em alguns instantes."
          action={
            <button type="button" className={styles.retryButton} onClick={reload}>
              Tentar novamente
            </button>
          }
        />
      ) : null}

      {data ? (
        <>
          <div className={styles.filters}>
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as CommunicationStatus | "todos")}
              aria-label="Filtrar por status"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {filteredHistory.length === 0 ? (
            <EmptyState
              title="Nenhum registro encontrado"
              description="Ajuste o filtro de status para ver mais resultados."
            />
          ) : (
            <Panel>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Evento</th>
                      <th className={styles.th}>Região</th>
                      <th className={styles.th}>Segurados</th>
                      <th className={styles.th}>Comunicação</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Horário</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((entry) => (
                      <tr key={entry.id}>
                        <td className={styles.td}>{entry.eventoTipo}</td>
                        <td className={styles.td}>{entry.regiao}</td>
                        <td className={styles.td}>{entry.segurados.toLocaleString("pt-BR")}</td>
                        <td className={styles.td}>{entry.canal}</td>
                        <td className={styles.td}>
                          <StatusPill tone={communicationStatusTone(entry.status)} label={entry.status} />
                        </td>
                        <td className={styles.td}>{entry.horario}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 8: Create `src/pages/HistoryPage.module.css`**

```css
.filters {
  margin-bottom: 18px;
}

.select {
  padding: 9px var(--space-3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: 14px;
  background: var(--color-surface);
}

.tableScroll {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.th {
  text-align: left;
  padding: 10px 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface-muted);
  white-space: nowrap;
}

.td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--color-border-subtle);
  white-space: nowrap;
}

tr:last-child .td {
  border-bottom: none;
}

.skeletonGroup {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-7);
}

.retryButton {
  padding: 6px var(--space-3);
  border-radius: var(--radius-sm);
  border: 1.5px solid currentColor;
  background: transparent;
  color: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
```

- [ ] **Step 9: Run the test to verify it passes**

```bash
npx vitest run src/pages/HistoryPage.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 10: Run the full test suite, typecheck, lint, and build**

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Expected: all four pass.

- [ ] **Step 11: Commit**

```bash
git add src/features/history/useHistoryData.ts src/features/history/useHistoryData.test.ts src/pages/HistoryPage.tsx src/pages/HistoryPage.module.css src/pages/HistoryPage.test.tsx
git commit -m "feat: implement Histórico screen (status filter + table)"
```

---

### Task 7: Final verification (Gauntlet)

**Files:** none created; this task checks cross-cutting integration points and runs the full quality gate. It may produce a small fix commit if Step 1 or Step 2 finds something.

- [ ] **Step 1: Check `src/app/App.test.tsx` for stale assertions** — read the file. It was written against the Task-1-era placeholders and only exercises `/` and `/eventos` (per the original App Shell plan). Confirm it doesn't assert placeholder text like "Tela em construção" for `/eventos` (it shouldn't, since that assertion was never added for routes beyond the nav-link check) — if it does, update the assertion to match the real `EventsPage` output (e.g. assert `screen.getByLabelText("Buscar eventos por tipo ou região")` is present after navigating there) instead of removing the test.

- [ ] **Step 2: Verify the Dashboard's link into Eventos still resolves correctly** — read `src/features/dashboard/components/AttentionEventRow.tsx`; it already links to `` `/eventos/${event.id}` `` (built in the App Shell + Dashboard cycle, unchanged by this plan). Confirm this by running the Dashboard's own test suite, which exercises that link:

```bash
npx vitest run src/pages/DashboardPage.test.tsx src/features/dashboard/components
```

Expected: PASS, no changes needed — this step is a verification, not expected to require an edit. If it fails, the failure is almost certainly in `EventsPage` not handling an `ev1`/`ev2`/`ev3` id correctly (the three non-`Encerrado` events the Dashboard can link to) — fix `EventsPage`, not the Dashboard.

- [ ] **Step 3: Run the full quality gate**

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected: all four exit 0. If any fails, fix the underlying issue in the relevant task's files (not by weakening a check) and re-run this step before continuing.

- [ ] **Step 4: Manual responsive check** — run `npm run dev`, open the app, and check Eventos, Comunicações, and Histórico at 1440px, 1024px, and 375px. Confirm: no horizontal overflow at any width (the Histórico table scrolls inside its own `.tableScroll` container, per Task 6, rather than widening the page); on Eventos/Comunicações, the `.layout` flex row (list + detail panel) switches to `flex-direction: column` at ≤1024px per each page's own media query, so the 460px-wide detail panel doesn't force horizontal scroll on tablet/mobile widths.

- [ ] **Step 5: Manual keyboard check** — with the dev server running, open `/eventos/ev1` directly (or click into an event from the list) and confirm: Tab reaches the search input, the severity select, each event row (real `<Link>`s), and — once a communication's card is visible — the Editar/Regenerar/Simular envio buttons; pressing Enter on "Simular envio" opens the confirm `Modal` with focus already on "Cancelar" (per Task 2's `Modal` implementation); Escape closes it. Confirm the browser's default focus outline is visible at every stop (no `outline: none` was added anywhere in this plan).

- [ ] **Step 6: Commit if Steps 1–3 required fixes**

```bash
git add -A
git commit -m "fix: address gauntlet findings from final verification"
```

(Skip this commit if Steps 1–3 passed clean on the first run.)
