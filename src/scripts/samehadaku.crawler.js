const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const NodeCache = require("node-cache");
const {
  racaty: racatyExtractor,
  karaken: karakenExtractor,
} = require("../extractors");
const prisma = require("../database/client");
const { USER_AGENT } = require("../utils");

dotenv.config();

const cache = new NodeCache({
  stdTTL: 100,
});

const SUPORTED_SERVER = Object.freeze({
  RACATY: "racaty",
  KRAKEN: "krakenfiles",
});

const BASE_URL = process.env.SAMEHADAKU_PROVIDER;

const search = async (query) => {
  try {
    const cacheKey = "search" + query;
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const { data } = await axios.get(BASE_URL + `?s=${query}`);
    const results = feedCardParser(data);
    cache.set(cacheKey, results);

    return results;
  } catch (error) {
    throw error;
  }
};

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

      const url = a.attr("href");
      const animeId = url.replace(/\/$/g, "").split("/").pop();

      results.push({
        animeId,
        url,
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
    throw error;
  }
};

const onGoing = async () => {
  try {
    const cachedResponse = cache.get("onGoing");
    if (cachedResponse) {
      return cachedResponse;
    }

    const { data } = await axios.get(BASE_URL);
    const results = feedCardParser(data);

    cache.set("onGoing", results);

    return results;
  } catch (error) {
    throw error;
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
    throw error;
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

    const ratingValue = $('span[itemprop="ratingValue"]').text()?.trim();
    const ratingCount = $('i[itemprop="ratingCount"]').attr("content")?.trim();
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
    $(".lstepsiode li").each((_, item) => {
      const div = $(item).find(".epsleft");
      const a = div.find("a");
      const link = a.attr("href");
      const date = div.find(".date");
      episodes.push({
        episodeId: link?.length ? link.slice(BASE_URL.length + 1) : null,
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
    throw error;
  }
};

const watch2 = async (episodeId) => {
  episodeId = episodeId.replace(/^\/|\/$/g, "");
  const BASE2URL = BASE_URL + "/" + episodeId;

  const { data } = await axios.get(BASE2URL);

  const $ = cheerio.load(data);

  const urls = [];
  $("#server li")
    .find("div")
    .each((_, el) => {
      urls.push({
        post: Number($(el).attr("data-post")),
        nume: Number($(el).attr("data-nume")),
        type: $(el).attr("data-type"),
        action: "player_ajax",
      });
    });

  const URL = BASE_URL + "/wp-admin/admin-ajax.php";
  const options = {
    headers: {
      Accept: "*/*",
      Referer: BASE2URL,
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const server = [];
  await Promise.all(
    urls.map(async (data) => {
      const { data: iframe } = await axios.post(URL, data, options);
      const regex = /<iframe.*?src="(.*?)"/i;
      const match = iframe.match(regex);

      if (match) {
        const src = match[1];
        server.push(src);
      }
    })
  );

  const u = server.filter((url) => url.includes("blogger"))[0];
  axios.get(u).then(({data}) => {
    const $$ = cheerio.load(data);
    const r = $$("script")[0].children[0].data;
    const rp = JSON.parse(r.replace("var VIDEO_CONFIG =", ""));
    console.log(rp.streams[0]);
  });

  console.log(server);
};

// FIXME: request time
const watch = async (serverName, episodeId) => {
  try {
    episodeId = episodeId.replace(/^\/|\/$/g, "");

    const cacheKey = "watch" + episodeId + serverName;
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse) {
      console.log("FROM CACHE");
      return cachedResponse;
    }

    const response = await axios.get(BASE_URL + "/" + episodeId);

    const $ = cheerio.load(response.data);

    const animeId = $(".nvsc a")
      .attr("href")
      .replace(/\/$/g, "")
      .split("/")
      .pop();

    const promisses = [];
    const availableServer = [];
    $("div.download-eps a").each((_, item) => {
      const cServer = $(item).text().trim().toLowerCase();
      const url = item.attribs.href;

      if (serverName.toLowerCase() === cServer) {
        promisses.push({ url, server: serverName });
      }

      const index = availableServer.findIndex((server) => server === cServer);
      if (index === -1) {
        availableServer.push(cServer);
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
          return response.filter((item) => item !== null && item !== undefined);
        })
      );

    const supportedServer = (await prisma.animeServer.findMany()).map(
      (item) => item.name
    );

    const rr = {
      animeId,
      supportedServer,
      availableServer,
      videos: results,
    };

    if (rr.videos.length > 0) {
      cache.set(cacheKey, rr);
    }

    return rr;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const feedCardParser = (data) => {
  const results = [];
  const $ = cheerio.load(data);

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

  return results;
};

module.exports = {
  info,
  watch,
  watch2,
  search,
  latest,
  onGoing,
  recomendation,
};
