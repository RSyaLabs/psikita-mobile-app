# PsiKita Project Instructions & Memory Binding

## 1. Single Source of Truth: Obsidian Vault

- **Primary Architecture Document**: `C:\Users\Dragon\Documents\Obsidian Vault\_Projects\psikita-mobile.md`
- **Component Styling Standards**: `C:\Users\Dragon\Documents\Obsidian Vault\_Projects\gluestack-ui-reference.md`
- **Backend Bug Report**: `BACKEND_BUG_REPORT_AND_FIXES.md` in repository root.

## 2. Strict Rules for PsiKita

- **UI Architecture**: 100% Gluestack UI v5 (`@/components/ui`) and NativeWind v4 semantic classes (`bg-background`, `bg-card`, `bg-primary`, `text-foreground`, etc.). ZERO raw hex codes and ZERO primitive React Native text/view components without Gluestack wrapper.
- **Before Any Changes**: Read `_Projects/psikita-mobile.md` to understand the 39-screen flow and route definitions.
- **After Any Changes**: Update `_Projects/psikita-mobile.md` with new test results, solved bugs, or component changes.

## 3. Verification Gate (MANDATORY)

Run from `mobile/` after ANY `.ts`/`.tsx` change, before reporting completion:

```sh
npx tsc --noEmit --incremental   # typecheck, must be 0 errors (~3s warm, ~8s cold)
npm run test:ci                  # every suite and test must pass. Verified 2026-09-30: 52 suites / 409 tests, 409 passing, 0 failing, exit 0. The --forceExit requirement is gone: the same command exits 0 without it, so the note that recorded it as mandatory was stale.
```

**OpenCode V2 has no LSP, so this command is the only type feedback you get.** `--incremental` keeps it near 3s via `tsconfig.tsbuildinfo`, so run it **after every edit**, not just at the end. Do not skip it and hope.

- Never claim done without pasting the real command output.
- If a gate cannot run, say so. Do not assume success.
- A failing gate is a failed task, even if the diff looks right.
- Do not refactor code outside the stated scope.
- Do not launch parallel subagents that write to the same file.

## 4. Bug Fix Protocol (MANDATORY)

1. **Reproduce first.** Write or run a test that fails for the exact reported bug. No test, no fix.
2. **Then fix** the narrowest responsible layer.
3. **Gate it** (section 3), then confirm the new test passes.

- If a bug cannot be reproduced in a test, stop and report that. Do not fix it speculatively.

## 5. Review Pass (MANDATORY before finishing)

For any change touching more than 2 files, or any change to a screen, hook, or API service:

- Delegate to the `reviewer` subagent with the actual `git diff` as scope.
- Reviewer reports severity-ordered findings: correctness, regression, missing tests, over-engineering.
- Address every correctness and regression finding before reporting done.
- Typecheck does NOT substitute for this. It cannot see logic errors, contract drift, or bloat.

## 6. Autonomous Operating Principles

- **Bug Fixing**: Investigate root cause before editing (`systematic-debugging`).
- **Feature Work**: Brainstorm and present plan before implementing (`superpowers`).
- **Code Simplicity**: Apply Ponytail YAGNI ladder — simplest robust code that satisfies requirements.
