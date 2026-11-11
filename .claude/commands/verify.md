---
description: Run all quality gates (lint, types, tests, build, unused code, console) before a commit
---

Run these from the project root and report each result as pass/fail with the failing output:

1. `npm run lint` — must show 0 errors and 0 warnings.
2. `npm run typecheck` — 0 errors.
3. `npm test -- --run` — all tests pass.
4. `npm run build` — succeeds.
5. `npm run knip` — no unused files, exports or dependencies.
6. Search `src/` for `console.` and `eslint-disable` — must find nothing.
7. Find new folders under `src/` without an `index.ts` barrel.
8. Find files under `src/` longer than 200 lines.

If anything fails, fix it and run the failed step again. Do not commit until everything passes.
Finish with a short table of the results.
