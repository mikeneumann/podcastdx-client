# Missing API Endpoints Catalog

**Document Date:** February 15, 2026  
**API Version:** 1.12.1  
**Current Implementation Status:** 19/50 endpoints implemented (38% coverage)  
**Total Missing Endpoints:** 31

## Summary

This document provides a comprehensive catalog of all Podcast Index API endpoints that are **NOT YET IMPLEMENTED** in the `podcastdx-client` library. It serves as a roadmap for future development and prioritization of new endpoint implementations.

### Coverage by Category

|  Category  | Total Endpoints | Implemented | Missing | Coverage |
|------------|-----------------|-------------|---------|----------|
| Search     |       6         |           2 | 4       |   33%    |
| Podcasts   |       9         |           5 | 4       |   56%    |
| Episodes   |       9         |           6 | 3       |   67%    |
| Recent     |       6         |           4 | 2       |   67%    |
| Value      |       5         |           0 | 5       |    0%    |
| Stats      |       1         |           1 | 0       |  100%    |
| Categories |       1         |           1 | 0       |  100%    |
| Hub        |       1         |           0 | 1       |    0%    |
| Add        |       2         |           0 | 2       |    0%    |
| Static/Tracking |  9         |           0 | 9       |    0%    |
| **TOTAL**  |     **50**      | **19** | **31**       | **38%**  |

---

## Implemented Endpoints (19)

✅ `/search/byterm` → `search()`  
✅ `/search/byperson` → `searchPerson()`  
✅ `/podcasts/byfeedid` → `podcastById()`  
✅ `/podcasts/byfeedurl` → `podcastByUrl()`  
✅ `/podcasts/byitunesid` → `podcastByItunesId()`  
✅ `/podcasts/byguid` → `podcastByGuid()`  
✅ `/podcasts/trending` → `trending()`  
✅ `/episodes/byfeedid` → `episodesByFeedId()`  
✅ `/episodes/byfeedurl` → `episodesByFeedUrl()`  
✅ `/episodes/byitunesid` → `episodesByItunesId()`  
✅ `/episodes/bypodcastguid` → `episodesByPodcastGuid()`  
✅ `/episodes/byid` → `episodeById()`  
✅ `/episodes/random` → `episodesRandom()`  
✅ `/recent/episodes` → `recentEpisodes()`  
✅ `/recent/feeds` → `recentFeeds()`  
✅ `/recent/newfeeds` → `recentNewFeeds()`  
✅ `/recent/soundbites` → `recentSoundbites()`  
✅ `/categories/list` → `categories()`  
✅ `/stats/current` → `stats()`  

---

## Missing Endpoints by Category

### Search Endpoints (4 Missing / 6 Total)

#### 1. **GET /search** (Apple Replacement)
- **Priority:** HIGH
- **Auth Required:** No (public endpoint, Apple replacement)
- **Description:** Replaces the Apple search API but returns data from the Podcast Index database
- **Query Parameters:**
  - `term` (string, required) - Search term
  - `pretty` (boolean, optional) - Pretty print JSON
- **Response Type:** Similar to iTunes replacement format
- **Implementation Notes:**
  - No API key needed
  - This is the universal search endpoint (no "byterm"/etc. path)
  - Used for Apple iTunes API compatibility

#### 2. **GET /lookup** (Apple Replacement)
- **Priority:** HIGH
- **Auth Required:** No (public endpoint, Apple replacement)
- **Description:** Replaces the Apple podcast lookup API but returns data from the Podcast Index database
- **Query Parameters:**
  - `entity` (string, required) - Entity type (e.g., "podcast")
  - `id` (integer, required) - iTunes ID or related identifier
  - `pretty` (boolean, optional)
- **Response Type:** iTunes replacement format
- **Implementation Notes:**
  - No API key needed
  - Alternative to iTunes lookup by ID
  - Returns podcast details by iTunes identifier

#### 3. **GET /search/bytitle**
- **Priority:** HIGH
- **Auth Required:** Yes
- **Description:** Returns all feeds where the title matches the search term (case-insensitive)
- **Query Parameters:**
  - `q` (string, required) - Query term
  - `max` (integer, optional) - Max results (default varies)
  - `fulltext` (boolean, optional)
  - `clean` (boolean, optional)
  - `similar` (boolean, optional)
  - `val` (string, optional)
  - `pretty` (boolean, optional)
- **Response Type:** `ApiResponse.Search` (same as `/search/byterm`)
- **Implementation Notes:**
  - Exact title matching (unlike `/search/byterm` which matches author/title)
  - Example: "everything everywhere daily" matches exact podcast title

#### 4. **GET /search/music/byterm**
- **Priority:** MEDIUM
- **Auth Required:** Yes
- **Description:** Searches only feeds with `medium=music` in the podcast namespace
- **Query Parameters:**
  - `q` (string, required) - Query term
  - `max` (integer, optional)
  - `fulltext` (boolean, optional)
  - `clean` (boolean, optional)
  - `val` (string, optional)
  - `pretty` (boolean, optional)
- **Response Type:** `ApiResponse.Search`
- **Implementation Notes:**
  - Filtered search for music podcasts only
  - Uses podcast namespace `medium` field

---

### Podcast Endpoints (4 Missing / 9 Total)

#### 5. **GET /podcasts/bytag**
- **Priority:** MEDIUM
- **Auth Required:** Yes
- **Description:** Returns podcasts filtered by specific tags
- **Query Parameters:**
  - Tag-related parameters (exact format TBD from spec)
  - `max` (integer, optional)
  - `pretty` (boolean, optional)
- **Response Type:** Likely `ApiResponse.Trending` or similar
- **Implementation Notes:**
  - Tag-based filtering for podcasts
  - Could return multiple feeds with same tag

#### 6. **GET /podcasts/bymedium**
- **Priority:** MEDIUM
- **Auth Required:** Yes
- **Description:** Returns podcasts filtered by medium (podcast, music, video, etc.)
- **Query Parameters:**
  - Medium type parameter (string)
  - `max` (integer, optional)
  - `pretty` (boolean, optional)
- **Response Type:** `ApiResponse.Trending` or similar
- **Implementation Notes:**
  - Filters by podcast namespace `medium` field
  - Examples: music, podcast, video, audiobook

#### 7. **GET /podcasts/dead**
- **Priority:** MEDIUM
- **Auth Required:** Yes
- **Description:** Returns feeds that are considered "dead" (no updates for extended period)
- **Query Parameters:**
  - `max` (integer, optional)
  - `before` (integer, optional) - Timestamp for pagination
  - `pretty` (boolean, optional)
- **Response Type:** `ApiResponse.Trending` or similar
- **Implementation Notes:**
  - Useful for identifying inactive/abandoned podcasts
  - Has pagination support

#### 8. **POST /podcasts/batch/byguid**
- **Priority:** MEDIUM
- **Auth Required:** Yes
- **Description:** Batch request to get multiple podcasts by their GUIDs
- **Request Body:** JSON array or object with GUIDs
- **Response Type:** Array or object of podcast details
- **Implementation Notes:**
  - POST endpoint (not GET like others)
  - More efficient than multiple individual requests
  - Similar to existing individual methods but batched

---

### Episode Endpoints (3 Missing / 9 Total)

#### 9. **GET /episodes/byguid**
- **Priority:** HIGH
- **Auth Required:** Yes
- **Description:** Returns episode details by episode GUID
- **Query Parameters:**
  - `guid` (string, required) - Episode GUID from feed
  - `fulltext` (boolean, optional)
  - `pretty` (boolean, optional)
- **Response Type:** `ApiResponse.EpisodeById` or similar
- **Implementation Notes:**
  - Complements existing `/episodes/byid` (by internal PI ID)
  - GUID is unique identifier from feed's `<item guid>`

#### 10. **GET /episodes/live**
- **Priority:** MEDIUM
- **Auth Required:** Yes
- **Description:** Returns live episodes or live streaming podcasts
- **Query Parameters:**
  - `max` (integer, optional)
  - `since` (integer, optional)
  - `pretty` (boolean, optional)
- **Response Type:** `ApiResponse.RecentEpisodes` or similar
- **Implementation Notes:**
  - Filters for live/streaming content only
  - Real-time podcast episodes

---

### Recent Endpoints (2 Missing / 6 Total)

#### 11. **GET /recent/newvaluefeeds**
- **Priority:** MEDIUM
- **Auth Required:** Yes
- **Description:** Returns recently added feeds that have "Value for Value" support enabled
- **Query Parameters:**
  - `max` (integer, optional, defaults to 10)
  - `since` (integer, optional) - Unix timestamp for filtering
  - `lang` (string, optional) - Language filter
  - `category` (string, optional) - Category filter
  - `pretty` (boolean, optional)
- **Response Type:** `ApiResponse.RecentNewFeeds` or similar
- **Implementation Notes:**
  - Subset of recent feeds: only those with V4V enabled
  - Complementary to `/recent/newfeeds`

#### 12. **GET /recent/data**
- **Priority:** LOW
- **Auth Required:** Yes
- **Description:** Returns recent bulk data updates or data snapshots
- **Query Parameters:**
  - TBD from spec
  - `pretty` (boolean, optional)
- **Response Type:** TBD
- **Implementation Notes:**
  - Likely for data export or bulk operations
  - Exact usage requires spec review

---

### Value for Value (V4V) Endpoints (5 Missing / 5 Total - **ZERO COVERAGE**)

These endpoints provide "Value for Value" monetization information for podcasts and episodes.

#### 13. **GET /value/byfeedid**
- **Priority:** MEDIUM
- **Auth Required:** No (public endpoint)
- **Description:** Returns Value for Value information for a podcast by Feed ID
- **Query Parameters:**
  - `id` (integer, required) - Podcast Index ID
  - `pretty` (boolean, optional)
- **Response Type:** `ApiResponse.ValueByFeedId` (new type needed)
- **Implementation Notes:**
  - No API key required (public)
  - Contains payment recipient info, wallet info, etc.
  - Data updated every 15 minutes via static JSON files

#### 14. **GET /value/byfeedurl**
- **Priority:** MEDIUM
- **Auth Required:** No (public endpoint)
- **Description:** Returns Value for Value information for a podcast by Feed URL
- **Query Parameters:**
  - `url` (string, required) - Full feed URL
  - `pretty` (boolean, optional)
- **Response Type:** `ApiResponse.ValueByFeedUrl` (new type needed)
- **Implementation Notes:**
  - No API key required (public)
  - Alternative to ID-based lookup

#### 15. **GET /value/bypodcastguid**
- **Priority:** MEDIUM
- **Auth Required:** No (public endpoint)
- **Description:** Returns Value for Value information for a podcast by Podcast GUID
- **Query Parameters:**
  - `guid` (string, required) - Podcast GUID
  - `pretty` (boolean, optional)
- **Response Type:** `ApiResponse.ValueByPodcastGuid` (new type needed)
- **Implementation Notes:**
  - No API key required (public)
  - Standard guid format: `917393e3-1b1e-5cef-ace4-edaa54e1f810`

#### 16. **GET /value/byepisodeguid**
- **Priority:** LOW
- **Auth Required:** No (public endpoint)
- **Description:** Returns Value for Value information for an episode by Episode GUID
- **Query Parameters:**
  - `podcastguid` (string, required) - Podcast GUID
  - `episodeguid` (string, required) - Episode GUID
  - `pretty` (boolean, optional)
- **Response Type:** `ApiResponse.ValueByEpisodeGuid` (new type needed)
- **Implementation Notes:**
  - Requires both podcast GUID and episode GUID
  - More granular than feed-level V4V info

#### 17. **POST /value/batch/byepisodeguid**
- **Priority:** LOW
- **Auth Required:** No (public endpoint)
- **Description:** Batch request for Value for Value data for multiple episodes
- **Request Body:** JSON object with format: `{ "podcastguid": ["episodeguid1", "episodeguid2"], ... }`
- **Response Type:** Batch response with episode V4V data
- **Implementation Notes:**
  - POST endpoint (not GET)
  - More efficient for bulk episode V4V lookups
  - No API key required

---

### Hub Endpoints (1 Missing / 1 Total)

#### 18. **POST /hub/pubnotify**
- **Priority:** LOW
- **Auth Required:** Yes (likely requires publisher permissions)
- **Description:** Notify the Podcast Index that a feed has been updated (webhook endpoint)
- **Request Body:** Feed update notification payload
- **Response Type:** Confirmation response
- **Implementation Notes:**
  - Intended for feed publishers
  - May require special API permissions (publisher role)
  - Used to signal feed updates to the index

---

### Add/Submit Endpoints (2 Missing / 2 Total - **ZERO COVERAGE**)

These endpoints are used to add or submit new podcast feeds to the index. They may require special API permissions.

#### 19. **POST /add/byfeedurl**
- **Priority:** LOW
- **Auth Required:** Yes (requires write/publisher permissions)
- **Description:** Submit a new podcast feed to the index by URL
- **Request Body:** JSON with feed URL and optional metadata
- **Response Type:** Submission confirmation with status
- **Implementation Notes:**
  - Requires publisher API credentials
  - Used to register new podcasts
  - Returns submission ID or status

#### 20. **POST /add/byitunesid**
- **Priority:** LOW
- **Auth Required:** Yes (requires write/publisher permissions)
- **Description:** Submit a new podcast to the index by iTunes ID
- **Request Body:** JSON with iTunes ID
- **Response Type:** Submission confirmation
- **Implementation Notes:**
  - Alternative to URL-based submission
  - Looks up iTunes podcast and adds to index
  - Requires publisher role

---

### Static/Tracking Endpoints (9 Missing / 9 Total - **ZERO COVERAGE**)

These are **static JSON and data file endpoints** served from separate hosts. Many don't require API authentication. These endpoints return large static files rather than real-time API responses.

#### 21. **GET /static/stats/daily_counts.json**
- **Priority:** LOW
- **Auth Required:** No
- **Server:** `https://stats.podcastindex.org/` (separate domain)
- **Description:** Daily statistics and growth metrics for the Podcast Index
- **Response Type:** JSON object with daily count data
- **Implementation Notes:**
  - Updated daily, not real-time
  - Large dataset
  - Static file, not dynamic API

#### 22. **GET /static/stats/hourly_counts.json**
- **Priority:** LOW
- **Auth Required:** No
- **Server:** `https://stats.podcastindex.org/`
- **Description:** Hourly statistics for the Podcast Index
- **Response Type:** JSON object with hourly counts
- **Implementation Notes:**
  - Updated hourly
  - Time-series data
  - Also accessible at `https://stats.podcastindex.org/hourly_counts.json`

#### 23. **GET /static/stats/chart-data.json**
- **Priority:** LOW
- **Auth Required:** No
- **Server:** `https://api.podcastindex.org/`
- **Description:** Chart-ready statistical data (likely for visualization)
- **Response Type:** JSON formatted for chart libraries
- **Implementation Notes:**
  - Pre-formatted for UI visualization
  - Aggregated statistics

#### 24. **GET /static/stats/v4vmusic.json**
- **Priority:** LOW
- **Auth Required:** No
- **Server:** `https://api.podcastindex.org/`
- **Description:** List of music podcasts with Value for Value support (JSON format)
- **Response Type:** JSON array of music V4V podcasts
- **Implementation Notes:**
  - Music-specific V4V data
  - Available in multiple formats (see next two endpoints)

#### 25. **GET /static/stats/v4vmusic.opml**
- **Priority:** LOW
- **Auth Required:** No
- **Server:** `https://api.podcastindex.org/`
- **Description:** List of music podcasts with Value for Value support (OPML format)
- **Response Type:** XML/OPML file
- **Implementation Notes:**
  - Importable into podcast apps
  - OPML format for subscriptions
  - Same data as JSON, different format

#### 26. **GET /static/stats/v4vmusic.rss**
- **Priority:** LOW
- **Auth Required:** No
- **Server:** `https://api.podcastindex.org/`
- **Description:** List of music podcasts with Value for Value support (RSSフィード format)
- **Response Type:** RSS/ATOM feed
- **Implementation Notes:**
  - Feed format for aggregation
  - Subscribable as a feed
  - Same data as JSON/OPML

#### 27. **GET /static/tracking/current**
- **Priority:** LOW
- **Auth Required:** No
- **Server:** `https://tracking.podcastindex.org/` (separate domain)
- **Description:** Current tracking/analytics data for the Podcast Index
- **Response Type:** JSON with tracking metrics
- **Implementation Notes:**
  - Real-time or near-real-time tracking data
  - Usage analytics

#### 28. **GET /static/tracking/feedValueBlocks**
- **Priority:** LOW
- **Auth Required:** No
- **Server:** `https://tracking.podcastindex.org/`
- **Description:** Bulk Value for Value data for all feeds (static file, updated every 15 minutes)
- **Response Type:** JSON object with feed ID -> V4V data mapping
- **Implementation Notes:**
  - Large dataset (all feeds with V4V)
  - Updated every 15 minutes
  - More efficient than individual `/value/` endpoint calls
  - Also mentioned in `/value/byfeedid` endpoint docs

#### 29. **GET /static/tracking/episodeValueBlocks**
- **Priority:** LOW
- **Auth Required:** No
- **Server:** `https://tracking.podcastindex.org/`
- **Description:** Bulk Value for Value data for all episodes (static file, updated every 15 minutes)
- **Response Type:** JSON object with episode ID -> V4V data mapping
- **Implementation Notes:**
  - Large dataset (all episodes with V4V)
  - Updated every 15 minutes
  - Bulk alternative to `/value/byepisodeguid` endpoint
  - Same as mentioned in `/value/byepisodeguid` docs

#### 30. **GET /static/public/podcastindex_dead_feeds.csv**
- **Priority:** LOW
- **Auth Required:** No
- **Server:** `https://api.podcastindex.org/`
- **Description:** CSV file listing all "dead" feeds
- **Response Type:** CSV (text/csv)
- **Implementation Notes:**
  - Bulk export of dead feeds
  - Alternative to individual `/podcasts/dead` endpoint
  - CSV format for data import

#### 31. **GET /static/public/podcastindex_feeds.db.tgz**
- **Priority:** LOW
- **Auth Required:** No
- **Server:** `https://api.podcastindex.org/`
- **Description:** Complete SQLite database of all Podcast Index feeds (compressed tarball)
- **Response Type:** Binary .tgz file (compressed archive)
- **Implementation Notes:**
  - Full database export
  - Large file (~100+ MB when extracted)
  - For offline use or bulk analysis
  - Requires database extraction/parsing
  - Lowest priority (massive data transfer)

---

## Implementation Priority Matrix

### Quick Wins (High Value, Low Effort)

1. **`/search/byterm`** - Already done ✅
2. **`/search/bytitle`** - Similar structure to `/search/byterm`
3. **`/search` (Apple Replacement)** - No auth, simple structure
4. **`/lookup` (Apple Replacement)** - No auth, simple structure
5. **`/episodes/byguid`** - Similar to existing `episodeById()`

### High Value, Medium Effort

6. **`/search/music/byterm`** - Filtered version of existing search
7. **`/podcasts/bytag`** - Similar to `/podcasts/bymedium`
8. **`/podcasts/bymedium`** - New but straightforward
9. **`/value/byfeedid`** - New type, but no auth required
10. **`/value/byfeedurl`** - Similar to `value/byfeedid`
11. **`/value/bypodcastguid`** - Similar to `value/byfeedid`
12. **`/episodes/live`** - Similar to recent episodes

### Medium Value, Higher Effort

13. **`/podcasts/batch/byguid`** - Batch endpoint, requires POST implementation
14. **`/value/batch/byepisodeguid`** - Batch endpoint, requires POST implementation
15. **`/podcasts/dead`** - New search variant
16. **`/recent/newvaluefeeds`** - Filter recent feeds by V4V support
17. **`/hub/pubnotify`** - Publisher-only, POST endpoint

### Lower Priority (Specialized Use Cases)

18. **`/add/byfeedurl`** - Publisher-only, special permissions
19. **`/add/byitunesid`** - Publisher-only, special permissions
20. **`/recent/data`** - Unclear purpose, requires spec clarification
21. **Value/Episode GUID endpoints** - Lower demand, complex GUIDs
22. **All static/ endpoints** - Data export/bulk operations, not API calls

---

## Development Workflow Recommendations

### Phase 1: Core Search Completeness (5 endpoints)
- Add `/search` and `/lookup` (Apple Replacement)
- Add `/search/bytitle` and `/search/music/byterm`
- Add `/episodes/byguid`
- **Estimated effort:** 2-3 hours
- **Dependencies:** None

### Phase 2: Podcast Discovery Enhancement (5 endpoints)
- Add `/podcasts/bytag`, `/podcasts/bymedium`, `/podcasts/dead`
- Add `/episodes/live`
- Add `/recent/newvaluefeeds`
- **Estimated effort:** 3-4 hours
- **Dependencies:** Phase 1 completion recommended

### Phase 3: Value for Value Support (5 endpoints)
- Add all `/value/*` endpoints
- Create new `ApiResponse.Value*` types
- Add response validation schemas
- **Estimated effort:** 4-5 hours
- **Dependencies:** Phase 2 completion recommended

### Phase 4: Advanced Features (6 endpoints)
- Batch endpoints: `/podcasts/batch/byguid`, `/value/batch/byepisodeguid`
- Add `/hub/pubnotify` webhook support
- Add `/add/*` endpoints (publisher-only)
- **Estimated effort:** 4-5 hours
- **Dependencies:** Batch request patterns from existing client

### Phase 5: Data Export & Tracking (9 endpoints)
- Static data endpoints
- Tracking endpoints
- CSV/database exports
- **Estimated effort:** 6-8 hours (includes client-side caching)
- **Dependencies:** Later phases (lower priority)

---

## Type Definitions Needed

The following new TypeScript types will need to be added to `src/types.ts`:

```typescript
// Value for Value types
interface PIApiValueBlock {
  // TBD from API response examples
}

interface ApiResponse.ValueByFeedId {
  // TBD
}

interface ApiResponse.ValueByFeedUrl {
  // TBD
}

interface ApiResponse.ValueByPodcastGuid {
  // TBD
}

interface ApiResponse.ValueByEpisodeGuid {
  // TBD
}

interface ApiResponse.ValueBatchByEpisodeGuid {
  // TBD
}

// Static response types
interface ApiResponse.DailyStats {
  // TBD
}

interface ApiResponse.HourlyStats {
  // TBD
}

interface ApiResponse.TrackingData {
  // TBD
}
```

---

## References

- **API Specification:** [reference/pi_api_1.12.1.json](reference/pi_api_1.12.1.json)
- **Current Implementation:** [src/index.ts](src/index.ts)
- **Type Definitions:** [src/types.ts](src/types.ts)
- **Schema Validation:** [src/schemas/validate.ts](src/schemas/validate.ts)
- **Development Guide:** [SCHEMA_GENERATION.md](SCHEMA_GENERATION.md)

---

## Next Steps

1. Review this catalog with team
2. Prioritize implementations based on user feedback
3. Start with Phase 1 (Core Search Completeness)
4. Use [SCHEMA_GENERATION.md](SCHEMA_GENERATION.md) as implementation guide
5. Add integration tests for each new endpoint
6. Update validation schemas with `yarn validate`

---

**Document Status:** Complete  
**Last Updated:** February 15, 2026  
**Maintained By:** AI Coding Agent
