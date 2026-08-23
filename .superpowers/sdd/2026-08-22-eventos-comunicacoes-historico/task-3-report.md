# Task 3 Report — MessageEditorCard + useMessageEditor

Branch: `feature/eventos-comunicacoes-historico`
Base commit: `16b91e3`
Commit created: `2228167`

## Summary

Implemented the shared edit/regenerate/simulate-send infrastructure exactly as specified in
`task-3-brief.md`, following TDD (failing test → implementation → passing test) for both the
presentational component and the logic hook. No deviations from the brief's file contents were
needed — all interfaces from Tasks 1 and 2 (`StatusPill`, `communicationStatusTone`,
`CommunicationWithEvent`, and the `communicationsService` functions) matched the signatures
assumed by the brief exactly, and the mock data (`src/mocks/communicationMessages.ts`) already
contained the exact strings the hook test expects for `c1`/`c3`/`c4`.

## Steps performed

1. **Read requirements** — reviewed `task-3-brief.md` in full, and cross-checked the interfaces it
   consumes by reading `src/services/communicationsService.ts`, `src/design-system/StatusPill.tsx`,
   `src/design-system/statusTone.ts`, and `src/types/communication.ts`. All matched the brief's
   assumptions with no adjustments required.

2. **Step 1 — Wrote failing test**: created
   `src/features/communications/components/MessageEditorCard.test.tsx` verbatim from the brief.
   (Also created the parent directories `src/features/communications/components/`, which didn't
   exist yet.)

3. **Step 2 — Verified it fails**:
   ```
   npx vitest run src/features/communications/components/MessageEditorCard.test.tsx
   ```
   Result: FAIL — `Failed to resolve import "./MessageEditorCard"` (module not found), as expected.

4. **Steps 3–4 — Created implementation**: `MessageEditorCard.tsx` and
   `MessageEditorCard.module.css`, verbatim from the brief.

5. **Step 5 — Verified it passes**:
   ```
   npx vitest run src/features/communications/components/MessageEditorCard.test.tsx
   ```
   Result: PASS — 4/4 tests passed.

6. **Step 6 — Wrote failing test for the hook**: created
   `src/features/communications/useMessageEditor.test.ts` verbatim from the brief.

7. **Step 7 — Verified it fails**:
   ```
   npx vitest run src/features/communications/useMessageEditor.test.ts
   ```
   Result: FAIL — `Failed to resolve import "./useMessageEditor"` (module not found), as expected.

8. **Step 8 — Created the hook**: `src/features/communications/useMessageEditor.ts`, verbatim from
   the brief.

9. **Step 9 — Verified it passes**:
   ```
   npx vitest run src/features/communications/useMessageEditor.test.ts
   ```
   Result: PASS — 6/6 tests passed.

10. **Step 10 — Full verification**:
    - `npm run typecheck` (`tsc --noEmit`) — clean, no output, exit 0.
    - `npm run lint` (`oxlint`) — exit 0. One **warning** (not an error, does not fail the
      command): `react(set-state-in-effect)` on `useMessageEditor.ts:18` for the
      `setIsEditing(false); setIsConfirmOpen(false);` calls inside the `useEffect` that resets
      state on `communicationId` change. This is the brief's exact prescribed implementation
      (Step 8's code, given verbatim); I did not alter it, since the brief's interface contract
      requires resetting `isEditing`/`isConfirmOpen` synchronously whenever the id changes (test:
      "resets isEditing and isConfirmOpen when the communication id changes"), and the warning is
      advisory only — `oxlint` returns exit code 0 and the project's `.oxlintrc.json` does not list
      this rule as an explicit error. See "Deviations" below.
    - `npm run test` (`vitest run`, full suite) — **19 test files passed, 49 tests passed**, 0
      failures.

11. **Step 11 — Commit**: staged the 5 new files and committed:
    ```
    git commit -m "feat: add shared MessageEditorCard and useMessageEditor for the edit/regenerate/simulate flow"
    ```
    Resulting commit: `2228167` (5 files changed, 408 insertions).

## Test commands and results

| Command | Result |
|---|---|
| `npx vitest run src/features/communications/components/MessageEditorCard.test.tsx` (before impl) | FAIL — module not found (expected) |
| `npx vitest run src/features/communications/components/MessageEditorCard.test.tsx` (after impl) | PASS — 4/4 |
| `npx vitest run src/features/communications/useMessageEditor.test.ts` (before impl) | FAIL — module not found (expected) |
| `npx vitest run src/features/communications/useMessageEditor.test.ts` (after impl) | PASS — 6/6 |
| `npm run typecheck` | PASS — no errors |
| `npm run lint` | PASS (exit 0) — 1 advisory warning, see Deviations |
| `npm run test` (full suite) | PASS — 19 files, 49 tests, 0 failures |

## Files created

- `src/features/communications/components/MessageEditorCard.tsx`
- `src/features/communications/components/MessageEditorCard.module.css`
- `src/features/communications/components/MessageEditorCard.test.tsx`
- `src/features/communications/useMessageEditor.ts`
- `src/features/communications/useMessageEditor.test.ts`

## Deviations from the brief

None in code — every file was created with the exact content specified in the brief.

One thing worth flagging (not a deviation, a note for reviewers): `npm run lint` produces a single
advisory warning on `useMessageEditor.ts:18`:

```
react(set-state-in-effect): Calling setState synchronously within an effect can trigger cascading renders
```

This fires on the `setIsEditing(false); setIsConfirmOpen(false);` lines at the top of the
`useEffect` that runs whenever `communicationId` changes — exactly the code given verbatim in the
brief's Step 8. It does not fail the lint command (exit code 0) and is not listed as an explicit
rule in `.oxlintrc.json` (only `react/rules-of-hooks` and `react/only-export-components` are
configured there), so it appears to be a default/recommended warning from oxlint's react plugin
rather than a project-enforced error. I left the implementation as specified since:

- The brief mandates this exact code.
- The hook's contract (verified by the test "resets isEditing and isConfirmOpen when the
  communication id changes") requires these resets to happen synchronously when the id prop
  changes — this is a legitimate "synchronize with an external system" (the parent's selection)
  use of `useEffect`, not a case where the state should instead be derived at render time, since
  `isEditing`/`isConfirmOpen` are user-driven UI state that must persist across re-renders with the
  same id but reset on an id change.

No action taken beyond noting it; flagging for the task owner in case a project-wide lint policy
decision is wanted later.

## Context for Tasks 4 and 5

`MessageEditorCard` is presentational only (no state, no service calls) and `useMessageEditor`
owns all state and service calls for the edit/regenerate/simulate-send flow. Tasks 4 (Eventos) and
5 (Comunicações) should each call `useMessageEditor(communicationId, onSimulated)` once per
selected communication and wire its returned object directly into `MessageEditorCard`'s props, plus
their own `Modal` (for the `isConfirmOpen`/`onCancelSimulate`/`onConfirmSimulate` confirmation) and
`Toast` (for `toastMessage`). Neither page should reimplement any part of this logic.

## Fix round 1 — stale text and async race guards

A code reviewer found a real correctness bug in the original `useMessageEditor.ts`, confirmed by
the project owner as needing an immediate fix (not a deferred follow-up). Three related issues in
the original implementation:

1. **Stale text on every selection switch.** The reset effect only cleared `text` when the new
   `communicationId` was `null`. When switching from one non-null id to another, the *previous*
   communication's message text remained on screen for the ~350ms of the mock service's simulated
   latency before the new text loaded. Since the mock service always has this latency, the bug
   fired on **every single selection change** — not an edge case, the common path — and produced a
   visible mismatch against the header (channel/status), which updates immediately from the
   parent's already-loaded data.
2. **Unguarded async writes (race condition).** `onRegenerate` and `onConfirmSimulate` each
   `await` a service call and then unconditionally called `setText` / `setToastMessage` /
   `setIsConfirmOpen`. If the user switched to a different communication before the promise
   resolved, the stale result from the *previous* communication's regenerate/simulate call would
   overwrite state for whatever communication was now selected.
3. **Leftover toast timer.** The toast's `setTimeout` was never captured or cleared, so a timer
   scheduled by one simulate-send could fire after a later simulate-send had already shown (or was
   about to show) a different toast, clearing it prematurely, and the timer also outlived unmount.

### Fix applied

Replaced `src/features/communications/useMessageEditor.ts` verbatim with the corrected
implementation from the plan file
(`docs/superpowers/plans/2026-08-22-eventos-comunicacoes-historico.md`, Task 3 Step 8, as amended
in commit `a9fdca5`):

- Added a `currentIdRef` (a `useRef<string | null>`, assigned `communicationId` on every render —
  not inside an effect, so it is always current for in-flight async closures to read after an
  `await`). `onRegenerate` and `onConfirmSimulate` each capture the id they were invoked for into a
  local `requestId` before awaiting, then compare `currentIdRef.current === requestId` after the
  await resolves; the state-updating calls only run if the selection hasn't moved on.
- The reset effect now calls `setText("")` unconditionally on every `communicationId` change
  (including id-to-id switches), before the `if (!communicationId) return` early-return, so the
  previous communication's text is never visible while the new one loads.
- Added a `toastTimeoutRef` that is cleared (`clearTimeout`) both before scheduling a new toast
  timeout in `onConfirmSimulate` and in a cleanup-only `useEffect` on unmount, so a stale timer from
  an earlier simulate-send can no longer clear a later toast (or fire after unmount).

No other behavior changed; `onTextChange`, `onToggleEdit`, `onRequestSimulate`,
`onCancelSimulate`, and the returned hook shape are unchanged.

### Tests added

Both added to `src/features/communications/useMessageEditor.test.ts`, alongside the existing 6
(now 8 total):

1. `"clears text immediately when switching from one communication to another, before the new text
   loads"` — loads `c1`'s text, rerenders with `id: "c2"`, and asserts `text` is `""` synchronously
   after the rerender (before the new fetch resolves). Regression test for bug 1.
2. `"discards a regenerate result if the selected communication changes before it resolves"` —
   loads `c1`'s text, calls `onRegenerate()` against a manually-controlled promise (via
   `vi.spyOn(communicationsService, "regenerateCommunicationText").mockReturnValueOnce(new
   Promise(...))` so the call stays pending), rerenders with `id: "c2"` and waits for `c2`'s text to
   load, then resolves the pending `c1` regenerate call and flushes microtasks. Asserts `text` is
   still `c2`'s loaded text, i.e. the stale `c1` regenerate result was discarded. Regression test
   for bug 2. Required adding `import * as communicationsService from
   "../../services/communicationsService";` — already present in the file from Task 3 (used by an
   existing test), so no new import was needed.

Both tests passed on the first run with the fix applied — no iteration on the microtask-flushing
approach was needed (`await act(async () => { resolveRegenerate(); await Promise.resolve(); await
Promise.resolve(); })` was sufficient as specified).

### Verification

| Command | Result |
|---|---|
| `npx vitest run src/features/communications/useMessageEditor.test.ts` | PASS — 8/8 tests |
| `npm run typecheck` (`tsc --noEmit`) | PASS — no errors, exit 0 |
| `npm run lint` (`oxlint`) | PASS — exit 0. Two advisory warnings on `useMessageEditor.ts`: `react(refs)` at line 20 (`currentIdRef.current = communicationId` assigned during render — this is the plan's prescribed pattern, intentional so async closures can read the latest id after an await) and `react(set-state-in-effect)` at line 24 (`setText("")` inside the reset effect — same category of pre-existing advisory warning noted in the original Task 3 report for the `setIsEditing`/`setIsConfirmOpen` resets in the same effect). Neither is a configured error in `.oxlintrc.json`; both are inherent to the plan's verbatim-specified fix. |
| `npm run test` (full suite) | PASS — 19 test files, 51 tests, 0 failures |

Full raw output:

```
$ npx vitest run src/features/communications/useMessageEditor.test.ts
 RUN  v4.1.11
 Test Files  1 passed (1)
      Tests  8 passed (8)

$ npm run typecheck
> tsc --noEmit
(no output, exit 0)

$ npm run lint
> oxlint
src/features/communications/useMessageEditor.ts:20:15: warning react(refs): Cannot access refs during render
src/features/communications/useMessageEditor.ts:24:5: warning react(set-state-in-effect): Calling setState synchronously within an effect can trigger cascading renders
(exit 0)

$ npm run test
 RUN  v4.1.11
 Test Files  19 passed (19)
      Tests  51 passed (51)
```
