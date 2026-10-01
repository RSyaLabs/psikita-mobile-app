# PsiKita Project Instructions & Memory Binding

## 1. Single Source of Truth: Obsidian Vault

- **Primary Architecture Document**: `C:\Users\Dragon\Documents\Obsidian Vault\_Projects\psikita-mobile.md`
- **Component Styling Standards**: `C:\Users\Dragon\Documents\Obsidian Vault\_Projects\gluestack-ui-reference.md`
- **Backend Bug Report**: `BACKEND_BUG_REPORT_AND_FIXES.md` in repository root.

## 2. Strict Rules for PsiKita

- **UI Architecture**: 100% Gluestack UI v5 (`@/components/ui`) and NativeWind v4 semantic classes (`bg-background`, `bg-card`, `bg-primary`, `text-foreground`, etc.). ZERO raw hex codes and ZERO primitive React Native text/view components without Gluestack wrapper.
- **Before Any Changes**: Read `_Projects/psikita-mobile.md` to understand the 39-screen flow and route definitions.
- **After Any Changes**: Update `_Projects/psikita-mobile.md` with new test results, solved bugs, or component changes.

## 2a. Provider Order Is Load-Bearing (MANDATORY)

`mobile/app/_layout.tsx` nests providers in this exact order:

```
SafeAreaProvider > QueryProvider > AuthProvider > GluestackUIProvider > app tree
```

Query and auth go **above** Gluestack. Never move them below it.

**Why.** Gluestack's `OverlayProvider` lives inside `GluestackUIProvider`, and its
portal renders Modal content as _siblings_ of `props.children` rather than inside
them. Any provider nested below `GluestackUIProvider` is therefore invisible to
whatever a Modal renders, on web and native alike. A Modal child calling
`useMutation` / `useQueryClient` then throws `No QueryClient set, use
QueryClientProvider to set one`, and because `AppErrorBoundary` wraps the whole
app the user loses the entire screen, not just the modal.

This shipped as a real crash: `ForgotPasswordView` renders from inside
`ModalBody` and calls `useRequestOtp`. Pressing "Lupa kata sandi" replaced the
login screen with the error boundary.

**The test harness must mirror this.** `__tests__/utils/test-utils.tsx` used to
nest the query client _below_ Gluestack, i.e. the opposite of production, so the
passing `LoginForm` test that drives the whole forgot-password flow was asserting a
tree the app never runs. That is the only reason 409 green tests coexisted with a
crash. If you change one order, change both, and let
`__tests__/providers/modal-query-context.test.tsx` arbitrate — it pins the layout
order, the harness/production agreement, the portal behaviour, and a control that
asserts the broken order still throws.

## 3. Verification Gate (MANDATORY)

Run from `mobile/` after ANY `.ts`/`.tsx` change, before reporting completion:

```sh
npx tsc --noEmit --incremental   # typecheck, must be 0 errors (~3s warm, ~8s cold)
npm run test:ci                  # every suite and test must pass. Verified 2026-10-01: 55 suites / 480 tests, 480 passing, 0 failing, exit 0. The --forceExit requirement is gone: the same command exits 0 without it, so the note that recorded it as mandatory was stale.
```

**OpenCode V2 has no LSP, so this command is the only type feedback you get.** `--incremental` keeps it near 3s via `tsconfig.tsbuildinfo`, so run it **after every edit**, not just at the end. Do not skip it and hope.

- Never claim done without pasting the real command output.
- If a gate cannot run, say so. Do not assume success.
- A failing gate is a failed task, even if the diff looks right.
- Do not refactor code outside the stated scope.
- Do not launch parallel subagents that write to the same file.
- **A green suite is not proof on its own.** A gate passing proves the assertions
  you wrote hold; it cannot prove you asserted the right thing, or that the tree
  under test matches the tree that ships. Confirm new tests fail against the old
  code before trusting them, and check that test setup mirrors production.

### Known unverified areas

- **Native (iOS/Android) is not covered by the gate and has not been run on a
  device.** Claims about native behaviour in this repo are derived from
  `react-native-css-interop`'s property allowlist and react-native's own types,
  not from execution. Say so rather than implying it was tested.
- `heading/styles.tsx` puts `whitespace-pre-wrap` in the base class, which
  overrides the `nowrap` that Tailwind's `truncate` depends on. `isTruncated`
  therefore does **not** produce an ellipsis on web or native. Measured in the
  browser: computed `white-space` stays `pre-wrap` while `text-overflow` is
  `ellipsis`, so the ellipsis never engages. On web, headings wrap exactly as
  they did before 2026-10-01.

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
- When a reviewer flags a regression you introduced, verify the claim against the
  library source yourself before acting, then re-verify your own earlier evidence.
  Reviewers catch things you are attached to; so do you.

## 6. Cross-Platform Text Props

`numberOfLines` is a real react-native prop but reaches the DOM on web, where
`Heading` renders a real `<h1>` and `Text` renders a raw `<span>`, both of which
forward unknown props and make React warn. The pattern is:

```tsx
isTruncated
numberOfLines={Platform.OS === "web" ? undefined : 1}
```

Do not replace `numberOfLines` with `isTruncated` alone: on native,
`react-native-css-interop`'s 154-entry allowlist contains `overflow` but not
`text-overflow` or `white-space`, so `isTruncated` degrades to a bare
`overflow:hidden` with no clamping, and headings wrap. All 10 sites were
converted on 2026-10-01; a bare `numberOfLines={1}` on a `Heading` or `Text` means
the DOM warning has come back.

## 7. Autonomous Operating Principles

- **Bug Fixing**: Investigate root cause before editing (`systematic-debugging`).
- **Feature Work**: Brainstorm and present plan before implementing (`superpowers`).
- **Code Simplicity**: Apply Ponytail YAGNI ladder — simplest robust code that satisfies requirements.
