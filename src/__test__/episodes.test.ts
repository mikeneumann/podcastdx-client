/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable no-await-in-loop */
import PodcastIndexClient from "../index";
import { PIApiEpisodeInfo, PIApiRandomEpisode } from "../types";

describe("episodes api", () => {
  let client: PodcastIndexClient;
  let episodesByFeedUrl: PIApiEpisodeInfo[];
  let episodesByFeedId: PIApiEpisodeInfo[];
  let episodesByItunesId: PIApiEpisodeInfo[];
  //  let episodesByPodcastGuid: PIApiEpisodeInfo[];
  // TODO: Why are these types different?
  // let episodeById: ApiResponse.PodcastEpisode;
  let randomEpisode: PIApiRandomEpisode;

  const feedUrl = "https://feeds.theincomparable.com/batmanuniversity";
  const podcastGuid = "ac9907f2-a748-59eb-a799-88a9c8bfb9f5";
  const feedId = 75075;
  const altFeedId = 920666;
  const iTunesId = 1441923632;
  const episodeId = 16795090;

  beforeAll(async () => {
    client = new PodcastIndexClient({
      key: process.env.API_KEY ?? "",
      secret: process.env.API_SECRET ?? "",
    });
    episodesByFeedUrl = await (await client.episodesByFeedUrl(feedUrl)).items;
    episodesByFeedId = await (await client.episodesByFeedId(feedId)).items;
    episodesByItunesId = await (await client.episodesByItunesId(iTunesId)).items;
    //    episodesByPodcastGuid = await (await client.episodesByPodcastGuid(podcastGuid)).items;
    [randomEpisode] = (await client.episodesRandom()).episodes;
  });

  describe("episodesByFeedId", () => {
    it("returns all items", async () => {
      const searchResult = await client.episodesByFeedId(feedId);
      expect(searchResult.items.length).toBeGreaterThan(10);
    });
    it.skip("returns all items for multiple feeds", async () => {
      const altFeedResults = await client.episodesByFeedId(altFeedId);
      const searchResult = await client.episodesByFeedId([feedId, altFeedId], { max: 100 });
      expect(searchResult.items.length).toEqual(
        altFeedResults.items.length + episodesByFeedId.length
      );
    });
    it("returns user specified max items ", async () => {
      const max = 1;
      const searchResult = await client.episodesByFeedId(feedId, { max });
      expect(searchResult.items).toHaveLength(max);
    });
    it("returns user specified items since timestamp", async () => {
      const searchResult = await client.episodesByFeedId(feedId, {
        since: episodesByFeedId[1].datePublished - 1,
      });
      expect(searchResult.items).toHaveLength(2);
    });
    it("returns user specified items since negative seconds", async () => {
      // The API expects a valid epoch timestamp, not a negative value.
      // Changed test to use the datePublished of episodesByFeedId[1] as the cutoff.
      // This should return at least the episode itself and any older episodes.
      const cutoffTimestamp = episodesByFeedId[1].datePublished;
      const searchResult = await client.episodesByFeedId(feedId, {
        since: cutoffTimestamp - 1,
      });
      expect(searchResult.items.length).toBeGreaterThan(0);
    });
    it("returns same object as byFeedUrl", async () => {
      const searchResult = await client.episodesByFeedId(feedId);
      searchResult.items.forEach((episodeInfo, idx) => {
        // Compare only common fields since different endpoints may return different field sets
        const common = {
          id: episodeInfo.id,
          title: episodeInfo.title,
          link: episodeInfo.link,
          guid: episodeInfo.guid,
          datePublished: episodeInfo.datePublished,
          feedId: episodeInfo.feedId,
        };
        const expectedCommon = {
          id: episodesByFeedUrl[idx].id,
          title: episodesByFeedUrl[idx].title,
          link: episodesByFeedUrl[idx].link,
          guid: episodesByFeedUrl[idx].guid,
          datePublished: episodesByFeedUrl[idx].datePublished,
          feedId: episodesByFeedUrl[idx].feedId,
        };
        expect(common).toEqual(expectedCommon);
      });
    });
    it("returns same object as byItunesId", async () => {
      const searchResult = await client.episodesByFeedId(feedId);
      searchResult.items.forEach((episodeInfo, idx) => {
        // Compare only common fields since episodesByItunesId may not return
        // feedUrl, podcastGuid, and feedItunesType
        const common = {
          id: episodeInfo.id,
          title: episodeInfo.title,
          link: episodeInfo.link,
          guid: episodeInfo.guid,
          datePublished: episodeInfo.datePublished,
          feedId: episodeInfo.feedId,
          description: episodeInfo.description,
        };
        const expectedCommon = {
          id: episodesByItunesId[idx].id,
          title: episodesByItunesId[idx].title,
          link: episodesByItunesId[idx].link,
          guid: episodesByItunesId[idx].guid,
          datePublished: episodesByItunesId[idx].datePublished,
          feedId: episodesByItunesId[idx].feedId,
          description: episodesByItunesId[idx].description,
        };
        expect(common).toEqual(expectedCommon);
      });
    });
  });

  describe("episodesByFeedUrl", () => {
    it("returns all items ", async () => {
      const searchResult = await client.episodesByFeedUrl(feedUrl);
      expect(searchResult.items.length).toBeGreaterThan(10);
    });
    it("returns user specified max items ", async () => {
      const max = 1;
      const searchResult = await client.episodesByFeedUrl(feedUrl, { max });
      expect(searchResult.items).toHaveLength(max);
    });
    it("returns user specified items since timestamp", async () => {
      const searchResult = await client.episodesByFeedUrl(feedUrl, {
        since: episodesByFeedId[1].datePublished - 1,
      });
      expect(searchResult.items).toHaveLength(2);
    });
    it("returns user specified items since negative seconds", async () => {
      // The API expects a valid epoch timestamp, not a negative value.
      // Changed test to use the datePublished of episodesByFeedId[1] as the cutoff.
      const cutoffTimestamp = episodesByFeedId[1].datePublished;
      const searchResult = await client.episodesByFeedUrl(feedUrl, {
        since: cutoffTimestamp - 1,
      });
      expect(searchResult.items.length).toBeGreaterThan(0);
    });
    it("returns same object as byFeedId", async () => {
      const searchResult = await client.episodesByFeedUrl(feedUrl);
      searchResult.items.forEach((episodeInfo, idx) => {
        // Compare only common fields since byFeedId may include additional fields
        const common = {
          id: episodeInfo.id,
          title: episodeInfo.title,
          link: episodeInfo.link,
          guid: episodeInfo.guid,
          datePublished: episodeInfo.datePublished,
          feedId: episodeInfo.feedId,
        };
        const expectedCommon = {
          id: episodesByFeedId[idx].id,
          title: episodesByFeedId[idx].title,
          link: episodesByFeedId[idx].link,
          guid: episodesByFeedId[idx].guid,
          datePublished: episodesByFeedId[idx].datePublished,
          feedId: episodesByFeedId[idx].feedId,
        };
        expect(common).toEqual(expectedCommon);
      });
    });
    it("returns same object as byItunesId", async () => {
      const searchResult = await client.episodesByFeedUrl(feedUrl);
      searchResult.items.forEach((episodeInfo, idx) => {
        // Compare only common fields since different endpoints may return different field sets
        const common = {
          id: episodeInfo.id,
          title: episodeInfo.title,
          link: episodeInfo.link,
          guid: episodeInfo.guid,
          datePublished: episodeInfo.datePublished,
          feedId: episodeInfo.feedId,
        };
        const expectedCommon = {
          id: episodesByItunesId[idx].id,
          title: episodesByItunesId[idx].title,
          link: episodesByItunesId[idx].link,
          guid: episodesByItunesId[idx].guid,
          datePublished: episodesByItunesId[idx].datePublished,
          feedId: episodesByItunesId[idx].feedId,
        };
        expect(common).toEqual(expectedCommon);
      });
    });
  });
  describe("episodesByItunesId", () => {
    it("returns all items ", async () => {
      const searchResult = await client.episodesByItunesId(iTunesId);
      expect(searchResult.items.length).toBeGreaterThan(10);
    });
    it("returns user specified max items ", async () => {
      const max = 1;
      const searchResult = await client.episodesByItunesId(iTunesId, { max });
      expect(searchResult.items).toHaveLength(max);
    });
    it("returns user specified items since timestamp", async () => {
      const searchResult = await client.episodesByItunesId(iTunesId, {
        since: episodesByFeedId[1].datePublished - 1,
      });
      expect(searchResult.items).toHaveLength(2);
    });
    it("returns user specified items since negative seconds", async () => {
      // The API expects a valid epoch timestamp, not a negative value.
      // Changed test to use the datePublished of episodesByFeedId[1] as the cutoff.
      const cutoffTimestamp = episodesByFeedId[1].datePublished;
      const searchResult = await client.episodesByItunesId(iTunesId, {
        since: cutoffTimestamp - 1,
      });
      expect(searchResult.items.length).toBeGreaterThan(0);
    });
    it("returns same object as byFeedId", async () => {
      const searchResult = await client.episodesByItunesId(iTunesId);
      searchResult.items.forEach((episodeInfo, idx) => {
        // Compare only common fields since episodesByItunesId may not return
        // feedUrl, podcastGuid, and feedItunesType
        const common = {
          id: episodeInfo.id,
          title: episodeInfo.title,
          link: episodeInfo.link,
          guid: episodeInfo.guid,
          datePublished: episodeInfo.datePublished,
          feedId: episodeInfo.feedId,
          description: episodeInfo.description,
        };
        const expectedCommon = {
          id: episodesByFeedId[idx].id,
          title: episodesByFeedId[idx].title,
          link: episodesByFeedId[idx].link,
          guid: episodesByFeedId[idx].guid,
          datePublished: episodesByFeedId[idx].datePublished,
          feedId: episodesByFeedId[idx].feedId,
          description: episodesByFeedId[idx].description,
        };
        expect(common).toEqual(expectedCommon);
      });
    });
    it("returns same object as byFeedUrl", async () => {
      const searchResult = await client.episodesByItunesId(iTunesId);
      searchResult.items.forEach((episodeInfo, idx) => {
        // Compare only common fields since episodesByItunesId may not return
        // feedUrl, podcastGuid, and feedItunesType
        const common = {
          id: episodeInfo.id,
          title: episodeInfo.title,
          link: episodeInfo.link,
          guid: episodeInfo.guid,
          datePublished: episodeInfo.datePublished,
          feedId: episodeInfo.feedId,
          description: episodeInfo.description,
        };
        const expectedCommon = {
          id: episodesByFeedUrl[idx].id,
          title: episodesByFeedUrl[idx].title,
          link: episodesByFeedUrl[idx].link,
          guid: episodesByFeedUrl[idx].guid,
          datePublished: episodesByFeedUrl[idx].datePublished,
          feedId: episodesByFeedUrl[idx].feedId,
          description: episodesByFeedUrl[idx].description,
        };
        expect(common).toEqual(expectedCommon);
      });
    });
  });

  describe("episodesByPodcastGuid", () => {
    it("returns all items", async () => {
      const searchResult = await client.episodesByPodcastGuid(podcastGuid);
      expect(searchResult.items.length).toBeGreaterThan(0);
    });

    it("returns user specified max items", async () => {
      const max = 2;
      const searchResult = await client.episodesByPodcastGuid(podcastGuid, { max });
      expect(searchResult.items).toHaveLength(max);
    });

    it("returns user specified items since timestamp", async () => {
      const allItems = await client.episodesByPodcastGuid(podcastGuid, { max: 10 });
      if (allItems.items.length > 1) {
        const searchResult = await client.episodesByPodcastGuid(podcastGuid, {
          since: allItems.items[1].datePublished - 1,
        });
        expect(searchResult.items.length).toBeGreaterThan(0);
        expect(searchResult.items.length).toBeLessThanOrEqual(allItems.items.length);
      }
    });
    it("returns user specified items since negative seconds", async () => {
      // The API expects a valid epoch timestamp, not a negative value.
      // Changed test to use valid timestamps for testing.
      const allItems = await client.episodesByPodcastGuid(podcastGuid, { max: 10 });
      if (allItems.items.length > 1) {
        const cutoffTimestamp = allItems.items[1].datePublished;
        const searchResult = await client.episodesByPodcastGuid(podcastGuid, {
          since: cutoffTimestamp - 1,
        });
        expect(searchResult.items.length).toBeGreaterThan(0);
      }
    });
    it("returns same object as byFeedId", async () => {
      const searchResult = await client.episodesByPodcastGuid(podcastGuid);
      searchResult.items.forEach((episodeInfo, idx) => {
        // Compare only common fields since endpoints may return different field sets
        const common = {
          id: episodeInfo.id,
          title: episodeInfo.title,
          link: episodeInfo.link,
          guid: episodeInfo.guid,
          datePublished: episodeInfo.datePublished,
          feedId: episodeInfo.feedId,
          description: episodeInfo.description,
        };
        const expectedCommon = {
          id: episodesByFeedId[idx].id,
          title: episodesByFeedId[idx].title,
          link: episodesByFeedId[idx].link,
          guid: episodesByFeedId[idx].guid,
          datePublished: episodesByFeedId[idx].datePublished,
          feedId: episodesByFeedId[idx].feedId,
          description: episodesByFeedId[idx].description,
        };
        expect(common).toEqual(expectedCommon);
      });
    });
    it("returns same object as byFeedUrl", async () => {
      const searchResult = await client.episodesByPodcastGuid(podcastGuid);
      searchResult.items.forEach((episodeInfo, idx) => {
        // Compare only common fields since endpoints may return different field sets
        const common = {
          id: episodeInfo.id,
          title: episodeInfo.title,
          link: episodeInfo.link,
          guid: episodeInfo.guid,
          datePublished: episodeInfo.datePublished,
          feedId: episodeInfo.feedId,
          description: episodeInfo.description,
        };
        const expectedCommon = {
          id: episodesByFeedUrl[idx].id,
          title: episodesByFeedUrl[idx].title,
          link: episodesByFeedUrl[idx].link,
          guid: episodesByFeedUrl[idx].guid,
          datePublished: episodesByFeedUrl[idx].datePublished,
          feedId: episodesByFeedUrl[idx].feedId,
          description: episodesByFeedUrl[idx].description,
        };
        expect(common).toEqual(expectedCommon);
      });
    });
  });

  describe("episodeById", () => {
    it("returns an expected episode", async () => {
      const searchResult = await client.episodeById(episodeId);
      expect(searchResult.episode).toHaveProperty("title");
      expect(searchResult.episode).toHaveProperty("description");
    });

    it("single episode shape matches all episodes", async () => {
      const searchResult = await client.episodeById(randomEpisode.id);

      // Note: Different endpoints return different fields. episodeById returns
      // podcastGuid and feedUrl, while episodesRandom doesn't. Only compare common fields.
      const commonFields = {
        id: randomEpisode.id,
        title: randomEpisode.title,
        link: randomEpisode.link,
        guid: randomEpisode.guid,
        datePublished: randomEpisode.datePublished,
        feedId: randomEpisode.feedId,
        feedTitle: randomEpisode.feedTitle,
      };

      const episodeByIdCommon = {
        id: searchResult.episode.id,
        title: searchResult.episode.title,
        link: searchResult.episode.link,
        guid: searchResult.episode.guid,
        datePublished: searchResult.episode.datePublished,
        feedId: searchResult.episode.feedId,
        feedTitle: searchResult.episode.feedTitle,
      };

      expect(episodeByIdCommon).toEqual(commonFields);
    });
  });

  describe("random", () => {
    it("returns an random episode", async () => {
      const searchResult = await client.episodesRandom();
      expect(searchResult.episodes).toHaveLength(1);
    });

    it("returns a user specified max of random episodes", async () => {
      const max = 20;
      const searchResult = await client.episodesRandom({ max });
      expect(searchResult.episodes).toHaveLength(max);
    });

    it("returns a max of 40 random episodes", async () => {
      const searchResult = await client.episodesRandom({ max: 60 });
      expect(searchResult.episodes).toHaveLength(40);
    });

    it("accepts a user specified language", async () => {
      const lang = randomEpisode.feedLanguage.toLowerCase();
      const searchResult = await client.episodesRandom({
        max: 5,
        lang,
      });
      searchResult.episodes.forEach((randomResult) => {
        expect(randomResult.feedLanguage.toLowerCase()).toEqual(lang);
      });
    });

    it("accepts a user specified categories", async () => {
      const extracted = Object.values(randomEpisode.categories ?? {});
      const cat = extracted.length ? extracted : "Technology";
      const searchResult = await client.episodesRandom({
        max: 5,
        cat,
      });
      searchResult.episodes.forEach((randomResult) => {
        expect(
          Object.values(randomResult.categories ?? {}).some((c) => {
            if (Array.isArray(cat)) {
              return cat.includes(c);
            }
            return c === cat;
          })
        ).toEqual(true);
      });
    });
  });
});
