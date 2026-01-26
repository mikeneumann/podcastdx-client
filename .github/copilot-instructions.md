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
