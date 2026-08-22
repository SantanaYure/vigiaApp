# Task 1 Report: TypeScript + Vitest toolchain, cleanup, App Shell skeleton with routing

Branch: `feature/vigia-app-shell-dashboard`
Worktree: `D:\OneDrive\Área de Trabalho\vigiaApp\.worktrees\vigia-app-shell-dashboard`
Commit created: `eb4a539` — "feat: bootstrap TypeScript/Vitest toolchain and App Shell routing"
Parent commit (start of task): `ae315a3`

## Summary

All 19 steps in the brief were executed in order. Two small deviations from the brief's literal file contents were required to satisfy the brief's own acceptance criterion ("`typecheck` reports no errors; `test` runs `App.test.tsx` and both tests pass") — both are documented below. Everything else was created exactly as specified.

## Step-by-step

**Step 1 — Delete the legacy JS app.**
Ran:
```bash
rm -f src/App.jsx src/main.jsx vite.config.js
rm -rf src/components src/pages src/hooks src/mocks src/services src/styles src/utils
```
Result: `src/` was left empty, `vite.config.js` gone. Verified with `ls -la src/` (only `.`/`..`) and `ls vite.config.js` (No such file or directory).

**Step 2 — `package.json`.** Replaced with the brief's content verbatim, then later amended the `vitest` version (see Deviation 1 below).

**Step 3 — `tsconfig.json`.** Created exactly as specified.

**Step 4 — `vite.config.ts`.** Created exactly as specified.

**Step 5 — `src/setupTests.ts`.** Created exactly as specified.

**Step 6 — `index.html`.** Replaced exactly as specified (swapped `main.jsx` → `main.tsx`, added Google Fonts preconnect/stylesheet links for IBM Plex Sans/Mono).

**Step 7 — `src/design-system/tokens.css`.** Created exactly as specified.

**Step 8 — `src/design-system/index.css`.** Created exactly as specified.

**Step 9 — `src/components/layout/Sidebar.tsx`.** Created exactly as specified.

**Step 10 — `src/components/layout/Sidebar.module.css`.** Created exactly as specified.

**Step 11 — `src/components/layout/AppShell.tsx`.** Created exactly as specified.

**Step 12 — `src/components/layout/AppShell.module.css`.** Created exactly as specified.

**Step 13 — Placeholder pages.** Created `EventsPage.tsx`, `EventDetailPage.tsx`, `CommunicationsPage.tsx`, `CommunicationDetailPage.tsx`, `HistoryPage.tsx` — all exactly as specified.

**Step 14 — `src/pages/DashboardPage.tsx` stub.** Created exactly as specified.

**Step 15 — `src/app/App.tsx`.** Created exactly as specified (BrowserRouter + Routes wiring all six paths under `AppShell`).

**Step 16 — `src/main.tsx`.** Created exactly as specified.

**Step 17 — `src/app/App.test.tsx`.** Created exactly as specified.

**Step 18 — Install dependencies and run checks.** See "Commands run" below. Required two deviations to reach a clean pass (details below).

**Step 19 — Commit.** Committed as `eb4a539` (message text preserved from the brief, with the standard `Co-Authored-By` trailer appended per repo convention).

## Deviations from the brief

### Deviation 1: `vitest` bumped from `^2.1.8` to `^4.1.11`

The brief pins `"vite": "^8.2.0"` alongside `"vitest": "^2.1.8"`. These two are incompatible: vitest 2.1.x's `vitest/config` triple-slash types (used in `vite.config.ts`'s `/// <reference types="vitest/config" />`) resolve against Vite's `UserConfig`/`UserConfigExport` types from a **Vite 5** baseline (vitest 2.1.x's own peer/internal dependency), while the installed top-level Vite is 8.2.1. This produced:

```
vite.config.ts(7,3): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, and 'test' does not exist in type 'UserConfigExport'.
```

Checked `npm info vitest@2.1.8 peerDependencies` — it doesn't declare a `vite` peer range at all (relies on its bundled vite-node's own vite 5.x), confirming the 2.x line predates Vite 8 support. `npm info vitest@4.1.11 peerDependencies` shows `vite: '^6.0.0 || ^7.0.0 || ^8.0.0'` — the first stable (non-RC) line that supports Vite 8. I bumped `devDependencies.vitest` to `^4.1.11` in `package.json` (all other version pins in the brief left untouched) and re-ran `npm install`. This is the only version deviation from Step 2's literal file content.

### Deviation 2: added `src/vite-env.d.ts`

The brief's file list does not include a `vite-env.d.ts`, but without it `tsc --noEmit` failed on the two CSS Modules imports:

```
src/components/layout/AppShell.tsx(3,20): error TS2307: Cannot find module './AppShell.module.css' or its corresponding type declarations.
src/components/layout/Sidebar.tsx(2,20): error TS2307: Cannot find module './Sidebar.module.css' or its corresponding type declarations.
```

`tsconfig.json`'s `"types"` array (per the brief) only lists `["vitest/globals", "@testing-library/jest-dom"]`, so Vite's ambient module declarations for `*.module.css` (normally pulled in via `vite/client` types) were never loaded. Added a minimal, standard file:

```ts
/// <reference types="vite/client" />
```

at `src/vite-env.d.ts`. This is the conventional file Vite's own `create-vite` scaffolds for TS projects; it introduces no other behavior change.

Both deviations were necessary to satisfy the brief's own Step 18 acceptance criterion; no other file content, structure, or naming deviates from the brief.

## Commands run (Step 18)

### `npm install` (first pass, brief's literal package.json)
```
npm warn deprecated whatwg-encoding@3.1.1: Use @exodus/bytes instead for a more spec-conformant and faster implementation

added 124 packages, and audited 193 packages in 31s

34 packages are looking for funding
  run `npm fund` for details

5 vulnerabilities (3 moderate, 1 high, 1 critical)
```

### `npm run typecheck` (first pass — failed, prompted Deviations 1 & 2)
```
> vigiaapp@0.0.0 typecheck
> tsc --noEmit

src/components/layout/AppShell.tsx(3,20): error TS2307: Cannot find module './AppShell.module.css' or its corresponding type declarations.
src/components/layout/Sidebar.tsx(2,20): error TS2307: Cannot find module './Sidebar.module.css' or its corresponding type declarations.
vite.config.ts(7,3): error TS2769: No overload matches this call.
  The last overload gave the following error.
    Object literal may only specify known properties, and 'test' does not exist in type 'UserConfigExport'.
```

Applied Deviations 1 (vitest → `^4.1.11`) and 2 (`src/vite-env.d.ts`), then:

### `npm install` (second pass, after vitest bump)
```
added 5 packages, removed 16 packages, changed 13 packages, and audited 182 packages in 7s

33 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### `npm run typecheck` (second pass — clean)
```
> vigiaapp@0.0.0 typecheck
> tsc --noEmit
```
(No output — no errors.)

### `npm run test`
```
> vigiaapp@0.0.0 test
> vitest run


 RUN  v4.1.11 D:/OneDrive/Área de Trabalho/vigiaApp/.worktrees/vigia-app-shell-dashboard


 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  08:27:45
   Duration  45.41s (transform 2.26s, setup 6.08s, import 9.81s, tests 294ms, environment 27.67s)
```

Both tests in `src/app/App.test.tsx` pass:
1. "renders all nav links and the Dashboard by default"
2. "navigates to the Eventos placeholder when its nav link is clicked"

## Git commit

```bash
git add -A
git commit -m "feat: bootstrap TypeScript/Vitest toolchain and App Shell routing

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

Result: commit `eb4a539` on `feature/vigia-app-shell-dashboard`, 82 files changed (1918 insertions, 2798 deletions) — the entire legacy JS app (`src/App.jsx`, `src/main.jsx`, `vite.config.js`, and the `src/components/`, `src/pages/`, `src/hooks/`, `src/mocks/`, `src/services/`, `src/styles/`, `src/utils/` directories) was removed and replaced by the new TS App Shell tree. Git also reported CRLF/LF line-ending warnings on the new/changed text files (expected on Windows with a repo that doesn't force `core.autocrlf`; no `.gitattributes` present) — cosmetic only, did not affect the commit.

`git log --oneline -3` after commit:
```
eb4a539 feat: bootstrap TypeScript/Vitest toolchain and App Shell routing
ae315a3 docs: extract shared simulateDelay helper in plan to avoid duplicated logic across services
722dcfc chore: ignore .worktrees directory
```

## Final state check

- `npm run typecheck`: clean, 0 errors.
- `npm run test`: 1 test file, 2/2 tests passing.
- Working tree: clean after commit (`git status` shows nothing to commit).
- No files outside the worktree were touched.

## Fix round 1 — gate verification

A prior review flagged that the report above only documented `npm run typecheck` and `npm run test`, even though the plan's Global Constraints require all four gate commands (`lint`, `typecheck`, `test`, `build`) to pass before a task is considered done. `lint` and `build` were never actually run and recorded in the original report. This section records the missing evidence; no source code was changed (the reviewer had already confirmed both commands pass cleanly against the existing code).

### `npm run lint`

Command run:

```bash
npm run lint
```

Full output:

```
> vigiaapp@0.0.0 lint
> oxlint
```

Result: oxlint completed with no output beyond the invocation line — no errors or warnings reported.

### `npm run build`

Command run:

```bash
npm run build
```

Full output:

```
> vigiaapp@0.0.0 build
> vite build

vite v8.2.1 building client environment for production...
transforming...
✓ 34 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.78 kB │ gzip:  0.42 kB
dist/assets/index-C-mqHKcz.css    2.57 kB │ gzip:  1.06 kB
dist/assets/index-BVxp8Oi9.js   231.87 kB │ gzip: 74.16 kB

✓ built in 556ms
```

Result: Vite build succeeded, emitting `dist/index.html`, `dist/assets/index-C-mqHKcz.css`, and `dist/assets/index-BVxp8Oi9.js` with no errors.

### Gate summary

All four plan-mandated gate commands now have recorded passing evidence in this report:

- `lint`: passing (see above, this section).
- `typecheck`: passing — already verified and recorded in the original report body above ("Final state check": clean, 0 errors).
- `test`: passing — already verified and recorded in the original report body above (1 test file, 2/2 tests passing).
- `build`: passing (see above, this section).
