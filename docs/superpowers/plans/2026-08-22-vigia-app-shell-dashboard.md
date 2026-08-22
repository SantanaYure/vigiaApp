# Vigia — App Shell + Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Vigia front-end on TypeScript, reproducing the imported design (`Vigia Prototype.dc.html`, Claude Design project `68394959-2fed-4fc5-82eb-cff5f37ae36d`) with high fidelity, and ship only the App Shell (sidebar navigation, routing, page header) and the Dashboard screen this cycle.

**Architecture:** `src/` is reorganized by responsibility — `app/` (router), `pages/` (route-level composition), `features/dashboard/` (dashboard business logic + presentational rows), `design-system/` (tokens + reusable primitives: StatusPill, Panel, StatCard, EmptyState, AlertBanner, Skeleton), `components/layout/` (Sidebar, AppShell, PageHeader — app chrome, not design-system primitives), `mocks/` (typed static data), `services/` (async functions that currently read mocks, swappable for real APIs later), `hooks/`, `types/`, `utils/`. UI never imports mocks directly — it goes through services.

**Tech Stack:** React 19, React Router 7, Vite, TypeScript (added this cycle), CSS Modules, Vitest + React Testing Library (added this cycle), lucide-react (already installed, not required for this cycle's screens), oxlint.

## Global Constraints

- Front-end only. No backend, database, external APIs, real auth, AI, weather integration, notifications, or deploy. All data comes from typed local mocks behind a service layer (`UI → Service → Mock`).
- Do not implement Eventos, Comunicações, or Histórico screens this cycle — they get placeholder routes/pages only, wired to real navigation.
- Visual source of truth is `Vigia Prototype.dc.html` (already read in full below); the palette given in the brief (`Primary #2AEEEF`, `Primary Dark #004A75`, `Background #F2F2F2`, `Text #0F0F0F`, `Danger #FF8A8A`, `Warning #FDFF8A`, `Success #91FF8A`, `Info #91FFFF`) is the base-token layer; the design file's derived pill/badge tints (bg/text/dot per state) are reused verbatim as documented in Task 2.
- Confirmed scope decisions (already approved by the user): replace the old IA/pages entirely (Segurados, Eventos e Regras, Notificações are deleted, not kept in parallel); migrate the whole repo to TypeScript now; add Vitest + Testing Library and a `test` script now.
- Centralize colors/typography/spacing/radius/breakpoints/states in `design-system/` — no arbitrary one-off hex values in components; reuse the tone palette from Task 2 everywhere a severity/status color is needed.
- Semantic HTML: `<button>` for actions, `<a>`/`<Link>` for navigation, real `<ul>/<li>` for lists, labelled form controls, visible focus (browser default outline is not overridden — do not add `outline: none` anywhere in this plan).
- Validate responsive behavior at 1440px, 1024px, 375px — the Sidebar and KPI grid both have breakpoint rules baked into their CSS Modules (Tasks 4 and 5); no horizontal overflow.
- Gate before calling any task done: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` must all pass (final verification is Task 6, but each task should not knowingly break these).

---

## Reference: current repo state (read during Inspect phase)

- `package.json`: React 19.2.8, react-router-dom 7.18.2, lucide-react, recharts, vite 8.2.0, oxlint. No TypeScript, no test runner.
- `src/` currently holds a JS/JSX app with a different IA (`/`, `/segurados`, `/eventos-regras`, `/notificacoes`) and a different navy/cyan token set (`src/styles/variables.css`) that does not match the imported design. All of it is deleted in Task 1 per the approved decision.
- `index.html` loads `/src/main.jsx`; no font links.
- No `tsconfig.json`, no `vite.config.ts`, no `vitest` config.

## Reference: imported design data (source of truth for Task 3 mocks)

From `Vigia Prototype.dc.html`'s `Component` class:

```
EVENTS = [
  {id:'ev1', tipo:'Chuva intensa', severidade:'Crítico', regiao:'RS · Porto Alegre', status:'Ativo', detectadoEm:'14:02', previsao:'6 a 12 horas', segurados:1248, regra:'Clientes com seguro residencial em endereços na área de alagamento devem receber comunicação preventiva.', tipoSeguro:'seguro residencial'},
  {id:'ev2', tipo:'Granizo', severidade:'Alto', regiao:'SC · Chapecó', status:'Ativo', detectadoEm:'13:40', previsao:'2 a 4 horas', segurados:642, regra:'Clientes com seguro automóvel com veículo associado à região afetada devem receber comunicação preventiva.', tipoSeguro:'seguro automóvel'},
  {id:'ev3', tipo:'Ventos fortes', severidade:'Moderado', regiao:'PR · Curitiba', status:'Monitorando', detectadoEm:'12:15', previsao:'Já em andamento', segurados:210, regra:'Clientes com seguro residencial e histórico de sinistro por vendaval na região são elegíveis.', tipoSeguro:'seguro residencial'},
  {id:'ev4', tipo:'Chuva intensa', severidade:'Baixo', regiao:'SP · Campinas', status:'Encerrado', detectadoEm:'09:00', previsao:'Encerrado às 11:30', segurados:58, regra:'Clientes com seguro residencial na área monitorada.', tipoSeguro:'seguro residencial'}
]

COMMS_INIT = [
  {id:'c1', eventId:'ev1', canal:'SMS', status:'Simulada', segurados:1248, geradoEm:'14:11'},
  {id:'c2', eventId:'ev2', canal:'E-mail', status:'Aguardando revisão', segurados:642, geradoEm:'13:55'},
  {id:'c3', eventId:'ev3', canal:'SMS', status:'Revisada', segurados:210, geradoEm:'12:40'},
  {id:'c4', eventId:'ev4', canal:'SMS', status:'Erro', segurados:58, geradoEm:'09:20'}
]

SEV_STYLE = {
  'Crítico': {bg:'#FFF0F0', color:'#8A2E2E', dot:'#C64545'},
  'Alto': {bg:'#FFFEEA', color:'#6B6B14', dot:'#9B9B1E'},
  'Moderado': {bg:'#F0FFF0', color:'#1E6B1E', dot:'#2E8A2E'},
  'Baixo': {bg:'#F0FFF0', color:'#1E6B1E', dot:'#2E8A2E'}
}
STATUS_STYLE = {
  'Simulada': {bg:'#F0FFF0', color:'#1E6B1E', dot:'#2E8A2E'},
  'Enviada': {bg:'#F0FFF0', color:'#1E6B1E', dot:'#2E8A2E'},
  'Revisada': {bg:'#F0F2FF', color:'#2B3C7D', dot:'#3B4E9C'},
  'Aguardando revisão': {bg:'#F7F8F8', color:'#4A5560', dot:'#8B9297'},
  'Preparada': {bg:'#F7F8F8', color:'#4A5560', dot:'#8B9297'},
  'Erro': {bg:'#FFF0F0', color:'#8A2E2E', dot:'#C64545'}
}

titles.dashboard = ['Dashboard', 'O que está acontecendo agora e exige sua atenção']
titles.eventos = ['Eventos climáticos', 'Acompanhe os eventos detectados e seu impacto nos segurados']
titles.comunicacoes = ['Comunicações', 'Mensagens preventivas geradas pela IA']
titles.historico = ['Histórico', 'Registro de eventos, comunicações e simulações de envio']
```

Dashboard KPIs (from `renderVals()`):
- `kpiEventosAtivos` = count of events where `status !== 'Encerrado'` → 3
- `kpiSegurados` = sum of `segurados` over the same set → 2100
- `kpiComunicacoes` = total count of `comms` (all of them, not sliced) → 4
- `kpiSimuladas` = count of `comms` where `status === 'Simulada'` → 1
- "Eventos que exigem atenção" = first 3 non-`Encerrado` events
- "Comunicações recentes" = first 3 comms (of the full list), each showing the linked event's `tipo`

apiError banner copy: title "Falha ao atualizar dados climáticos", body "A conexão com a API meteorológica foi interrompida. Os dados exibidos podem estar desatualizados. Tente novamente em alguns instantes."

Design deviation, intentional: in the prototype, the apiError banner is purely decorative (content below it is unaffected). In this real implementation, the banner is driven by an actual failed data fetch (`useAsyncData`'s `error` state), which is more correct for a real app and still satisfies the "error state with feedback" requirement.

---

### Task 1: TypeScript + Vitest toolchain, cleanup, App Shell skeleton with routing

**Files:**
- Modify: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Delete: `vite.config.js`
- Create: `src/setupTests.ts`
- Modify: `index.html`
- Delete: `src/App.jsx`, `src/main.jsx`
- Delete (entire directories): `src/components/`, `src/pages/`, `src/hooks/`, `src/mocks/`, `src/services/`, `src/styles/`, `src/utils/`
- Create: `src/design-system/tokens.css`
- Create: `src/design-system/index.css`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/app/App.test.tsx`
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/layout/AppShell.module.css`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Sidebar.module.css`
- Create: `src/pages/EventsPage.tsx`
- Create: `src/pages/EventDetailPage.tsx`
- Create: `src/pages/CommunicationsPage.tsx`
- Create: `src/pages/CommunicationDetailPage.tsx`
- Create: `src/pages/HistoryPage.tsx`

**Interfaces:**
- Produces: `AppShell` component (default export style not used anywhere in this plan — every component is a named export). Route paths: `/`, `/eventos`, `/eventos/:id`, `/comunicacoes`, `/comunicacoes/:id`, `/historico`.
- `PageHeader` (built in Task 4) is referenced by the placeholder pages created here — so this task creates minimal placeholder pages WITHOUT `PageHeader` (it doesn't exist yet), just an `<h1>`, and Task 4 upgrades them to use `PageHeader` once it exists. This avoids a forward dependency.

- [ ] **Step 1: Delete the legacy JS app**

```bash
rm -f src/App.jsx src/main.jsx vite.config.js
rm -rf src/components src/pages src/hooks src/mocks src/services src/styles src/utils
```

- [ ] **Step 2: Update `package.json`** — add TypeScript + Vitest tooling and scripts. Replace the file with:

```json
{
  "name": "vigiaapp",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "oxlint",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "lucide-react": "^1.33.0",
    "react": "^19.2.8",
    "react-dom": "^19.2.8",
    "react-router-dom": "^7.18.2",
    "recharts": "^3.10.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "jsdom": "^25.0.1",
    "oxlint": "^1.75.0",
    "typescript": "^5.7.2",
    "vite": "^8.2.0",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"]
}
```

- [ ] **Step 4: Create `vite.config.ts`**

```ts
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    globals: true,
  },
});
```

- [ ] **Step 5: Create `src/setupTests.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Update `index.html`** — swap the entry to `.tsx` and add the design's Google Fonts (IBM Plex Sans/Mono):

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <title>Vigia | Grupo VIL</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create `src/design-system/tokens.css`**

```css
:root {
  --color-primary: #2aeeef;
  --color-primary-dark: #004a75;
  --color-background: #f2f2f2;
  --color-surface: #ffffff;
  --color-text: #0f0f0f;
  --color-text-secondary: #4a5560;
  --color-text-tertiary: #8b9297;
  --color-border: #d8dbdd;
  --color-border-subtle: #eef0f0;
  --color-surface-muted: #f7f8f8;
  --color-skeleton: #e3e5e6;

  --font-sans: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-pill: 20px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;

  --sidebar-width: 220px;

  --shadow-modal: 0 8px 24px rgba(15, 15, 15, 0.2);
}
```

- [ ] **Step 8: Create `src/design-system/index.css`** (global reset + base typography, imported once from `main.tsx`)

```css
@import "./tokens.css";

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-background);
  color: var(--color-text);
  -webkit-font-smoothing: antialiased;
}

#root {
  min-height: 100vh;
}

h1,
h2,
h3,
h4,
p {
  margin: 0;
}

button,
input,
select,
textarea {
  font-family: inherit;
}

a {
  color: var(--color-primary-dark);
  text-decoration: none;
}

a:hover {
  color: var(--color-primary);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 8px;
}
```

- [ ] **Step 9: Create `src/components/layout/Sidebar.tsx`**

```tsx
import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/eventos", label: "Eventos", end: false },
  { to: "/comunicacoes", label: "Comunicações", end: false },
  { to: "/historico", label: "Histórico", end: false },
] as const;

export function Sidebar() {
  return (
    <nav className={styles.sidebar} aria-label="Navegação principal">
      <div className={styles.brand}>
        <span className={styles.brandDot} aria-hidden="true" />
        <span className={styles.brandName}>Vigia</span>
      </div>
      <ul className={styles.navList}>
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 10: Create `src/components/layout/Sidebar.module.css`**

```css
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: 20px 12px;
  position: sticky;
  top: 0;
  height: 100vh;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 20px;
}

.brandDot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(42, 238, 239, 0.25);
}

.brandName {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary-dark);
}

.navList {
  list-style: none;
  margin: 0;
  padding: 0;
}

.navLink {
  display: block;
  padding: 9px 12px;
  margin-bottom: 2px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
}

.navLink:hover {
  background: var(--color-surface-muted);
}

.navLinkActive {
  background: rgba(0, 74, 117, 0.08);
  color: var(--color-primary-dark);
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: static;
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .navList {
    display: flex;
    gap: 4px;
    overflow-x: auto;
  }

  .navLink {
    white-space: nowrap;
  }
}
```

- [ ] **Step 11: Create `src/components/layout/AppShell.tsx`**

```tsx
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import styles from "./AppShell.module.css";

export function AppShell() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 12: Create `src/components/layout/AppShell.module.css`**

```css
.shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-background);
}

.content {
  flex: 1;
  min-width: 0;
  padding: 32px 40px 80px;
  max-width: 1200px;
}

@media (max-width: 1024px) {
  .content {
    padding: 24px 24px 64px;
  }
}

@media (max-width: 768px) {
  .shell {
    flex-direction: column;
  }
}
```

- [ ] **Step 13: Create placeholder pages** — these stand in for screens out of scope this cycle. Each is a plain heading for now (Task 4 swaps the `<h1>`/`<p>` pair for the shared `PageHeader` once it exists).

`src/pages/EventsPage.tsx`:

```tsx
export function EventsPage() {
  return (
    <div>
      <h1>Eventos climáticos</h1>
      <p>Acompanhe os eventos detectados e seu impacto nos segurados</p>
      <p>Tela em construção — será implementada em um próximo ciclo.</p>
    </div>
  );
}
```

`src/pages/EventDetailPage.tsx`:

```tsx
export function EventDetailPage() {
  return (
    <div>
      <h1>Detalhe do evento</h1>
      <p>Informações completas sobre o evento selecionado</p>
      <p>Tela em construção — será implementada em um próximo ciclo.</p>
    </div>
  );
}
```

`src/pages/CommunicationsPage.tsx`:

```tsx
export function CommunicationsPage() {
  return (
    <div>
      <h1>Comunicações</h1>
      <p>Mensagens preventivas geradas pela IA</p>
      <p>Tela em construção — será implementada em um próximo ciclo.</p>
    </div>
  );
}
```

`src/pages/CommunicationDetailPage.tsx`:

```tsx
export function CommunicationDetailPage() {
  return (
    <div>
      <h1>Detalhe da comunicação</h1>
      <p>Conteúdo e status da comunicação selecionada</p>
      <p>Tela em construção — será implementada em um próximo ciclo.</p>
    </div>
  );
}
```

`src/pages/HistoryPage.tsx`:

```tsx
export function HistoryPage() {
  return (
    <div>
      <h1>Histórico</h1>
      <p>Registro de eventos, comunicações e simulações de envio</p>
      <p>Tela em construção — será implementada em um próximo ciclo.</p>
    </div>
  );
}
```

- [ ] **Step 14: Create a temporary `src/pages/DashboardPage.tsx` stub** (Task 5 replaces this file entirely with the real dashboard):

```tsx
export function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>O que está acontecendo agora e exige sua atenção</p>
    </div>
  );
}
```

- [ ] **Step 15: Create `src/app/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { DashboardPage } from "../pages/DashboardPage";
import { EventsPage } from "../pages/EventsPage";
import { EventDetailPage } from "../pages/EventDetailPage";
import { CommunicationsPage } from "../pages/CommunicationsPage";
import { CommunicationDetailPage } from "../pages/CommunicationDetailPage";
import { HistoryPage } from "../pages/HistoryPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/eventos" element={<EventsPage />} />
          <Route path="/eventos/:id" element={<EventDetailPage />} />
          <Route path="/comunicacoes" element={<CommunicationsPage />} />
          <Route path="/comunicacoes/:id" element={<CommunicationDetailPage />} />
          <Route path="/historico" element={<HistoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

- [ ] **Step 16: Create `src/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import "./design-system/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 17: Write the App Shell navigation test — `src/app/App.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App shell navigation", () => {
  it("renders all nav links and the Dashboard by default", async () => {
    render(<App />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Eventos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comunicações" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Histórico" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("navigates to the Eventos placeholder when its nav link is clicked", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "Eventos" }));

    expect(await screen.findByRole("heading", { name: "Eventos climáticos" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 18: Install dependencies and run the checks**

```bash
npm install
npm run typecheck
npm run test
```

Expected: `typecheck` reports no errors; `test` runs `App.test.tsx` and both tests pass.

- [ ] **Step 19: Commit**

```bash
git add -A
git commit -m "feat: bootstrap TypeScript/Vitest toolchain and App Shell routing"
```

---

### Task 2: Design tokens and design-system primitives

**Files:**
- Create: `src/design-system/tokens.ts`
- Create: `src/design-system/tokens.test.ts`
- Create: `src/design-system/StatusPill.tsx`
- Create: `src/design-system/StatusPill.module.css`
- Create: `src/design-system/StatusPill.test.tsx`
- Create: `src/design-system/Panel.tsx`
- Create: `src/design-system/Panel.module.css`
- Create: `src/design-system/StatCard.tsx`
- Create: `src/design-system/StatCard.module.css`
- Create: `src/design-system/StatCard.test.tsx`
- Create: `src/design-system/EmptyState.tsx`
- Create: `src/design-system/EmptyState.module.css`
- Create: `src/design-system/EmptyState.test.tsx`
- Create: `src/design-system/AlertBanner.tsx`
- Create: `src/design-system/AlertBanner.module.css`
- Create: `src/design-system/AlertBanner.test.tsx`
- Create: `src/design-system/Skeleton.tsx`
- Create: `src/design-system/Skeleton.module.css`

**Interfaces:**
- Consumes: nothing from Task 1 beyond the CSS variables already defined in `tokens.css`.
- Produces: `colors`, `tonePalette`, `SemanticTone` from `tokens.ts`; `StatusPill({ tone, label, spin?, variant? })`; `Panel({ children, padded?, style? })`; `StatCard({ label, value })`; `EmptyState({ title, description })`; `AlertBanner({ tone?, title, description, action? })`; `Skeleton({ height?, width? })`. Tasks 4 and 5 import all of these by exact name.

- [ ] **Step 1: Create `src/design-system/tokens.ts`**

```ts
export const colors = {
  primary: "#2AEEEF",
  primaryDark: "#004A75",
  background: "#F2F2F2",
  surface: "#FFFFFF",
  text: "#0F0F0F",
  textSecondary: "#4A5560",
  textTertiary: "#8B9297",
  border: "#D8DBDD",
  borderSubtle: "#EEF0F0",
} as const;

export type SemanticTone = "danger" | "warning" | "success" | "info" | "neutral";

export interface ToneStyle {
  bg: string;
  text: string;
  dot: string;
}

/**
 * Derived tints per semantic tone, taken verbatim from the imported design's
 * SEV_STYLE/STATUS_STYLE maps (Vigia Prototype.dc.html). Keep in sync with
 * tokens.css if the base palette ever changes.
 */
export const tonePalette: Record<SemanticTone, ToneStyle> = {
  danger: { bg: "#FFF0F0", text: "#8A2E2E", dot: "#C64545" },
  warning: { bg: "#FFFEEA", text: "#6B6B14", dot: "#9B9B1E" },
  success: { bg: "#F0FFF0", text: "#1E6B1E", dot: "#2E8A2E" },
  info: { bg: "#F0F2FF", text: "#2B3C7D", dot: "#3B4E9C" },
  neutral: { bg: "#F7F8F8", text: "#4A5560", dot: "#8B9297" },
};
```

- [ ] **Step 2: Write `src/design-system/tokens.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { colors, tonePalette } from "./tokens";

describe("design tokens", () => {
  it("matches the brief's base palette", () => {
    expect(colors.primary).toBe("#2AEEEF");
    expect(colors.primaryDark).toBe("#004A75");
    expect(colors.background).toBe("#F2F2F2");
    expect(colors.text).toBe("#0F0F0F");
  });

  it("matches the design's derived tone tints", () => {
    expect(tonePalette.danger).toEqual({ bg: "#FFF0F0", text: "#8A2E2E", dot: "#C64545" });
    expect(tonePalette.success).toEqual({ bg: "#F0FFF0", text: "#1E6B1E", dot: "#2E8A2E" });
    expect(tonePalette.info).toEqual({ bg: "#F0F2FF", text: "#2B3C7D", dot: "#3B4E9C" });
    expect(tonePalette.neutral).toEqual({ bg: "#F7F8F8", text: "#4A5560", dot: "#8B9297" });
  });
});
```

- [ ] **Step 3: Run the test to see it pass immediately (values already correct) — this locks the tokens as a regression guard**

```bash
npx vitest run src/design-system/tokens.test.ts
```

Expected: PASS (2 tests).

- [ ] **Step 4: Write the failing test for `StatusPill` — `src/design-system/StatusPill.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusPill } from "./StatusPill";

describe("StatusPill", () => {
  it("renders the label with the tone's background color", () => {
    render(<StatusPill tone="danger" label="Crítico" />);

    const pill = screen.getByText("Crítico");
    expect(pill.style.backgroundColor).toBe("rgb(255, 240, 240)");
  });

  it("renders a spinning dot when spin is true", () => {
    render(<StatusPill tone="info" label="Atualizando" spin />);

    const dot = screen.getByText("Atualizando").querySelector("span");
    expect(dot).toHaveClass("dotSpin");
  });
});
```

- [ ] **Step 5: Run it to verify it fails (module doesn't exist yet)**

```bash
npx vitest run src/design-system/StatusPill.test.tsx
```

Expected: FAIL with "Cannot find module './StatusPill'".

- [ ] **Step 6: Create `src/design-system/StatusPill.tsx`**

```tsx
import { tonePalette, type SemanticTone } from "./tokens";
import styles from "./StatusPill.module.css";

interface StatusPillProps {
  tone: SemanticTone;
  label: string;
  spin?: boolean;
  variant?: "badge" | "pill";
}

export function StatusPill({ tone, label, spin = false, variant = "badge" }: StatusPillProps) {
  const palette = tonePalette[tone];
  const dotClassName = spin ? styles.dotSpin : variant === "pill" ? styles.dotLarge : styles.dot;

  return (
    <span
      className={variant === "pill" ? styles.pill : styles.badge}
      style={{ backgroundColor: palette.bg, color: palette.text }}
    >
      <span className={dotClassName} style={spin ? undefined : { backgroundColor: palette.dot }} />
      {label}
    </span>
  );
}
```

- [ ] **Step 7: Create `src/design-system/StatusPill.module.css`**

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 600;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.dotLarge {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.dotSpin {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 1.5px solid rgba(15, 15, 15, 0.15);
  border-top-color: currentColor;
  display: inline-block;
  flex-shrink: 0;
  animation: vg-spin 0.8s linear infinite;
}

@keyframes vg-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

- [ ] **Step 8: Run the test to verify it passes**

```bash
npx vitest run src/design-system/StatusPill.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 9: Create `src/design-system/Panel.tsx`**

```tsx
import type { CSSProperties, PropsWithChildren } from "react";
import styles from "./Panel.module.css";

interface PanelProps {
  padded?: boolean;
  style?: CSSProperties;
}

export function Panel({ children, padded = false, style }: PropsWithChildren<PanelProps>) {
  return (
    <div className={padded ? `${styles.panel} ${styles.padded}` : styles.panel} style={style}>
      {children}
    </div>
  );
}
```

- [ ] **Step 10: Create `src/design-system/Panel.module.css`**

```css
.panel {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  overflow: hidden;
}

.padded {
  padding: var(--space-4);
}
```

- [ ] **Step 11: Write the failing test for `StatCard` — `src/design-system/StatCard.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatCard } from "./StatCard";

describe("StatCard", () => {
  it("renders the label and value", () => {
    render(<StatCard label="Eventos ativos" value={3} />);

    expect(screen.getByText("Eventos ativos")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
```

- [ ] **Step 12: Run it to verify it fails**

```bash
npx vitest run src/design-system/StatCard.test.tsx
```

Expected: FAIL with "Cannot find module './StatCard'".

- [ ] **Step 13: Create `src/design-system/StatCard.tsx`**

```tsx
import styles from "./StatCard.module.css";

interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  );
}
```

- [ ] **Step 14: Create `src/design-system/StatCard.module.css`**

```css
.card {
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0 0 var(--space-1);
}

.value {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}
```

- [ ] **Step 15: Run the test to verify it passes**

```bash
npx vitest run src/design-system/StatCard.test.tsx
```

Expected: PASS (1 test).

- [ ] **Step 16: Write the failing test for `EmptyState` — `src/design-system/EmptyState.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title and description with a status role", () => {
    render(<EmptyState title="Nenhum evento encontrado" description="Ajuste os filtros." />);

    const region = screen.getByRole("status");
    expect(region).toHaveTextContent("Nenhum evento encontrado");
    expect(region).toHaveTextContent("Ajuste os filtros.");
  });
});
```

- [ ] **Step 17: Run it to verify it fails, then create `src/design-system/EmptyState.tsx`**

```bash
npx vitest run src/design-system/EmptyState.test.tsx
```

```tsx
import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className={styles.container} role="status">
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
```

- [ ] **Step 18: Create `src/design-system/EmptyState.module.css`**

```css
.container {
  padding: var(--space-8);
  text-align: center;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
}

.title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 var(--space-1);
}

.description {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}
```

- [ ] **Step 19: Run the test to verify it passes**

```bash
npx vitest run src/design-system/EmptyState.test.tsx
```

Expected: PASS (1 test).

- [ ] **Step 20: Write the failing test for `AlertBanner` — `src/design-system/AlertBanner.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AlertBanner } from "./AlertBanner";

describe("AlertBanner", () => {
  it("renders as an alert with title, description and an optional action", () => {
    const onRetry = vi.fn();
    render(
      <AlertBanner
        title="Falha ao atualizar dados climáticos"
        description="Tente novamente em alguns instantes."
        action={
          <button type="button" onClick={onRetry}>
            Tentar novamente
          </button>
        }
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Falha ao atualizar dados climáticos");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 21: Run it to verify it fails, then create `src/design-system/AlertBanner.tsx`**

```bash
npx vitest run src/design-system/AlertBanner.test.tsx
```

```tsx
import type { ReactNode } from "react";
import { tonePalette, type SemanticTone } from "./tokens";
import styles from "./AlertBanner.module.css";

interface AlertBannerProps {
  tone?: SemanticTone;
  title: string;
  description: string;
  action?: ReactNode;
}

export function AlertBanner({ tone = "danger", title, description, action }: AlertBannerProps) {
  const palette = tonePalette[tone];

  return (
    <div className={styles.banner} style={{ backgroundColor: palette.bg, borderColor: palette.dot }} role="alert">
      <span className={styles.dot} style={{ backgroundColor: palette.dot }} />
      <div className={styles.textGroup}>
        <p className={styles.title} style={{ color: palette.text }}>
          {title}
        </p>
        <p className={styles.description}>{description}</p>
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
```

- [ ] **Step 22: Create `src/design-system/AlertBanner.module.css`**

```css
.banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px var(--space-4);
  border-radius: var(--radius-md);
  border: 1px solid;
  margin-bottom: var(--space-6);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: var(--space-1);
}

.textGroup {
  flex: 1;
  min-width: 0;
}

.title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}

.description {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}

.action {
  flex-shrink: 0;
}
```

- [ ] **Step 23: Run the test to verify it passes**

```bash
npx vitest run src/design-system/AlertBanner.test.tsx
```

Expected: PASS (1 test).

- [ ] **Step 24: Create `src/design-system/Skeleton.tsx` and `src/design-system/Skeleton.module.css`** (pure presentational, no dedicated test — nothing to assert beyond "renders a div", covered indirectly by Task 5's DashboardPage loading test)

```tsx
import styles from "./Skeleton.module.css";

interface SkeletonProps {
  height?: number;
  width?: string | number;
}

export function Skeleton({ height = 14, width = "100%" }: SkeletonProps) {
  return <div className={styles.block} style={{ height, width }} aria-hidden="true" />;
}
```

```css
.block {
  border-radius: 4px;
  background: var(--color-skeleton);
}
```

- [ ] **Step 25: Run the full test suite and typecheck**

```bash
npm run typecheck
npm run test
```

Expected: no type errors; all tests from Task 1 and Task 2 pass.

- [ ] **Step 26: Commit**

```bash
git add -A
git commit -m "feat: add design-system tokens and primitives (StatusPill, Panel, StatCard, EmptyState, AlertBanner, Skeleton)"
```

---

### Task 3: Domain types, mocks, services, and the async-data hook

**Files:**
- Create: `src/types/event.ts`
- Create: `src/types/communication.ts`
- Create: `src/types/monitoring.ts`
- Create: `src/mocks/events.ts`
- Create: `src/mocks/communications.ts`
- Create: `src/mocks/monitoringStatus.ts`
- Create: `src/services/simulateDelay.ts`
- Create: `src/services/eventsService.ts`
- Create: `src/services/eventsService.test.ts`
- Create: `src/services/communicationsService.ts`
- Create: `src/services/communicationsService.test.ts`
- Create: `src/services/monitoringService.ts`
- Create: `src/design-system/statusTone.ts`
- Create: `src/design-system/statusTone.test.ts`
- Create: `src/hooks/useAsyncData.ts`
- Create: `src/hooks/useAsyncData.test.ts`
- Create: `src/hooks/useMonitoringStatus.ts`

**Interfaces:**
- Consumes: `SemanticTone`, `tonePalette` from `design-system/tokens.ts` (Task 2).
- Produces: `WeatherEvent`, `Severity`, `EventStatus` (types/event.ts); `Communication`, `CommunicationWithEvent`, `CommunicationChannel`, `CommunicationStatus` (types/communication.ts); `MonitoringState`, `MonitoringStatus` (types/monitoring.ts); `simulateDelay<T>(value: T): Promise<T>` (services/simulateDelay.ts); `getActiveEvents(): Promise<WeatherEvent[]>` (eventsService.ts); `getAllCommunications(): Promise<CommunicationWithEvent[]>` (communicationsService.ts); `getMonitoringStatus(): Promise<MonitoringStatus>` (monitoringService.ts); `severityTone`, `communicationStatusTone`, `monitoringTone` (statusTone.ts); `useAsyncData<T>(loader: () => Promise<T>, deps: unknown[]): { data: T | null; loading: boolean; error: Error | null; reload: () => Promise<void> }` (hooks/useAsyncData.ts); `useMonitoringStatus(): MonitoringStatus` (hooks/useMonitoringStatus.ts). Task 4 consumes `useMonitoringStatus` + `monitoringTone`. Task 5 consumes everything else here.

- [ ] **Step 1: Create `src/types/event.ts`**

```ts
export type Severity = "Crítico" | "Alto" | "Moderado" | "Baixo";
export type EventStatus = "Ativo" | "Monitorando" | "Encerrado";

export interface WeatherEvent {
  id: string;
  tipo: string;
  severidade: Severity;
  regiao: string;
  status: EventStatus;
  detectadoEm: string;
  previsao: string;
  segurados: number;
  regra: string;
  tipoSeguro: string;
}
```

- [ ] **Step 2: Create `src/types/communication.ts`**

```ts
export type CommunicationChannel = "SMS" | "E-mail";
export type CommunicationStatus = "Aguardando revisão" | "Revisada" | "Simulada" | "Erro" | "Enviada" | "Preparada";

export interface Communication {
  id: string;
  eventId: string;
  canal: CommunicationChannel;
  status: CommunicationStatus;
  segurados: number;
  geradoEm: string;
}

export interface CommunicationWithEvent extends Communication {
  eventoTipo: string;
}
```

- [ ] **Step 3: Create `src/types/monitoring.ts`**

```ts
export type MonitoringState = "ativo" | "atualizando" | "indisponivel";

export interface MonitoringStatus {
  state: MonitoringState;
  label: string;
  lastUpdateLabel: string;
}
```

- [ ] **Step 4: Create `src/mocks/events.ts`** (ported verbatim from the imported design)

```ts
import type { WeatherEvent } from "../types/event";

export const eventsMock: WeatherEvent[] = [
  {
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
  },
  {
    id: "ev2",
    tipo: "Granizo",
    severidade: "Alto",
    regiao: "SC · Chapecó",
    status: "Ativo",
    detectadoEm: "13:40",
    previsao: "2 a 4 horas",
    segurados: 642,
    regra: "Clientes com seguro automóvel com veículo associado à região afetada devem receber comunicação preventiva.",
    tipoSeguro: "seguro automóvel",
  },
  {
    id: "ev3",
    tipo: "Ventos fortes",
    severidade: "Moderado",
    regiao: "PR · Curitiba",
    status: "Monitorando",
    detectadoEm: "12:15",
    previsao: "Já em andamento",
    segurados: 210,
    regra: "Clientes com seguro residencial e histórico de sinistro por vendaval na região são elegíveis.",
    tipoSeguro: "seguro residencial",
  },
  {
    id: "ev4",
    tipo: "Chuva intensa",
    severidade: "Baixo",
    regiao: "SP · Campinas",
    status: "Encerrado",
    detectadoEm: "09:00",
    previsao: "Encerrado às 11:30",
    segurados: 58,
    regra: "Clientes com seguro residencial na área monitorada.",
    tipoSeguro: "seguro residencial",
  },
];
```

- [ ] **Step 5: Create `src/mocks/communications.ts`**

```ts
import type { Communication } from "../types/communication";

export const communicationsMock: Communication[] = [
  { id: "c1", eventId: "ev1", canal: "SMS", status: "Simulada", segurados: 1248, geradoEm: "14:11" },
  { id: "c2", eventId: "ev2", canal: "E-mail", status: "Aguardando revisão", segurados: 642, geradoEm: "13:55" },
  { id: "c3", eventId: "ev3", canal: "SMS", status: "Revisada", segurados: 210, geradoEm: "12:40" },
  { id: "c4", eventId: "ev4", canal: "SMS", status: "Erro", segurados: 58, geradoEm: "09:20" },
];
```

- [ ] **Step 6: Create `src/mocks/monitoringStatus.ts`**

```ts
import type { MonitoringStatus } from "../types/monitoring";

export const monitoringStatusMock: MonitoringStatus = {
  state: "ativo",
  label: "Monitoramento ativo",
  lastUpdateLabel: "Última atualização há 2 min",
};
```

- [ ] **Step 6b: Create `src/services/simulateDelay.ts`** — shared artificial-latency helper, used by every service that reads a mock so real network behavior (loading states, races) is exercised without duplicating this helper per file.

```ts
const SIMULATED_LATENCY_MS = 350;

export function simulateDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}
```

- [ ] **Step 7: Write the failing test for `eventsService` — `src/services/eventsService.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { getActiveEvents } from "./eventsService";

describe("eventsService", () => {
  it("returns only events that are not Encerrado, in mock order", async () => {
    const events = await getActiveEvents();

    expect(events.map((event) => event.id)).toEqual(["ev1", "ev2", "ev3"]);
    expect(events.every((event) => event.status !== "Encerrado")).toBe(true);
  });
});
```

- [ ] **Step 8: Run it to verify it fails, then create `src/services/eventsService.ts`**

```bash
npx vitest run src/services/eventsService.test.ts
```

```ts
import { eventsMock } from "../mocks/events";
import type { WeatherEvent } from "../types/event";
import { simulateDelay } from "./simulateDelay";

function listActiveEvents(): WeatherEvent[] {
  return eventsMock.filter((event) => event.status !== "Encerrado");
}

export async function getActiveEvents(): Promise<WeatherEvent[]> {
  return simulateDelay(listActiveEvents());
}
```

- [ ] **Step 9: Run the test to verify it passes**

```bash
npx vitest run src/services/eventsService.test.ts
```

Expected: PASS (1 test, ~350ms).

- [ ] **Step 10: Write the failing test for `communicationsService` — `src/services/communicationsService.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { getAllCommunications } from "./communicationsService";

describe("communicationsService", () => {
  it("returns every communication enriched with its event's tipo", async () => {
    const communications = await getAllCommunications();

    expect(communications).toHaveLength(4);
    expect(communications[0]).toMatchObject({ id: "c1", eventoTipo: "Chuva intensa" });
    expect(communications[1]).toMatchObject({ id: "c2", eventoTipo: "Granizo" });
  });
});
```

- [ ] **Step 11: Run it to verify it fails, then create `src/services/communicationsService.ts`**

```bash
npx vitest run src/services/communicationsService.test.ts
```

```ts
import { communicationsMock } from "../mocks/communications";
import { eventsMock } from "../mocks/events";
import type { Communication, CommunicationWithEvent } from "../types/communication";
import { simulateDelay } from "./simulateDelay";

function withEventoTipo(communication: Communication): CommunicationWithEvent {
  const event = eventsMock.find((e) => e.id === communication.eventId);
  return { ...communication, eventoTipo: event ? event.tipo : "Evento desconhecido" };
}

function listAllCommunications(): CommunicationWithEvent[] {
  return communicationsMock.map(withEventoTipo);
}

export async function getAllCommunications(): Promise<CommunicationWithEvent[]> {
  return simulateDelay(listAllCommunications());
}
```

- [ ] **Step 12: Run the test to verify it passes**

```bash
npx vitest run src/services/communicationsService.test.ts
```

Expected: PASS (1 test, ~350ms).

- [ ] **Step 13: Create `src/services/monitoringService.ts`** (no dedicated test — trivial pass-through, covered by Task 4's `useMonitoringStatus` usage)

```ts
import { monitoringStatusMock } from "../mocks/monitoringStatus";
import type { MonitoringStatus } from "../types/monitoring";

export async function getMonitoringStatus(): Promise<MonitoringStatus> {
  return Promise.resolve(monitoringStatusMock);
}
```

- [ ] **Step 14: Write the failing test for tone-mapping — `src/design-system/statusTone.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { communicationStatusTone, monitoringTone, severityTone } from "./statusTone";

describe("severityTone", () => {
  it("maps every severity to its tone", () => {
    expect(severityTone("Crítico")).toBe("danger");
    expect(severityTone("Alto")).toBe("warning");
    expect(severityTone("Moderado")).toBe("success");
    expect(severityTone("Baixo")).toBe("success");
  });
});

describe("communicationStatusTone", () => {
  it("maps every communication status to its tone", () => {
    expect(communicationStatusTone("Simulada")).toBe("success");
    expect(communicationStatusTone("Enviada")).toBe("success");
    expect(communicationStatusTone("Revisada")).toBe("info");
    expect(communicationStatusTone("Erro")).toBe("danger");
    expect(communicationStatusTone("Aguardando revisão")).toBe("neutral");
    expect(communicationStatusTone("Preparada")).toBe("neutral");
  });
});

describe("monitoringTone", () => {
  it("maps every monitoring state to its tone", () => {
    expect(monitoringTone("ativo")).toBe("success");
    expect(monitoringTone("atualizando")).toBe("info");
    expect(monitoringTone("indisponivel")).toBe("danger");
  });
});
```

- [ ] **Step 15: Run it to verify it fails, then create `src/design-system/statusTone.ts`**

```bash
npx vitest run src/design-system/statusTone.test.ts
```

```ts
import type { CommunicationStatus } from "../types/communication";
import type { Severity } from "../types/event";
import type { MonitoringState } from "../types/monitoring";
import type { SemanticTone } from "./tokens";

export function severityTone(severity: Severity): SemanticTone {
  switch (severity) {
    case "Crítico":
      return "danger";
    case "Alto":
      return "warning";
    case "Moderado":
    case "Baixo":
      return "success";
  }
}

export function communicationStatusTone(status: CommunicationStatus): SemanticTone {
  switch (status) {
    case "Simulada":
    case "Enviada":
      return "success";
    case "Revisada":
      return "info";
    case "Erro":
      return "danger";
    case "Aguardando revisão":
    case "Preparada":
      return "neutral";
  }
}

export function monitoringTone(state: MonitoringState): SemanticTone {
  switch (state) {
    case "ativo":
      return "success";
    case "atualizando":
      return "info";
    case "indisponivel":
      return "danger";
  }
}
```

- [ ] **Step 16: Run the test to verify it passes**

```bash
npx vitest run src/design-system/statusTone.test.ts
```

Expected: PASS (3 tests).

- [ ] **Step 17: Write the failing test for `useAsyncData` — `src/hooks/useAsyncData.test.ts`**

```ts
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAsyncData } from "./useAsyncData";

describe("useAsyncData", () => {
  it("starts loading, then resolves data and clears the error", async () => {
    const loader = vi.fn().mockResolvedValue("ok");
    const { result } = renderHook(() => useAsyncData(loader, []));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe("ok");
    expect(result.current.error).toBeNull();
  });

  it("keeps the previous data and sets an error when reload fails", async () => {
    const loader = vi.fn().mockResolvedValueOnce("first").mockRejectedValueOnce(new Error("boom"));
    const { result } = renderHook(() => useAsyncData(loader, []));

    await waitFor(() => expect(result.current.data).toBe("first"));

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.data).toBe("first");
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
```

- [ ] **Step 18: Run it to verify it fails, then create `src/hooks/useAsyncData.ts`**

```bash
npx vitest run src/hooks/useAsyncData.test.ts
```

```ts
import { useCallback, useEffect, useRef, useState } from "react";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsyncData<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await loaderRef.current();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState((prev) => ({ ...prev, loading: false, error: error as Error }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, reload: load };
}
```

- [ ] **Step 19: Run the test to verify it passes**

```bash
npx vitest run src/hooks/useAsyncData.test.ts
```

Expected: PASS (2 tests).

- [ ] **Step 20: Create `src/hooks/useMonitoringStatus.ts`** (no dedicated test — thin wrapper exercised end-to-end by Task 4's `PageHeader` usage)

```ts
import { useEffect, useState } from "react";
import { getMonitoringStatus } from "../services/monitoringService";
import type { MonitoringStatus } from "../types/monitoring";

const FALLBACK: MonitoringStatus = {
  state: "ativo",
  label: "Monitoramento ativo",
  lastUpdateLabel: "Última atualização há 2 min",
};

export function useMonitoringStatus(): MonitoringStatus {
  const [status, setStatus] = useState<MonitoringStatus>(FALLBACK);

  useEffect(() => {
    let active = true;
    getMonitoringStatus().then((result) => {
      if (active) setStatus(result);
    });
    return () => {
      active = false;
    };
  }, []);

  return status;
}
```

- [ ] **Step 21: Run the full test suite and typecheck**

```bash
npm run typecheck
npm run test
```

Expected: no type errors; every test from Tasks 1–3 passes.

- [ ] **Step 22: Commit**

```bash
git add -A
git commit -m "feat: add domain types, mock data, services, and useAsyncData/useMonitoringStatus hooks"
```

---

### Task 4: Shared `PageHeader` wired to monitoring status; upgrade placeholder pages

**Files:**
- Create: `src/components/layout/PageHeader.tsx`
- Create: `src/components/layout/PageHeader.module.css`
- Create: `src/components/layout/PageHeader.test.tsx`
- Modify: `src/pages/EventsPage.tsx`
- Modify: `src/pages/EventDetailPage.tsx`
- Modify: `src/pages/CommunicationsPage.tsx`
- Modify: `src/pages/CommunicationDetailPage.tsx`
- Modify: `src/pages/HistoryPage.tsx`
- Modify: `src/app/App.test.tsx` (assert the monitoring pill renders on every screen)

**Interfaces:**
- Consumes: `useMonitoringStatus()` (Task 3), `StatusPill`, `monitoringTone` (Tasks 2–3).
- Produces: `PageHeader({ title, subtitle }: { title: string; subtitle: string })`. Task 5's `DashboardPage` consumes this by exact name.

- [ ] **Step 1: Write the failing test — `src/components/layout/PageHeader.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title, subtitle and a monitoring status pill", async () => {
    render(<PageHeader title="Dashboard" subtitle="O que está acontecendo agora" />);

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("O que está acontecendo agora")).toBeInTheDocument();
    expect(await screen.findByText("Monitoramento ativo")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/components/layout/PageHeader.test.tsx
```

Expected: FAIL with "Cannot find module './PageHeader'".

- [ ] **Step 3: Create `src/components/layout/PageHeader.tsx`**

```tsx
import { StatusPill } from "../../design-system/StatusPill";
import { monitoringTone } from "../../design-system/statusTone";
import { useMonitoringStatus } from "../../hooks/useMonitoringStatus";
import styles from "./PageHeader.module.css";

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const monitoring = useMonitoringStatus();

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <div className={styles.statusGroup}>
        <StatusPill
          tone={monitoringTone(monitoring.state)}
          label={monitoring.label}
          spin={monitoring.state === "atualizando"}
          variant="pill"
        />
        <span className={styles.lastUpdate}>{monitoring.lastUpdateLabel}</span>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create `src/components/layout/PageHeader.module.css`**

```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  margin-bottom: var(--space-7);
  flex-wrap: wrap;
}

.title {
  font-size: 26px;
  font-weight: 600;
  margin: 0 0 var(--space-1);
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.statusGroup {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lastUpdate {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-family: var(--font-mono);
}
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
npx vitest run src/components/layout/PageHeader.test.tsx
```

Expected: PASS (1 test).

- [ ] **Step 6: Upgrade the placeholder pages to use `PageHeader`**

`src/pages/EventsPage.tsx`:

```tsx
import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../design-system/EmptyState";

export function EventsPage() {
  return (
    <div>
      <PageHeader title="Eventos climáticos" subtitle="Acompanhe os eventos detectados e seu impacto nos segurados" />
      <EmptyState
        title="Tela em construção"
        description="A lista de eventos climáticos será implementada em um próximo ciclo."
      />
    </div>
  );
}
```

`src/pages/EventDetailPage.tsx`:

```tsx
import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../design-system/EmptyState";

export function EventDetailPage() {
  return (
    <div>
      <PageHeader title="Detalhe do evento" subtitle="Informações completas sobre o evento selecionado" />
      <EmptyState
        title="Tela em construção"
        description="O detalhe do evento será implementado em um próximo ciclo."
      />
    </div>
  );
}
```

`src/pages/CommunicationsPage.tsx`:

```tsx
import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../design-system/EmptyState";

export function CommunicationsPage() {
  return (
    <div>
      <PageHeader title="Comunicações" subtitle="Mensagens preventivas geradas pela IA" />
      <EmptyState
        title="Tela em construção"
        description="A lista de comunicações será implementada em um próximo ciclo."
      />
    </div>
  );
}
```

`src/pages/CommunicationDetailPage.tsx`:

```tsx
import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../design-system/EmptyState";

export function CommunicationDetailPage() {
  return (
    <div>
      <PageHeader title="Detalhe da comunicação" subtitle="Conteúdo e status da comunicação selecionada" />
      <EmptyState
        title="Tela em construção"
        description="O detalhe da comunicação será implementado em um próximo ciclo."
      />
    </div>
  );
}
```

`src/pages/HistoryPage.tsx`:

```tsx
import { PageHeader } from "../components/layout/PageHeader";
import { EmptyState } from "../design-system/EmptyState";

export function HistoryPage() {
  return (
    <div>
      <PageHeader title="Histórico" subtitle="Registro de eventos, comunicações e simulações de envio" />
      <EmptyState title="Tela em construção" description="O histórico será implementado em um próximo ciclo." />
    </div>
  );
}
```

- [ ] **Step 7: Extend `src/app/App.test.tsx`** to assert the monitoring pill is present after navigating (replace the file's contents with):

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App shell navigation", () => {
  it("renders all nav links and the Dashboard by default", async () => {
    render(<App />);

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Eventos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comunicações" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Histórico" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("navigates to the Eventos placeholder and shows the monitoring status pill", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("link", { name: "Eventos" }));

    expect(await screen.findByRole("heading", { name: "Eventos climáticos" })).toBeInTheDocument();
    expect(await screen.findByText("Monitoramento ativo")).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Run the full test suite and typecheck**

```bash
npm run typecheck
npm run test
```

Expected: no type errors; all tests pass.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add shared PageHeader with monitoring status pill; wire placeholder pages"
```

---

### Task 5: Dashboard feature (real implementation, replaces the Task 1 stub)

**Files:**
- Create: `src/features/dashboard/useDashboardData.ts`
- Create: `src/features/dashboard/useDashboardData.test.ts`
- Create: `src/features/dashboard/components/AttentionEventRow.tsx`
- Create: `src/features/dashboard/components/AttentionEventRow.module.css`
- Create: `src/features/dashboard/components/RecentCommunicationRow.tsx`
- Create: `src/features/dashboard/components/RecentCommunicationRow.module.css`
- Modify (full rewrite): `src/pages/DashboardPage.tsx`
- Create: `src/pages/DashboardPage.module.css`
- Create: `src/pages/DashboardPage.test.tsx`

**Interfaces:**
- Consumes: `getActiveEvents` (eventsService), `getAllCommunications` (communicationsService), `useAsyncData` (hooks), `StatusPill`/`Panel`/`StatCard`/`EmptyState`/`AlertBanner`/`Skeleton` (design-system), `severityTone`/`communicationStatusTone` (statusTone), `PageHeader` (components/layout), `WeatherEvent`/`CommunicationWithEvent` (types).
- Produces: `useDashboardData()` returning `{ data: DashboardData | null; loading: boolean; error: Error | null; reload: () => Promise<void> }` where `DashboardData = { kpiEventosAtivos: number; kpiSegurados: number; kpiComunicacoes: number; kpiSimuladas: number; attentionEvents: WeatherEvent[]; recentCommunications: CommunicationWithEvent[] }`.

- [ ] **Step 1: Write the failing test — `src/features/dashboard/useDashboardData.test.ts`**

```ts
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useDashboardData } from "./useDashboardData";
import * as eventsService from "../../services/eventsService";
import * as communicationsService from "../../services/communicationsService";

describe("useDashboardData", () => {
  it("computes KPIs matching the design's reference numbers", async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toMatchObject({
      kpiEventosAtivos: 3,
      kpiSegurados: 2100,
      kpiComunicacoes: 4,
      kpiSimuladas: 1,
    });
    expect(result.current.data?.attentionEvents.map((e) => e.id)).toEqual(["ev1", "ev2", "ev3"]);
    expect(result.current.data?.recentCommunications.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("surfaces a rejected fetch as an error", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockRejectedValueOnce(new Error("network down"));
    vi.spyOn(communicationsService, "getAllCommunications").mockResolvedValueOnce([]);

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => expect(result.current.error).toBeInstanceOf(Error));
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

```bash
npx vitest run src/features/dashboard/useDashboardData.test.ts
```

Expected: FAIL with "Cannot find module './useDashboardData'".

- [ ] **Step 3: Create `src/features/dashboard/useDashboardData.ts`**

```ts
import { useAsyncData } from "../../hooks/useAsyncData";
import { getActiveEvents } from "../../services/eventsService";
import { getAllCommunications } from "../../services/communicationsService";
import type { CommunicationWithEvent } from "../../types/communication";
import type { WeatherEvent } from "../../types/event";

export interface DashboardData {
  kpiEventosAtivos: number;
  kpiSegurados: number;
  kpiComunicacoes: number;
  kpiSimuladas: number;
  attentionEvents: WeatherEvent[];
  recentCommunications: CommunicationWithEvent[];
}

async function loadDashboardData(): Promise<DashboardData> {
  const [activeEvents, allCommunications] = await Promise.all([getActiveEvents(), getAllCommunications()]);

  return {
    kpiEventosAtivos: activeEvents.length,
    kpiSegurados: activeEvents.reduce((total, event) => total + event.segurados, 0),
    kpiComunicacoes: allCommunications.length,
    kpiSimuladas: allCommunications.filter((communication) => communication.status === "Simulada").length,
    attentionEvents: activeEvents.slice(0, 3),
    recentCommunications: allCommunications.slice(0, 3),
  };
}

export function useDashboardData() {
  return useAsyncData(loadDashboardData, []);
}
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
npx vitest run src/features/dashboard/useDashboardData.test.ts
```

Expected: PASS (2 tests, ~350ms each).

- [ ] **Step 5: Create `src/features/dashboard/components/AttentionEventRow.tsx`**

```tsx
import { Link } from "react-router-dom";
import { StatusPill } from "../../../design-system/StatusPill";
import { severityTone } from "../../../design-system/statusTone";
import type { WeatherEvent } from "../../../types/event";
import styles from "./AttentionEventRow.module.css";

interface AttentionEventRowProps {
  event: WeatherEvent;
}

export function AttentionEventRow({ event }: AttentionEventRowProps) {
  return (
    <Link to={`/eventos/${event.id}`} className={styles.row}>
      <span className={styles.info}>
        <StatusPill tone={severityTone(event.severidade)} label={event.severidade} />
        <span className={styles.textGroup}>
          <span className={styles.tipo}>{event.tipo}</span>
          <span className={styles.meta}>
            {event.regiao} · {event.detectadoEm}
          </span>
        </span>
      </span>
      <span className={styles.count}>{event.segurados.toLocaleString("pt-BR")} segurados</span>
    </Link>
  );
}
```

- [ ] **Step 6: Create `src/features/dashboard/components/AttentionEventRow.module.css`**

```css
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 14px var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-decoration: none;
  color: inherit;
}

.row:hover {
  background: var(--color-surface-muted);
}

.info {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
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

.count {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  flex-shrink: 0;
}
```

- [ ] **Step 7: Create `src/features/dashboard/components/RecentCommunicationRow.tsx`**

```tsx
import { StatusPill } from "../../../design-system/StatusPill";
import { communicationStatusTone } from "../../../design-system/statusTone";
import type { CommunicationWithEvent } from "../../../types/communication";
import styles from "./RecentCommunicationRow.module.css";

interface RecentCommunicationRowProps {
  communication: CommunicationWithEvent;
}

export function RecentCommunicationRow({ communication }: RecentCommunicationRowProps) {
  return (
    <li className={styles.row}>
      <span className={styles.textGroup}>
        <span className={styles.tipo}>{communication.eventoTipo}</span>
        <span className={styles.meta}>
          {communication.canal} · {communication.segurados.toLocaleString("pt-BR")} segurados
        </span>
      </span>
      <StatusPill tone={communicationStatusTone(communication.status)} label={communication.status} />
    </li>
  );
}
```

- [ ] **Step 8: Create `src/features/dashboard/components/RecentCommunicationRow.module.css`**

```css
.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-subtle);
}

.row:last-child {
  border-bottom: none;
}

.textGroup {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tipo {
  font-size: 13px;
  font-weight: 600;
}

.meta {
  font-size: 12px;
  color: var(--color-text-secondary);
}
```

- [ ] **Step 9: Write the failing test — `src/pages/DashboardPage.test.tsx`**

```tsx
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";
import * as eventsService from "../services/eventsService";

function renderDashboard() {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe("DashboardPage", () => {
  it("shows the loading skeleton before data resolves", () => {
    renderDashboard();

    expect(screen.queryByText("Eventos ativos")).not.toBeInTheDocument();
  });

  it("shows KPI values and both lists once data resolves", async () => {
    renderDashboard();

    const kpiLabel = await screen.findByText("Eventos ativos");
    expect(kpiLabel.nextSibling).toHaveTextContent("3");

    expect(screen.getByText("Chuva intensa")).toBeInTheDocument();
    expect(screen.getByText("Granizo")).toBeInTheDocument();
    expect(screen.getByText("Ventos fortes")).toBeInTheDocument();
  });

  it("shows an error banner with a working retry when the fetch fails", async () => {
    vi.spyOn(eventsService, "getActiveEvents").mockRejectedValueOnce(new Error("network down"));

    renderDashboard();

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Falha ao atualizar dados climáticos");
    expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 10: Run it to verify it fails** (the stub `DashboardPage` from Task 1 doesn't render KPIs or an alert)

```bash
npx vitest run src/pages/DashboardPage.test.tsx
```

Expected: FAIL — `findByText("Eventos ativos")` times out.

- [ ] **Step 11: Replace `src/pages/DashboardPage.tsx` with the real implementation**

```tsx
import { PageHeader } from "../components/layout/PageHeader";
import { AlertBanner } from "../design-system/AlertBanner";
import { EmptyState } from "../design-system/EmptyState";
import { Panel } from "../design-system/Panel";
import { Skeleton } from "../design-system/Skeleton";
import { StatCard } from "../design-system/StatCard";
import { AttentionEventRow } from "../features/dashboard/components/AttentionEventRow";
import { RecentCommunicationRow } from "../features/dashboard/components/RecentCommunicationRow";
import { useDashboardData } from "../features/dashboard/useDashboardData";
import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  const { data, loading, error, reload } = useDashboardData();

  return (
    <div className={styles.page}>
      <PageHeader title="Dashboard" subtitle="O que está acontecendo agora e exige sua atenção" />

      {loading && !data ? (
        <div className={styles.skeletonGroup}>
          <Skeleton height={14} width={220} />
          <Skeleton height={120} />
          <Skeleton height={120} />
        </div>
      ) : null}

      {error ? (
        <AlertBanner
          title="Falha ao atualizar dados climáticos"
          description="A conexão com a API meteorológica foi interrompida. Os dados exibidos podem estar desatualizados. Tente novamente em alguns instantes."
          action={
            <button type="button" className={styles.retryButton} onClick={reload}>
              Tentar novamente
            </button>
          }
        />
      ) : null}

      {data ? (
        <>
          <div className={styles.kpiGrid}>
            <StatCard label="Eventos ativos" value={data.kpiEventosAtivos} />
            <StatCard label="Segurados em risco" value={data.kpiSegurados.toLocaleString("pt-BR")} />
            <StatCard label="Comunicações geradas" value={data.kpiComunicacoes} />
            <StatCard label="Simulações concluídas" value={data.kpiSimuladas} />
          </div>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Eventos que exigem atenção</h2>
            {data.attentionEvents.length === 0 ? (
              <EmptyState
                title="Nenhum evento em aberto"
                description="Não há eventos climáticos exigindo atenção no momento."
              />
            ) : (
              <div className={styles.attentionList}>
                {data.attentionEvents.map((event) => (
                  <AttentionEventRow key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Comunicações recentes</h2>
            {data.recentCommunications.length === 0 ? (
              <EmptyState
                title="Nenhuma comunicação gerada"
                description="As comunicações preventivas aparecerão aqui assim que forem geradas."
              />
            ) : (
              <Panel>
                <ul className={styles.commList}>
                  {data.recentCommunications.map((communication) => (
                    <RecentCommunicationRow key={communication.id} communication={communication} />
                  ))}
                </ul>
              </Panel>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 12: Create `src/pages/DashboardPage.module.css`**

```css
.page {
  display: flex;
  flex-direction: column;
}

.skeletonGroup {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-7);
}

.kpiGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  margin-bottom: var(--space-7);
}

.section {
  margin-bottom: var(--space-7);
}

.sectionTitle {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 var(--space-3);
}

.attentionList {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.commList {
  list-style: none;
  margin: 0;
  padding: 0;
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

@media (max-width: 1024px) {
  .kpiGrid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 375px) {
  .kpiGrid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 13: Run the test to verify it passes**

```bash
npx vitest run src/pages/DashboardPage.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 14: Run the full test suite, typecheck, lint, and build**

```bash
npm run typecheck
npm run test
npm run lint
npm run build
```

Expected: all four pass with no errors or warnings.

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "feat: implement Dashboard screen (KPIs, attention events, recent communications)"
```

---

### Task 6: Final verification (Gauntlet)

**Files:** none created; this task only runs checks and fixes anything it finds.

- [ ] **Step 1: Run the full quality gate**

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected: all four exit 0. If any fails, fix the underlying issue in the relevant task's files (not by weakening a check) and re-run this step before continuing.

- [ ] **Step 2: Manual responsive check** — run `npm run dev`, open the app, and resize the viewport to 1440px, 1024px, and 375px. Confirm: no horizontal scrollbar at any width; the sidebar collapses to a horizontal top bar with scrollable nav below 768px (per `Sidebar.module.css` Step 10 of Task 1); the KPI grid drops from 4 to 2 to 1 column at the breakpoints defined in `DashboardPage.module.css`.

- [ ] **Step 3: Manual keyboard check** — with the dev server running, Tab through the page: focus should move Sidebar links → PageHeader (no focusable elements) → attention event rows (each is a real `<Link>`, focusable) → retry button (only visible in the error state). Confirm the browser's default focus outline is visible at every stop (no `outline: none` was added anywhere in this plan).

- [ ] **Step 4: Commit if Step 1 required fixes**

```bash
git add -A
git commit -m "fix: address gauntlet findings from final verification"
```

(Skip this commit if Step 1 passed clean on the first run.)
