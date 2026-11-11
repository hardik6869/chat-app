---
description: Implement the next unfinished step from PLAN.md and commit it
argument-hint: '[step number, optional]'
---

1. Read `PLAN.md` §6 and `git log --oneline`. Pick step $ARGUMENTS, or the first step whose
   commit message is not in the log yet.
2. Read the `docs/REQUIREMENTS_CHECKLIST.md` rows that belong to that step.
3. Build only that step, following `CLAUDE.md` and the `chat-component` skill for UI work.
4. Add or update tests for the behavior you built.
5. Run `/verify`. Fix everything until all checks pass.
6. Tick the checklist rows this step completed (☐ → ☑).
7. Commit with the exact message from PLAN.md §6 (`git add -A && git commit -m "<message>"`).
8. Report in 3–5 lines: what was built, what was verified, and the next step.
