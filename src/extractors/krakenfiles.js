// FIXME: bypass kraken server instead of load more page
const axios = require("axios");
const cheerio = require("cheerio");

const RESOLUTIONS = ["360p", "480p", "720p", "1080p", "MP4HD", "FULLHD"];

module.exports = async (url) => {
  return await axios.get(url).then(({ data }) => {
    const $$ = cheerio.load(data);
    const video = $$("video#my-video");
    const videoURL = video.attr("data-src-url");
    const posterURL = video.attr("poster");
    const fileName = $$(".coin-name").text();
    const type = videoURL.split(".").pop().split("?").shift();

    const regex = new RegExp(`(${RESOLUTIONS.join("|")})`);
    const match = regex.exec(fileName);

    return {
      url: `https:${videoURL}`,
      type: type,
      poster: `https:${posterURL}`,
      resolution: match.length ? match[0] : "Unknown",
    };
  });
};
