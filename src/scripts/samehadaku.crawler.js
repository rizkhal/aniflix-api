const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const NodeCache = require("node-cache");
const {
  racaty: racatyExtractor,
  karaken: karakenExtractor,
} = require("../extractors");

dotenv.config();

const cache = new NodeCache({
  stdTTL: 86400, // one day
});

const SUPORTED_SERVER = Object.freeze({
  RACATY: "racaty",
  KRAKEN: "krakenfiles",
});

const BASE_URL = process.env.SAMEHADAKU_PROVIDER;

const recomendation = async () => {
  try {
    const cachedResponse = cache.get("recomendation");
    if (cachedResponse) {
      return cachedResponse;
    }

    const { data } = await axios.get(BASE_URL);

    const $ = cheerio.load(data);

    const results = [];
    $("div.widgetseries li").each((_, item) => {
      const a = $(item).find(".imgseries").find("a");
      const img = $(a).find("img");
      const ltinfo = $(item).find(".lftinfo");
      const release = ltinfo.find("span").last().text().trim();
      const genres = [];
      ltinfo
        .find("span")
        .first()
        .find("a")
        .each((_, el) => {
          const genre = $(el).text();
          genres.push(genre);
        });

      results.push({
        url: a.attr("href"),
        title: img.attr("alt"),
        thumbnail: img.attr("src"),
        release,
        genres,
      });
    });

    const r = {
      data: results,
    };

    cache.set("recomendation", r);

    return r;
  } catch (error) {
    console.log(error);
  }
};

const onGoing = async () => {
  try {
    const cachedResponse = cache.get("onGoing");
    if (cachedResponse) {
      return cachedResponse;
    }

    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);
    const results = [];
    $(".animposx").each((_, item) => {
      const a = $(item).find("a");
      const url = a.attr("href");
      const cover = a.find("img").attr("src");
      const status = a.find(".data").find(".type").text().trim();
      const score = a.find(".score").text().trim();
      const title = a.find(".data").find(".title").text().trim();
      const type = a.find(".type").text().slice(0, -status.length);
      const animeId = url.replace(/\/$/g, "").split("/").pop();

      results.push({
        score,
        type,
        status,
        title,
        animeId,
        cover,
        url,
      });
    });

    cache.set("onGoing", results);

    return results;
  } catch (error) {
    console.log(error);
  }
};

const latest = async (page) => {
  try {
    const URL =
      BASE_URL + (page ? "/anime-terbaru/page/" + page : "/anime-terbaru");

    const cacheKey = "latest" + page;
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const { data } = await axios.get(URL);

    const $ = cheerio.load(data);

    const results = [];
    const li = $(".post-show li");
    li.each((_, item) => {
      const img = $(item).find("img");
      const a = $(item).find(".entry-title").find("a");
      const episodeId = a
        .attr("href")
        .replace(/\/[^\/]*$/, "")
        .split("/")
        .pop();

      const contents = $(item).contents();
      const episode = contents.find("span").first().text().trim();
      const release = contents
        .find("span")
        .last()
        .text()
        .trim()
        .replace("Released on: ", "");

      const author = contents
        .find('span[itemprop="author"]')
        .find("author")
        .text()
        .trim();

      results.push({
        title: img.attr("alt"),
        thumbnail: img.attr("src"),
        episodeId: episodeId,
        episode,
        author,
        release,
      });
    });

    const result = {
      hasMorePages: $("i#nextpagination").length ? true : false,
      data: results,
    };

    cache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.log(error);
  }
};

const info = async (animeId) => {
  try {
    animeId = animeId.replace(/^\/|\/$/g, "");

    const URL = BASE_URL + "/anime/" + animeId;

    const cachedResponse = cache.get(animeId);
    if (cachedResponse) {
      console.log("FROM CACHE");
      return cachedResponse;
    }

    const { data } = await axios.get(URL);

    const $ = cheerio.load(data);

    const image = $("div.thumb img").attr("src");

    const genre = $('div.genre-info a[itemprop="genre"]')
      .map((_, el) => $(el).text().trim())
      .get();

    const ratingValue = $('span[itemprop="ratingValue"]').text().trim();
    const ratingCount = $('i[itemprop="ratingCount"]').attr("content").trim();
    const rating = {
      ratingValue,
      ratingCount,
    };
    const title = $('h1[itemprop="name"]').text().trim();
    const description = $('div[itemprop="description"]').text().trim();

    const detailTable = $(".spe");
    const rows = detailTable.find("span");

    const animeDetails = {};
    rows.each((_, row) => {
      const key = $(row).find("b").text();
      const value = $(row)
        .contents()
        .filter((_, content) => content.nodeType === 3)
        .text()
        .trim();

      animeDetails[key.replace(":", "")] = value;
    });

    const thrailer = $("div#pembed iframe").attr("src");

    const episodes = [];
    const ul = $("div.post-body");
    const li = ul.find("li");

    li.each((_, item) => {
      const div = $(item).find(".epsleft");
      const a = div.find("a");
      const link = a.attr("href");
      const date = div.find(".date");
      episodes.push({
        episodeId: link.slice(BASE_URL.length + 1),
        link: link,
        text: a.text().trim(),
        date: date.text().trim(),
      });
    });

    const response = {
      title,
      image,
      rating,
      genre,
      description,
      thrailer,
      episodes,
      details: animeDetails,
    };

    cache.set(animeId, response);

    return response;
  } catch (error) {
    console.log(error);
  }
};

// FIXME: request time
const watch = async (server, episodeId) => {
  try {
    episodeId = episodeId.replace(/^\/|\/$/g, "");

    const cacheKey = episodeId + server;

    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      console.log("FROM CACHE");
      return cachedResponse;
    }

    const response = await axios.get(BASE_URL + "/" + episodeId);

    const $ = cheerio.load(response.data);

    const promisses = [];
    $("div.download-eps a").each((_, item) => {
      const cServer = $(item).text().toLocaleLowerCase();
      const url = item.attribs.href;

      if (server.toLowerCase() === cServer) {
        promisses.push({ url, server });
      }
    });

    const results = await axios
      .all(
        promisses.map((e) => {
          switch (e.server.toLowerCase()) {
            case SUPORTED_SERVER.RACATY:
              return racatyExtractor(e.url);
            case SUPORTED_SERVER.KRAKEN:
              return karakenExtractor(e.url);
          }
        })
      )
      .then(
        axios.spread((...response) => {
          if (response) {
            return response;
          }
        })
      );

    const animeId = $(".nvsc a").attr("href");
    const rr = {
      animeId,
      videos: results,
    };

    if (results.videos) {
      cache.set(cacheKey, rr);
    }

    return rr;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  info,
  watch,
  latest,
  onGoing,
  recomendation,
};
