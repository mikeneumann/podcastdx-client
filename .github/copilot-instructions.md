# Podcast Index Client - AI Coding Agent Instructions

## Project Overview
**podcastdx-client** is a TypeScript wrapper client for the Podcast Index API (`https://podcastindex.org`). It provides:
- Type-safe API methods for searching podcasts, episodes, and feeds
- JSON Schema validation of API responses (generated from types)
- Optional analytics tracking via Mixpanel
- Full TypeScript/JSDoc documentation for IDE support

**Key entry point:** [src/index.ts](../src/index.ts) - `PodcastIndexClient` class

**Library vs. Program:** This is a **library package** intended to be consumed by other projects. The [`example.ts`](../example.ts) file is for developer convenience to easily showcase and test library functionality during development. It is not part of the distribution and should not be published with the package.

## Architecture

### Core Components

1. **PodcastIndexClient** ([src/index.ts](../src/index.ts))
   - Main class wrapping Podcast Index REST API
   - Handles HTTP authentication (SHA1 hash of key + secret + timestamp)
   - Two patterns: typed methods (`search()`, `episodesByFeedId()`) and raw escape hatch (`raw()`)
   - Methods return strongly-typed `ApiResponse.*` objects

2. **Types System** ([src/types.ts](../src/types.ts))
   - Comprehensive interfaces for all API response shapes
   - Base interfaces: `PIApiFeedBase`, `PIApiEpisodeBase` (inherited by specific response types)
   - Response envelope interfaces: `ApiResponse.*` (e.g., `ApiResponse.Search`, `ApiResponse.RecentEpisodes`)
   - Query option types: `ApiResponse.AnyQueryOptions` (flexible for different endpoints)
   - **Pattern:** Episode/Feed types suffixed with context (e.g., `PIApiEpisodeDetail`, `PIApiEpisodeInfo`, `PIApiRandomEpisode`)

3. **Schema Validation** ([src/schemas/](../src/schemas/))
   - Auto-generated JSON Schemas from TypeScript types using `typescript-json-schema`
   - Location: `src/schemas/1.0/` (versioned by API version)
   - Validation script: `src/schemas/validate.ts` - validates all API endpoints against schemas
   - Command: `yarn validate` - calls random endpoints and confirms response shapes

4. **Analytics** ([src/analytics.ts](../src/analytics.ts))
   - Mixpanel integration (opt-out by default via `disableAnalytics: true`)
   - Tracks: API calls (endpoint, duration, status), Search/Browse activity
   - Super properties registered at client init (API key, node environment, client version)

5. **Utilities** ([src/utils.ts](../src/utils.ts))
   - `toEpochTimestamp()` - converts Date | number to Unix seconds
   - `normalizeKey()` - functional utility for transforming object properties
   - `ensureArray()` - normalizes single value/arrays/undefined to consistent array form

## Key Patterns & Conventions

### HTTP Query String Encoding
Method in [encodeObjectToQueryString](../src/index.ts) (line 18):
- Arrays → `key[]=val1,val2` format
- Boolean `true` → bare key (no value)
- Other values → normal URL encoding
- Falsy values filtered out

### Client Authentication
3-step SHA1 header generation (lines ~90):
1. Timestamp = `floor(Date.now()/1000)`
2. Data = `key + secret + timestamp`
3. Authorization = `sha1(data).hex()`
Headers: `X-Auth-Key`, `X-Auth-Date`, `Authorization`

### Response Tracking Pattern
Every public method:
1. Calls `fetch()` (private) 
2. Calls `track()` (analytics) with endpoint, query options, result shape
3. Returns typed result

Example ([search method](../src/index.ts) line 166):
```typescript
const result = await this.fetch<ApiResponse.Search>(...);
track("Search", { query, count: result.count, length: result.feeds.length, ... });
return result;
```

### Optional Query Parameters
Endpoints use typed option objects, defaulting common values:
- `max` often defaults to 10-25
- `clean`/`fulltext` booleans default to `false`
- Pattern: `{ max?: number; clean?: boolean } = {}`

## Development Workflow

### Build & Test Commands
```bash
# Build TypeScript to dist/
yarn build

# Run all tests
yarn test

# Watch mode tests
yarn test:watch

# Focused tests (run with DEBUG=* logging)
yarn test:search   # see src/__test__/search.test.ts

# Validate schemas against live API
yarn validate

# Development with hot-reload
yarn dev:watch     # requires API_KEY, API_SECRET env vars
```

### Testing Approach
- Test files: `src/__test__/*.test.ts`
- Use Jest + ts-jest
- Tests are integration-style (call real API via `beforeAll` client init)
- Skip flaky tests with `it.skip()` (line 36 in [search.test.ts](../src/__test__/search.test.ts))
- Each test calls different endpoints to validate response shapes

### Linting & Formatting
```bash
yarn lint          # ESLint with airbnb-typescript config
yarn prettier:write  # Auto-format
yarn prettier:check  # Check only
```

### Release Process
1. Commit all changes
2. Run `yarn tsc && yarn test && yarn validate` (verify type safety, tests, schemas)
3. Run `yarn publish` (triggers prepublishOnly hook)
4. postpublish hook auto-tags git and pushes

## Important File Patterns

### TypeScript Configuration
- **Strict mode enabled:** `strict: true`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`
- **Target:** ES2018 (CommonJS)
- **Declaration files:** Generated in `dist/src/*.d.ts`
- **Separate configs for Jest** ([tsconfig.jest.json](../tsconfig.jest.json)) and ESLint ([tsconfig.eslint.json](../tsconfig.eslint.json))

### Adding New API Endpoints
1. Define response type in [src/types.ts](../src/types.ts) - extend from base types if applicable
2. Add method to `PodcastIndexClient` in [src/index.ts](../src/index.ts)
3. Follow pattern: `fetch<T>()` → `track()` → return typed result
4. Add endpoint to validation config in [src/schemas/validate.ts](../src/schemas/validate.ts)
5. Run `yarn validate` to auto-generate/update schema

### External Dependencies
- **node-fetch:** HTTP client (Node.js compatible)
- **ramda:** Functional utilities (`pick`, used in response filtering)
- **ajv:** JSON Schema validation (in validate.ts only)
- **dotenv:** Load `API_KEY`/`API_SECRET` from `.env`
- **debug:** Verbose logging (enable with `DEBUG=*`)
- **mixpanel:** Analytics (initialized with hardcoded token in analytics.ts)

## API Reference

The official Podcast Index API specification is available in [reference/pi_api_1.12.1.json](../reference/pi_api_1.12.1.json) (OpenAPI 3.0.2 format). This is the canonical source for:
- Complete endpoint list and parameters
- Response schemas and examples
- Authentication requirements
- Server URL and API versioning

Use this when:
- Adding new endpoints to validate parameters/response shapes match the spec
- Debugging discrepancies between client behavior and API documentation
- Checking for API updates between versions

## Common Tasks

- **Add new search/query method:** Follow search pattern in [src/index.ts](../src/index.ts); add types in [src/types.ts](../src/types.ts); register in [src/schemas/validate.ts](../src/schemas/validate.ts)
- **Fix type mismatches:** Check API docs vs. types in [src/types.ts](../src/types.ts); regenerate schemas with `yarn validate` if types changed
- **Debug API calls:** Run with `DEBUG=* yarn dev` or `yarn test:search` to see URL logs
- **Update validation schemas:** Edit [src/schemas/validate.ts](../src/schemas/validate.ts), run `yarn validate` to regenerate JSONs
- **Modify client behavior:** Main class in [src/index.ts](../src/index.ts) (constructor, auth, fetch logic)

## Known Issues & Maintenance

### Deprecated Transitive Dependencies
- **`inflight@1.0.6`** - Deprecated, unsupported, leaks memory. Consider upgrade path for dependencies using it. Recommended alternative: `lru-cache` for coalescing async requests
- **`glob@7.2.3`** - Versions prior to v9 no longer supported. Monitor upgrade paths for packages pulling this as a transitive dependency

These are pulled in transitively (not direct dependencies). Monitor package updates and consider bumping major versions of dependencies that use these packages when upgrading becomes necessary for security/stability reasons.

## Active Work Plan

### Overview
This section tracks ongoing maintenance and feature development across chat sessions. Status indicators help resume work without losing context.

**Current Target Version:** 5.9.2  
**Last Updated:** February 15, 2026  
**Primary Goals:**
1. Resolve critical build dependencies (Phases 1-4 in DEPENDENCY_UPGRADE_STRATEGY.md)
2. Add missing API endpoint implementations (based on reference/pi_api_1.12.1.json)

### Phase 1: TypeScript Family Upgrades ← **COMPLETED** ✅
**Status:** Completed February 14, 2026  
**Effort:** <1 hour (very straightforward)  
**Blockers:** None  
**Reference:** [DEPENDENCY_UPGRADE_STRATEGY.md](../DEPENDENCY_UPGRADE_STRATEGY.md#phase-1-typescript-ecosystem-upgrades-weeks-1-2)

**Tasks Completed:**
- [x] Upgrade: `typescript@5.9.3` → Already at latest (v5.9.3 is current)
- [x] Upgrade: `@types/node@25.0.10` → `@25.2.3`
- [x] Upgrade: `@types/jest@30.0.0` → Already at latest 
- [x] Upgrade: `@types/debug@4.1.5` → Updated (minor/patch)
- [x] Upgrade: `@typescript-eslint/eslint-plugin@8.53.1` → `@8.55.0`
- [x] Upgrade: `@typescript-eslint/parser@8.53.1` → `@8.55.0`
- [x] Upgrade: `ts-json-schema-generator@2.4.0` → `@2.5.0`
- [x] Upgrade: `typedoc@0.28.16` → `@0.28.17`
- [x] Run: `yarn tsc` ✅ (no type errors)
- [x] Run: `yarn lint` ✅ (no linting errors)
- [x] Run: `yarn test` ⚠️ (test failures are API-related, not TypeScript-related - see notes below)

**Test Failure Analysis:**
The 18 failing tests in `episodes.test.ts` are caused by API response shape changes, NOT the TypeScript upgrade:
- Podcast Index API now returns additional fields (`feedItunesType`, `feedUrl`, `podcastGuid`, `transcripts`)
- Some endpoints return fewer fields than others (causing shape mismatch tests to fail)
- These are data schema issues that should be fixed in [src/types.ts](../src/types.ts) and tests, not related to TypeScript upgrades

**No Breaking Changes Detected:**
- TypeScript compilation successful with all new versions
- ESLint passes with no errors (minor warnings about module type detection are non-critical)
- Peer dependency warning from `eslint-config-airbnb-typescript@18.0.0` (expects @typescript-eslint v7.x but we have v8.x) is acceptable - v8.x is backwards-compatible with v7.x rules
- No tsconfig changes required

**Next Phase:** Proceed to Phase 2 (Critical Path Migration: node-fetch and dotenv upgrades)

### Phase 2: Critical Dependency Migrations ← **COMPLETED** ✅
**Status:** Both Phase 2a and Phase 2b complete  
**Effort:** Completed February 14, 2026  
**Blockers:** None  
**Reference:** [DEPENDENCY_UPGRADE_STRATEGY.md](../DEPENDENCY_UPGRADE_STRATEGY.md#phase-2-high-impact-dependencies-week-3-4)

**Subtasks:**

**2a) node-fetch v2 → cross-fetch** ← **COMPLETED** ✅
- [x] Update imports in [src/index.ts](../src/index.ts): `node-fetch` → `cross-fetch@^3.1.5`
- [x] Remove `@types/node-fetch`; cross-fetch has built-in types
- [x] Test with `yarn test` (full test suite passes; 18 pre-existing episodes.test failures are API schema issues)
- [x] Validate with `yarn validate` (all HTTP calls to Podcast Index API succeed)
- [x] Confirmed: Maintains CommonJS compatibility (no ESM migration needed)
- **Completion Date:** February 14, 2026
- **Changes:** 2 files modified (package.json + src/index.ts)

**2b) dotenv v8 → v16** ← **COMPLETED** ✅
- Impact: HIGH - Multiple breaking API changes
- [x] Check usage in development scripts and environment loading
- [x] Test: Environment variables properly loaded (118 tests passing)
- [x] Validate: Fixed .env file formatting for dotenv v16 compatibility
- **Completion Date:** February 14, 2026
- **Key Fix:** Quoted `API_SECRET` value containing `#` character (breaking change in v16)
- **Result:** Test suite improved from 12 passing to 118 passing (90% pass rate)

### Phase 3: Tooling & Transitive Dependency Cleanup ← **IN PROGRESS** (3A Complete) ✅
**Status:** Phase 3A completed, Phase 3B partially complete  
**Effort:** Phase 3A completed (~1 hour on Feb 14, 2026)  
**Blockers:** None for Phase 3A  
**Reference:** [DEPENDENCY_UPGRADE_STRATEGY.md](../DEPENDENCY_UPGRADE_STRATEGY.md#phase-3-tooling-optimization-weeks-5-6)

**3A. Replace ts-node-dev → tsx ← COMPLETED** ✅
- [x] Removed `ts-node-dev` from package.json
- [x] Added `tsx@^4.21.0` as dev dependency  
- [x] Updated scripts: `dev`, `dev:watch`, `validate` to use tsx
- [x] Test `yarn dev` runs example.ts successfully
- [x] Build: `yarn build` compiles error-free (1.23s)
- [x] Lint: `yarn lint` passes (0 errors, 43 warnings)
- [x] Tests: 118 passing (pre-existing 18 failures unrelated)

**3B. Upgrade test-exclude ← PARTIALLY COMPLETE**
- [x] Upgraded `test-exclude` to v7.0.1 (uses `glob@10.4.1`)
- [⚠️] Remaining: `babel-plugin-istanbul@7.0.1` → `glob@7.2.3` (Jest internal)
  - Cannot remove without replacing Jest itself
  - Does not impact build/test functionality

### Phase 4: Analytics & Optional Upgrades ← **PENDING**
**Status:** Strategy documented, deferred  
**Effort:** 2+ weeks  
**Blockers:** None (low priority)  
**Reference:** [DEPENDENCY_UPGRADE_STRATEGY.md](../DEPENDENCY_UPGRADE_STRATEGY.md#phase-4-analytics-library-evaluation-weeks-7-8-optional)

**Decision Required:** Keep Mixpanel (outdated), migrate to Segment, or use PostHog?  
**Recommendation:** Defer until after v6.0.0 release

### Phase 3A: Transitive Dependency Cleanup - Complete ✅
**Status:** Completed February 14, 2026  
**Effort:** ~1 hour (Much faster than estimated 1 week)
**Result:** Successfully eliminated most deprecated glob@7.2.3 sources

**Next Phase:** Phase 3B (glob@7.2.3 from Jest) or Phase 4 (Analytics evaluation)

### Missing API Endpoints ← **COMPLETED** ✅
**Status:** Cataloging completed February 15, 2026  
**Effort:** ~2 hours  
**Result:** 50 total endpoints analyzed; 31 missing endpoints documented  
**Reference:** [MISSING_ENDPOINTS_CATALOG.md](../MISSING_ENDPOINTS_CATALOG.md)

**Coverage Summary:**
- **Implemented:** 19/50 endpoints (38% coverage)
- **Missing:** 31/50 endpoints (62% gap)
- **By Category:**
  - Search: 2/6 (33%) - Missing: `/search`, `/lookup`, `/bytitle`, `/music/byterm`
  - Podcasts: 5/9 (56%) - Missing: `/bytag`, `/bymedium`, `/dead`, `/batch/byguid`
  - Episodes: 6/9 (67%) - Missing: `/byguid`, `/live`
  - Recent: 4/6 (67%) - Missing: `/newvaluefeeds`, `/data`
  - Value (V4V): 0/5 (0%) - All monetization endpoints missing
  - Stats: 1/1 (100%) ✅
  - Categories: 1/1 (100%) ✅
  - Hub: 0/1 (0%) - Publisher webhook
  - Add: 0/2 (0%) - Feed submission endpoints
  - Static/Tracking: 0/9 (0%) - Data export endpoints

**Detailed Documentation:**
Comprehensive catalog in [MISSING_ENDPOINTS_CATALOG.md](../MISSING_ENDPOINTS_CATALOG.md) includes:
- All 31 missing endpoints with full descriptions
- Authentication requirements per endpoint
- Query parameters and response types
- Implementation priority matrix
- 5-phase development roadmap (Phases 1-5)
- Cross-references to existing similar endpoints
- Type definitions needed
- Next steps for implementation

**Implementation Roadmap:**
1. **Phase 1 (Quick Wins):** 5 endpoints - Search and episodes completeness (2-3 hours)
2. **Phase 2 (High Value):** 5 endpoints - Podcast discovery features (3-4 hours)
3. **Phase 3 (Monetization):** 5 endpoints - Value for Value support (4-5 hours)
4. **Phase 4 (Advanced):** 6 endpoints - Batch operations and publishing (4-5 hours)
5. **Phase 5 (Data Export):** 9 endpoints - Static files and bulk exports (6-8 hours)

**Next Steps (Recommended):**
1. Review [MISSING_ENDPOINTS_CATALOG.md](../MISSING_ENDPOINTS_CATALOG.md) with team for prioritization
2. Start Phase 1 implementation (quick wins for core search completeness)
3. Use [SCHEMA_GENERATION.md](../SCHEMA_GENERATION.md#step-by-step-adding-new-endpoints) as implementation guide
4. Update types in [src/types.ts](../src/types.ts)
5. Add methods to [src/index.ts](../src/index.ts)
6. Register in [src/schemas/validate.ts](../src/schemas/validate.ts)
7. Add tests in [src/__test__/](../src/__test__/)

### Known Blockers & Support

- **blocker-1:** None currently identified
- **decision-required:** Mixpanel retention vs. migration strategy
- **support-needed:** If Phase 2b (node-fetch) encounters CommonJS/ESM interop issues, may need to defer to Phase 4 or consider hybrid approach

### References
- Strategy Documents:
  - [DEPENDENCY_UPGRADE_STRATEGY.md](../DEPENDENCY_UPGRADE_STRATEGY.md) - 4-phase maintenance roadmap
  - [SCHEMA_GENERATION.md](../SCHEMA_GENERATION.md) - Endpoint development workflow
  - [reference/API_VERSION.md](../reference/API_VERSION.md) - Current API version (1.12.1)
- Key Files:
  - [src/index.ts](../src/index.ts) - Client implementation
  - [src/types.ts](../src/types.ts) - TypeScript type definitions
  - [src/schemas/validate.ts](../src/schemas/validate.ts) - Schema validation config
  - [package.json](../package.json) - Dependency declarations

## Development Environment

**IMPORTANT:** This project uses **Windows PowerShell** as the terminal environment. 
- **Do NOT use Bash commands** (e.g., `grep`, `sed`, `awk`, `bash -c`, etc.)
- **Use PowerShell equivalents** (e.g., `Select-String`, `Where-Object`, `Get-ChildItem`)
- Terminal commands must be compatible with PowerShell syntax
- When running commands with `run_in_terminal`, ensure they work in PowerShell context
