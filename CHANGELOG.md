# @satianurag/hiero-mirror-client

## 0.2.0

### Minor Changes

- [`d67ad48`](https://github.com/Satianurag/hiero-mirror-client/commit/d67ad48e7ac93ecf5b7eef25e46cc1c810ef2f25) Thanks [@Satianurag](https://github.com/Satianurag)! - # Major Refactoring and Modernization (22 Improvements)

  This release implements a massive overhaul of the SDK, addressing all 22 improvements identified in the March 2026 codebase analysis report.

  **Performance & Reliability**

  - Added LRU eviction, TTL, and max size limits to the HTTP ETag cache.
  - Fixed critical `EventEmitter` memory leaks in `sleep()` and `acquire()` mechanisms used by retry logic and rate-limiting.
  - Optimized `handleResponse` caching logic to bypass response parsing entirely on `304 Not Modified` and `204 No Content`.
  - Replaced custom/manual timeouts with native, modern `AbortSignal.any()` and `AbortSignal.timeout()`.
  - Implemented a fast-path for Base64 decoding using `Buffer.from()` (up to 10x faster) when available.
  - Used loss-less JSON parsing safely on error responses to prevent `int64` truncation.

  **Modernization & Developer Experience**

  - Upgraded target to Node.js 22+ (`ES2024`) and enabled `verbatimModuleSyntax`.
  - Implemented modern TC39 Resource Management (`Disposable` and `AsyncDisposable`) for both `Paginator` and `TopicStream`.
  - Added a robust `.toArray()` auto-pagination convenience method to `Paginator`.
  - Replaced the brittle build-time constant replacement with a native `createRequire` solution to inject `VERSION` dynamically.
  - Extensively documented over 40 missing SDK interfaces across 11 files with detailed JSDoc comments.
  - Added strict typings for `getOpcodes()` and deduplicated the `Logger` interface.
  - Removed dead and unused API deduplication code.

  **CI & Operations**

  - Established a bundle size hard-limit (< 25kB) checked automatically in CI via `size-limit`.
  - Added end-to-end Integration Tests that run against the Hedera Testnet in the CI pipeline (push to main).
  - Enabled NPM Provenance (OIDC) through GitHub Actions for highly secure, cryptographically signed releases.
  - Automated rich changelog generation via GitHub PR integration (`@changesets/changelog-github`).

## 0.1.0

### Minor Changes

- a25e8f1: Initial release — SDK for Hedera Mirror Node REST API

  - Full TypeScript client for all Mirror Node REST endpoints
  - Safe JSON parsing (int64 precision preservation)
  - Automatic pagination with three ergonomic patterns
  - Adaptive polling for HCS topic messages
  - ETag-based conditional request caching
  - Comprehensive error hierarchy with typed subclasses
  - Cross-platform encoding and timestamp utilities
  - Dual ESM/CJS output with full type declarations
