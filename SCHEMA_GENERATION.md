# Schema Generation

This document explains how JSON schemas are generated and maintained in the podcastdx-client project.

## Overview

All JSON schemas in `src/schemas/` are **automatically generated from TypeScript type definitions**. The project uses a two-step validation and generation process to ensure schemas stay in sync with the actual Podcast Index API responses.

## Generation Architecture

### Source of Truth: TypeScript Types

All API response types are defined in [src/types.ts](src/types.ts). Examples:

```typescript
export namespace ApiResponse {
  export interface Search {
    status: string;
    feeds: PIApiFeed[];
    count: number;
  }

  export interface Episodes {
    status: string;
    episodes: PIApiEpisodeInfo[];
    count: number;
  }
}
```

### Step 1: Schema Generation from Types

The `ts-json-schema-generator` package converts TypeScript interfaces into JSON Schema format:

**Configuration:**
- **Input:** [src/types.ts](src/types.ts)
- **Tool:** `typescript-json-schema`
- **Flag:** `--noExtraProps` (strict mode: no extra properties allowed)
- **Output:** `src/schemas/1.0/{endpoint}.json`

```bash
# Example command
yarn typescript-json-schema ./tsconfig.json --noExtraProps \
  ApiResponse.Search \
  -o src/schemas/1.0/search-byterm.json
```

### Step 2: Live API Validation

The [src/schemas/validate.ts](src/schemas/validate.ts) script:

1. **Generates schemas** from TypeScript types using `ts-json-schema-generator`
2. **Calls live API endpoints** using `PodcastIndexClient` with random test data
3. **Validates responses** against generated schemas using `ajv` (JSON Schema validator)
4. **Writes schema files** to disk with metadata (title, endpoint URL)
5. **Reports mismatches** if API responses don't match the schema

```typescript
// Example endpoint configuration
{
  getResponse: () => client.search("politics"),
  endpoint: "/api/1.0/search/byterm",
  typeName: "ApiResponse.Search",
  title: "This call returns all of the feeds that match the search terms...",
}
```

## How to Regenerate Schemas

### Before Publishing

```bash
# This command is required in the release process
yarn validate

# Equivalent to running: ts-node -r tsconfig-paths/register src/schemas/validate.ts
```

**What this does:**
- Regenerates all JSON schema files
- Calls random API endpoints to fetch real response data
- Validates each response against the generated schema
- Warns if API behavior doesn't match TypeScript types
- Writes final schema files to `src/schemas/1.0/`

### When to Regenerate

1. **Before any release** (part of `yarn publish` prepublishOnly hook)
2. **After adding new API endpoints** to [src/index.ts](src/index.ts)
3. **After modifying API response types** in [src/types.ts](src/types.ts)
4. **After upgrading the Podcast Index API** if response shapes change

## Validation Tools

### `ts-json-schema-generator`
- Converts TypeScript types → JSON Schema
- Supports complex types, unions, generics, enums
- Output: Standard JSON Schema Draft 7 format

### `ajv` (Another JSON Schema Validator)
- Validates JSON data against schemas
- Strict mode ensures response structure matches exactly
- Fast and reliable for runtime validation

### Example Schema Output

For `ApiResponse.Search`, a generated schema looks like:

```json
{
  "title": "`/api/1.0/search/byterm` - This call returns all of the feeds that match the search terms...",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "status": { "type": "string" },
    "feeds": {
      "type": "array",
      "items": { "$ref": "#/definitions/PIApiFeed" }
    },
    "count": { "type": "number" }
  },
  "required": ["status", "feeds", "count"],
  "additionalProperties": false,
  "definitions": {
    "PIApiFeed": { /* ... */ }
  }
}
```

## Adding New Endpoints

When adding a new API method to `PodcastIndexClient`:

### 1. Define the Response Type

In [src/types.ts](src/types.ts):

```typescript
export namespace ApiResponse {
  export interface NewEndpoint {
    status: string;
    data: SomeDataType[];
    // ... other fields
  }
}
```

### 2. Implement the Method

In [src/index.ts](src/index.ts):

```typescript
async newEndpoint(param: string): Promise<ApiResponse.NewEndpoint> {
  const result = await this.fetch<ApiResponse.NewEndpoint>("/api/1.0/new/endpoint", {
    key: param,
  });
  track("NewEndpoint", { /* metadata */ });
  return result;
}
```

### 3. Register for Validation

In [src/schemas/validate.ts](src/schemas/validate.ts), add to the `types` array:

```typescript
{
  getResponse: () => client.newEndpoint("test-param"),
  endpoint: "/api/1.0/new/endpoint",
  title: "Description of what this endpoint returns",
  typeName: "ApiResponse.NewEndpoint",
}
```

### 4. Regenerate Schemas

```bash
yarn validate
```

This creates: `src/schemas/1.0/new-endpoint.json`

## Schema File Structure

All schemas are stored in versioned directories:

```
src/schemas/
├── 1.0/                          # Podcast Index API v1.0
│   ├── categories-list.json
│   ├── search-byterm.json
│   ├── episodes-byfeedid.json
│   ├── podcasts-byfeedurl.json
│   └── ... (all endpoint schemas)
├── README.md                      # Schema overview
├── validate.ts                    # Schema generation script
└── Code Citations.md              # Attribution for generated schemas
```

**Naming convention:** `{endpoint-resource}-{endpoint-action}.json`
- Example: `/api/1.0/search/byterm` → `search-byterm.json`

## Troubleshooting Schema Validation

### Schema Mismatch Errors

If `yarn validate` reports errors like:

```
Schema for ApiResponse.Search doesn't match return from /api/1.0/search/byterm
```

**Possible causes:**

1. **API changed:** Podcast Index API updated response structure
   - **Fix:** Update [src/types.ts](src/types.ts) to match new API response
   - Re-run `yarn validate`

2. **Type definition incomplete:** TypeScript type missing a required field
   - **Fix:** Add missing properties to the interface in [src/types.ts](src/types.ts)
   - Re-run `yarn validate`

3. **Network issue:** API request failed
   - **Fix:** Check `.env` has valid `API_KEY` and `API_SECRET`
   - Retry `yarn validate`

### Solution Steps

```bash
# 1. Verify .env is correct
echo $env:API_KEY  # PowerShell
echo $env:API_SECRET

# 2. Check if API is accessible
curl -H "X-Auth-Key: $key" -H "X-Auth-Date: $date" -H "Authorization: $auth" \
  https://api.podcastindex.org/api/1.0/stats/current

# 3. Review error messages from yarn validate
yarn validate 2>&1 | tee validate-errors.log

# 4. Update types if API changed
# Edit src/types.ts to match actual API response

# 5. Regenerate
yarn validate
```

## Release Process Integration

The schema validation is required before publishing:

```bash
# In package.json prepublishOnly hook
"prepublishOnly": "yarn lint && yarn test && yarn build"
```

Before running `yarn publish`, ensure:

```bash
# Full validation
yarn tsc       # TypeScript compilation
yarn test      # Jest tests
yarn validate  # Schema generation and validation against live API
```

All three must pass before release.

## Development Workflow

### During Development

```bash
# Hot-reload development server
yarn dev:watch

# This does NOT regenerate schemas (too slow for hot-reload)
# Schemas are validated only before publishing
```

### Before Committing Changes

If you modified [src/types.ts](src/types.ts) or [src/index.ts](src/index.ts):

```bash
# Regenerate schemas to catch type mismatches
yarn validate

# Commit the changes (including updated schema files)
git add src/schemas/
git commit -m "docs: update schemas for new endpoint"
```

## Reference

- **Tool documentation:** [typescript-json-schema](https://github.com/YousefED/typescript-json-schema)
- **Validator:** [ajv - Another JSON Schema Validator](https://ajv.js.org/)
- **API specification:** [Podcast Index API OpenAPI spec](reference/pi_api_1.12.1.json)
- **Schema standard:** [JSON Schema Draft 7](https://json-schema.org/draft-07/json-schema-core.html)

## FAQ

**Q: Do I need to manually edit schema files?**
A: No. Schemas are generated. Edit [src/types.ts](src/types.ts) instead, then run `yarn validate`.

**Q: Can I use schemas for runtime validation?**
A: Yes, see [src/schemas/validate.ts](src/schemas/validate.ts) for `ajv` usage patterns.

**Q: Why does `yarn validate` call the live API?**
A: To ensure schemas match real API behavior. If the API changes, validation will catch it.

**Q: How often should I regenerate schemas?**
A: Only when types change or before publishing. Not during normal development.

**Q: What if API_KEY/API_SECRET are not set?**
A: `yarn validate` will fail. Schemas require live API calls. Set `.env` file with valid credentials.
