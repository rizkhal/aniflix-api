const { USER_AGENT } = require("../utils");
const axios = require("axios");
const cheerio = require("cheerio");

const RESOLUTIONS = ["360p", "480p", "720p", "1080p", "MP4HD", "FULLHD"];

module.exports = async (url) => {
  try {
    const headers = { "User-Agent": USER_AGENT };
    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);
    const res1 = $("#getExtoken input")
      .toArray()
      .map((i) => $(i).attr("value"));

    const data = `op=${res1[0]}&id=${res1[1]}&rand=${res1[2]}&referer=&method_free=&method_premium=1`;
    const res2 = await axios.post(url, data, { headers });
    const $2 = cheerio.load(res2.data);

    const download_url = $2("a#uniqueExpirylink").attr("href");

    if (download_url) {
      const res = download_url.split("/").pop();
      const regex = new RegExp(`(${RESOLUTIONS.join("|")})`);
      const match = regex.exec(res);

      return {
        url: download_url,
        type: download_url.split(".").pop(),
        poster: null,
        resolution: Array.isArray(match) ? match[0] : "Unknown",
      };

      // console.log(`🔗 ${download_url}`);

      // if you want to fetch size and other info from `download_url`
      // const { data: data2 } = await axios.head(download_url, {
      //   headers: {
      //     "User-Agent": USER_AGENT,
      //     Connection: "keep-alive",
      //   },
      //   responseType: "arraybuffer",
      // });

      // const size = data2.headers["content-length"];
      // const name = download_url.split("/").pop();
      // return { size, name };
    }
  } catch (error) {
    throw error;
  }
};
