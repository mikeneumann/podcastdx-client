# Podcast Index API Version Information

## Current API Revision

**API Version: 1.12.1**

**OpenAPI Specification Version: 3.0.2**

**Source URL:** https://podcastindex-org.github.io/docs-api/

**Last Retrieved:** February 14, 2026

---

## API Specification Access

The complete OpenAPI specification is available in the following formats:

### Local References
- **JSON Format:** [reference/pi_api_1.12.1.json](./pi_api_1.12.1.json) (local copy)
- **YAML Format:** Available at https://podcastindex-org.github.io/docs-api/pi_api.yaml

### Remote Sources
- **Official JSON:** https://podcastindex-org.github.io/docs-api/pi_api.json
- **Official YAML:** https://podcastindex-org.github.io/docs-api/pi_api.yaml
- **Documentation Portal:** https://podcastindex-org.github.io/docs-api/

---

## Key API Information from Specification

### Base Server URL
```
https://api.podcastindex.org/api/1.0
```

### Endpoint Categories
1. **Search** - Search podcasts by various criteria
2. **Podcasts** - Retrieve podcast feed information
3. **Episodes** - Retrieve episode information
4. **Recent** - Get recent additions to the index
5. **Value** - Podcast "Value for Value" information
6. **Stats** - Index statistics and metrics
7. **Categories** - Podcast category information
8. **Hub** - Feed update notifications
9. **Add** - Add new podcasts to the index
10. **Apple Replacement** - Apple Podcasts API compatibility endpoints
11. **Static Data** - Static data files and exports

### Authentication
- **Method:** SHA1 Hash-based API Key authentication
- **Headers Required:**
  - `X-Auth-Key` - Your API key
  - `X-Auth-Date` - Current Unix timestamp (UTC)
  - `Authorization` - SHA1 hash of (key + secret + timestamp)
  - `User-Agent` - Your application identifier

---

## Usage in podcastdx-client

This API version specification should be used as the authoritative reference for:
- Validating endpoint parameter requirements
- Comparing against TypeScript type definitions in [src/types.ts](../src/types.ts)
- Schema generation and validation in [src/schemas/validate.ts](../src/schemas/validate.ts)
- Adding new endpoints to the client API wrapper
- Identifying breaking changes between API versions

---

## Version History Notes

The `reference/pi_api_1.12.1.json` file contains the complete specification retrieved from the official Podcast Index documentation. If you need to check for updates to the API specification, retrieve the latest version from the official URLs listed above.

**To update this document:**
1. Fetch the latest spec from https://podcastindex-org.github.io/docs-api/pi_api.json
2. Compare the `info.version` field with the current version (1.12.1)
3. Update this document and the local JSON file if a newer version is available
4. Run `yarn validate` to ensure all schemas remain compatible
