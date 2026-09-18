---
name: git-workflow
description: Git branching strategy, branch naming conventions, pull/push workflows, and PR policies for SalonOps Morocco.
---

# Git Workflow & Branching Strategy — SalonOps Morocco 🇲🇦

This skill provides step-by-step instructions for AI agents and developers on branching, naming, pulling, committing, and pushing code in the SalonOps repository.

---

## 1. Branch Architecture & Environments

The repository has three core branches:
- **`develop`**: The primary integration branch. **All tasks must branch off from and merge back into `develop`**.
- **`staging`**: Pre-production testing environment. Merges only from `develop`.
- **`main`**: Production release branch. Protected. Merges only from `staging` via release PRs. Direct pushes to `main` are strictly forbidden.

---

## 2. From Where to Pull (Starting Work)

Before creating a new branch or modifying files:

1. Switch to `develop`:
   ```bash
   git checkout develop
   ```
2. Pull the latest commits from origin:
   ```bash
   git pull origin develop
   ```
3. Check status:
   ```bash
   git status
   ```

---

## 3. Branch Naming Standard

Always create a dedicated branch off `develop` using this structure:

```text
<type>/SALON-<issue_id>-<kebab-case-description>
```

### Allowed Types:
- `feat/`: New feature or functional enhancement (e.g. `feat/SALON-26-appointment-redlock-engine`)
- `fix/`: Bug or defect fix (e.g. `fix/SALON-29-buffer-collision-overlap`)
- `refactor/`: Code refactoring without changing behavior (e.g. `refactor/SALON-24-clean-architecture-layers`)
- `test/`: Adding or updating tests (e.g. `test/SALON-30-split-payment-unit-tests`)
- `chore/`: Tooling, dependencies, or config changes (e.g. `chore/SALON-35-redis-rate-limiter-config`)
- `docs/`: Documentation updates only (e.g. `docs/SALON-36-seed-fixtures-guide`)

### Command Example:
```bash
git checkout -b feat/SALON-26-appointment-redlock-engine
```

---

## 4. Commit Message Standard

Follow **Conventional Commits** and always reference the Plane task key (`SALON-<id>`):

```text
<type>(<scope>): <summary> (SALON-<issue_id>)

[optional body explaining architectural decisions]
```

### Examples:
```bash
git commit -m "feat(api): implement appointment aggregate and redlock engine (SALON-26)"
git commit -m "fix(api): adjust chemical buffer overlap calculation in timeslot (SALON-29)"
git commit -m "refactor(domain): introduce money value object for MAD currency (SALON-30)"
```

---

## 5. How to Push & Open Pull Requests

### Pre-Push Local Validations
Always verify before pushing:
```bash
# 1. Monorepo typecheck
pnpm typecheck

# 2. Backend test suite
pnpm --filter @salonops/api test
```

### Push Command
Push your branch with upstream tracking:
```bash
git push -u origin <branch-name>
```

### Pull Request Rules:
1. **Target Base:** Always target **`develop`** (never `main` or `staging`).
2. **PR Title:** `[SALON-<id>] <Concise summary>` (e.g. `[SALON-26] Core Appointment Aggregate & Concurrency Redlock Engine`).
3. **PR Description:** Reference Plane issue, summarize changes across layers (`domain/`, `application/`, `infrastructure/`, `presentation/`), and include verification instructions.
4. **CI Validation:** Ensure all automated GitHub Actions checks pass before merging.
