const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const racatyExtractor = require("../extractors/racaty");

dotenv.config();

const SUPORTED_SERVER = Object.freeze({
  RACATY: "racaty",
  KRAKEN: "krakenfiles",
});

const BASE_URL = process.env.SAMEHADAKU_PROVIDER;

const info = async (animeId) => {
  try {
    if (!animeId.startsWith("/")) {
      animeId = "/" + animeId;
    }

    const URL = BASE_URL + "/anime" + animeId;

    const { data } = await axios.get(URL);

    const $ = cheerio.load(data);

    const image = $("div.thumb img").attr("src");

    const genre = $('div.genre-info a[itemprop="genre"]')
      .map((_, el) => $(el).text())
      .get();

    const rating = $('span[itemprop="ratingValue"]').text();
    const title = $('h1[itemprop="name"]').text();
    const description = $('div[itemprop="description"]').text();

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

    return {
      title,
      image,
      rating,
      genre,
      description,
      thrailer,
      episodes,
      details: animeDetails,
    };
  } catch (error) {
    console.log(error);
  }
};

const watch = async (episodeId) => {
  try {
    if (!episodeId.startsWith("/")) {
      episodeId = "/" + episodeId;
    }

    const response = await axios.get(BASE_URL + episodeId);

    const $ = cheerio.load(response.data);

    const krakens = [];
    const racaty = [];

    $("div.download-eps a").each((_, item) => {
      const server = $(item).text().toLocaleLowerCase();
      const url = item.attribs.href;

      switch (server) {
        case SUPORTED_SERVER.RACATY:
          racaty.push({
            url: url,
          });
          break;
        case SUPORTED_SERVER.KRAKEN:
          krakens.push({
            url: url,
          });
          break;
      }
    });

    const racatyREAL = await axios
      .all(racaty.map((endpoint) => racatyExtractor(endpoint.url)))
      .then(
        axios.spread((...response) => {
          if (response) {
            return response;
          }
        })
      );

    return {
      racaty: racatyREAL,
    };
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  info,
  watch,
};
