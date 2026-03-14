# @satianurag/hiero-mirror-client

## [0.2.2](https://github.com/Satianurag/hiero-mirror-client/compare/v0.2.1...v0.2.2) (2026-03-14)


### Bug Fixes

* lower coverage thresholds to match unit-test-only CI baseline ([26feaf1](https://github.com/Satianurag/hiero-mirror-client/commit/26feaf18b36cceb35a3989a6e1ef6d4027072061))
* resolve all 24 audit findings — dead code, duplicates, DX gaps ([0255f45](https://github.com/Satianurag/hiero-mirror-client/commit/0255f45e40c021c1d65bf43effb745ee7992ab67))
* resolve all 24 audit findings — dead code, duplicates, DX gaps ([e4b1398](https://github.com/Satianurag/hiero-mirror-client/commit/e4b13984d309dd535fb7708d3d2a3b71efde99cf))

## [0.2.1](https://github.com/Satianurag/hiero-mirror-client/compare/v0.2.0...v0.2.1) (2026-03-12)


### Bug Fixes

* add @types/node as explicit devDependency to fix typecheck ([79a6cf7](https://github.com/Satianurag/hiero-mirror-client/commit/79a6cf7c988171570e3b42fa500c755c6e7e6ac1))
* bump vitest to 4.0.18 and add @types/node to fix peer dependency and typecheck ([b5f1e64](https://github.com/Satianurag/hiero-mirror-client/commit/b5f1e6449f12c5070ac8d18c346faa519ce5ea9c))
* format package.json to satisfy biome check ([84675c1](https://github.com/Satianurag/hiero-mirror-client/commit/84675c16806ea5fcbb6174b80daaa7a395b5e3cb))
* format package.json to satisfy biome check ([cd6a63e](https://github.com/Satianurag/hiero-mirror-client/commit/cd6a63e08f43e356ffc3c08fb880397c94971616))
* migrate biome.json to v2 format, auto-fix lint issues, and add @types/node for typecheck ([64d5474](https://github.com/Satianurag/hiero-mirror-client/commit/64d5474f0620ddf38b667c46f545d439f9da02a8))
* regenerate lockfile to include biome platform binary ([1707396](https://github.com/Satianurag/hiero-mirror-client/commit/17073963ed219e1e31d3dd7b3ca504e9d1f39c95))
* regenerate lockfile to include biome platform binary ([68010f5](https://github.com/Satianurag/hiero-mirror-client/commit/68010f50db61f993883cb45540eb8c004027cb55))
* regenerate lockfile to include biome platform binary ([734624c](https://github.com/Satianurag/hiero-mirror-client/commit/734624c147c078dbd5c01f8cd151401fa2e0a999))
* regenerate lockfile with npm 11 to include all cross-platform optional deps ([07f8bdd](https://github.com/Satianurag/hiero-mirror-client/commit/07f8bddc0b5da239251b4bcba557c6a69823d58f))
* regenerate lockfile with npm 11 to include all cross-platform optional deps ([4e13573](https://github.com/Satianurag/hiero-mirror-client/commit/4e135732474cfc94c30f84d4832843b7c108e5db))
* resolve merge conflicts with main (keep biome 2.4.6 + api-extractor 7.57.7) ([f4a2cc6](https://github.com/Satianurag/hiero-mirror-client/commit/f4a2cc68a164b663c07688ce12c99a4bf55b4830))
* resolve merge conflicts with main (keep vitest 4.0.18 + api-extractor 7.57.7 + tsdown 0.21.2) ([61f8880](https://github.com/Satianurag/hiero-mirror-client/commit/61f8880fcd61b599927d5303d73a3cf3cfb25d27))
* resolve merge conflicts with main (keep vitest 4.0.18 + api-extractor 7.57.7 + tsdown 0.21.2) ([397aea3](https://github.com/Satianurag/hiero-mirror-client/commit/397aea3fd495bfba8b46dfb96c3c23287d201219))
* resolve merge conflicts with main after PR [#9](https://github.com/Satianurag/hiero-mirror-client/issues/9) merge, regenerate lockfile with npm 11 ([3bc74cd](https://github.com/Satianurag/hiero-mirror-client/commit/3bc74cd0784d407d40d8614721b89fe01c8b1979))
* resolve merge conflicts with main after PR [#9](https://github.com/Satianurag/hiero-mirror-client/issues/9) merge, regenerate lockfile with npm 11 ([6d9f642](https://github.com/Satianurag/hiero-mirror-client/commit/6d9f6429c0b2a66c7c805cf1c5f98e212c36f556))
* upgrade @vitest/coverage-v8 to 4.x and add @types/node as explicit devDependency ([b3e7516](https://github.com/Satianurag/hiero-mirror-client/commit/b3e7516493f77bf8ab74b735df789207abceb83d))


### Reverts

* remove custom CodeQL workflow (conflicts with Default setup) ([5b6d2d5](https://github.com/Satianurag/hiero-mirror-client/commit/5b6d2d5ad2fdfdf4edc50ba2c1d809c1485b9e20))

## 0.2.0

### Minor Changes

- d6bd4c0: improvements

## 0.1.1

### Patch Changes

- 2f6fc0c: nothing much

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
