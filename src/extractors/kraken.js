// FIXME: bypass kraken server instead of load more page
const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async (url) => {
  return await axios.get(url).then(({ data }) => {
    const $$ = cheerio.load(data);
    const video = $$("video#my-video");
    const videoURL = video.attr("data-src-url");
    const posterURL = video.attr("poster");
    return {
      url: `https:${videoURL}`,
      poster: `https:${posterURL}`,
      // resolution: $(item.parentNode.parentNode).find("strong").text(),
    };
  });
};
