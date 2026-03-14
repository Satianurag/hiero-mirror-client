# Contributing to hiero-mirror-client

Thank you for your interest in contributing! This document covers everything you need to get started.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [DCO Sign-Off](#dco-sign-off)
- [GPG Signing](#gpg-signing)

---

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold it. Please report unacceptable behaviour to the maintainers via GitHub Issues.

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/hiero-mirror-client.git
   cd hiero-mirror-client
   ```
3. Add the upstream remote so you can pull in future changes:
   ```bash
   git remote add upstream https://github.com/Satianurag/hiero-mirror-client.git
   ```

---

## Development Setup

### Prerequisites

- **Node.js ≥ 22** (see `engines` in `package.json`)
- **npm ≥ 10**

### Install dependencies

```bash
npm ci
```

### Available scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript → `dist/` (ESM + CJS) |
| `npm run check` | Lint & format check (Biome) |
| `npm run check:fix` | Auto-fix lint & format issues |
| `npm run typecheck` | TypeScript type-check (no emit) |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:integration` | Run integration tests (requires network) |
| `npm run docs` | Generate TypeDoc API documentation |
| `npm run generate` | Regenerate OpenAPI types from live spec |
| `npm run check:drift` | Detect OpenAPI spec drift |

### Linting & formatting

This project uses [Biome](https://biomejs.dev/) for linting and formatting. Run before committing:

```bash
npm run check:fix
npm run typecheck
```

CI will fail if either check fails.

---

## Project Structure

```
src/
  client.ts          # MirrorNodeClient — main entry point
  errors/            # Typed error hierarchy (HieroError subclasses)
  http/              # HttpClient (fetch wrapper, retry, rate-limit, ETag)
  mappers/           # Raw API response → typed domain object converters
  pagination/        # Paginator (3 patterns) + TopicStream
  resources/         # One file per API resource group (accounts, tokens, …)
  types/             # TypeScript type definitions (generated + hand-written)
  utils/             # Public encoding & timestamp utilities
  validation/        # Input validation helpers
tests/
  unit/              # Unit tests (no network)
  integration/       # Integration tests (live Mirror Node)
```

---

## Making Changes

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feat/my-feature
   ```
2. Make your changes. Keep commits small and focused.
3. Run checks locally before pushing:
   ```bash
   npm run check:fix
   npm run typecheck
   npm test
   ```
4. Push your branch and open a Pull Request against `main`.

### Guidelines

- **No breaking changes** without prior discussion in an issue.
- **No new runtime dependencies** without discussion — the library has a strict bundle-size budget (100 KB ESM).
- **Type safety first** — avoid `any`, `as unknown`, or non-null assertions unless absolutely necessary and documented.
- **Follow existing patterns** — look at neighbouring files before adding new ones.
- **Int64 safety** — all large integer fields must be returned as strings, never as `number`.

---

## Commit Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`.

Examples:
```
feat(accounts): add getPendingAirdrops method
fix(http): handle 429 Retry-After header correctly
docs: update README pagination examples
```

---

## Pull Request Process

1. Ensure all CI checks pass (lint, typecheck, unit tests, build, API surface check).
2. Fill in the PR description — what changed and why.
3. Link any related issues with `Closes #<issue>`.
4. A maintainer will review and may request changes.
5. Once approved, the maintainer will merge using **squash merge**.

---

## DCO Sign-Off

This project uses the [Developer Certificate of Origin (DCO)](https://developercertificate.org/) to certify that contributors have the right to submit their contributions.

Every commit must include a `Signed-off-by` trailer:

```
Signed-off-by: Your Name <your.email@example.com>
```

The easiest way is to pass `-s` (or `--signoff`) to `git commit`:

```bash
git commit -s -m "feat: my awesome change"
```

> **Note:** The name and email must match your Git identity (`git config user.name` / `git config user.email`).

If you forget to sign off, you can amend the last commit:

```bash
git commit --amend --signoff
```

Or sign off multiple commits at once (replace `N` with the number of commits):

```bash
git rebase HEAD~N --signoff
```

---

## GPG Signing

GPG-signed commits provide cryptographic proof of authorship. While not strictly required for every contribution, it is strongly encouraged and required for maintainer commits.

See the [GPG Signing Setup](#gpg-signing-setup) section in the README or follow the [GitHub guide on signing commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits).

Quick setup:

```bash
# List your GPG keys
gpg --list-secret-keys --keyid-format=long

# Tell Git which key to use (replace KEY_ID with your key ID)
git config --global user.signingkey KEY_ID

# Sign commits automatically
git config --global commit.gpgsign true
```

---

## Questions?

Open a [GitHub Issue](https://github.com/Satianurag/hiero-mirror-client/issues) or start a [Discussion](https://github.com/Satianurag/hiero-mirror-client/discussions).
