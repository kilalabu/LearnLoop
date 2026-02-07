---
name: validate-changes
description: "Validates code changes by running type checking, build, and tests in sequence. Use after implementing features, fixing bugs, or making any code changes to learn-loop-studio. Triggers on: 'validate', 'check changes', 'run checks', 'verify build'."
---

# Validate Changes

Runs the standard validation pipeline for learn-loop-studio after code changes.

## Validation Pipeline

Execute in order, stopping on first failure:

```bash
cd learn-loop-studio

# Step 1: Type check
npx tsc --noEmit

# Step 2: Build
npm run build

# Step 3: Tests
npm test
```

## On Failure

- **Type errors**: Fix type issues, then re-run from Step 1
- **Build errors**: Check for import issues or missing modules, then re-run from Step 1
- **Test failures**: Read failing test output, fix the issue, re-run `npm test`

## On Success

Report: all checks passed (type check, build, tests).
