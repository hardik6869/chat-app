# Chat App — Claude instructions

Plan: `PLAN.md` · Checklist: `docs/REQUIREMENTS_CHECKLIST.md` (both local only, git-ignored)

## Stack
Vite · React 19 · TypeScript strict · Tailwind v4 · Zustand · React Hook Form · lucide-react · Vitest + Testing Library.

## Commands
- `npm run dev` · `npm run build` · `npm run lint` · `npm run typecheck` · `npm test` · `npm run knip`

## Rules
- Follow PLAN.md §6 one step at a time; one small Conventional Commit per step.
- Atomic design: `shared/ui/atoms` → `shared/ui/molecules` → feature organisms.
- Every folder has a barrel `index.ts`; import via `@/…` aliases, never deep paths across modules.
- Components: props in, events out. Logic lives in hooks; data lives in the store; I/O lives in services.
- Components must not import from `@/services`.
- Use design tokens (`bg-surface`, `text-muted` …), never raw hex colors in components.
- Variants (`size`, `variant`) are shared and consistent across atoms.
- No `console.*`, no `any`, no unused exports, no eslint-disable comments.
- Every effect/subscription/timer returns a cleanup.
- Keep files ≤ 200 lines; split when larger.
- Before each commit run the `/verify` command; tick the checklist rows the step completes.
- Husky runs lint-staged (pre-commit), commitlint (commit-msg) and typecheck + tests (pre-push). Never use `--no-verify`.
- No backend: all data comes from `src/services` mocks.
- Working docs (plans, checklists, notes, audit reports) stay local: put them in `/docs/`, `PLAN.md` or `*.local.md`, which are git-ignored. Only the README and the app code are committed.
