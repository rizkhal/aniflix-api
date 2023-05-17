const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");
const { USER_AGENT } = require("../utils/index");

dotenv.config();

const BASE_URL = process.env.SAMEHADAKU_PROVIDER;

const run = async (episodeId) => {
  episodeId = episodeId.replace(/^\/|\/$/g, "");
  const BASE2URL = BASE_URL + "/" + episodeId;

  console.log(BASE2URL);

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

  const uu =
    "https://mega.nz/embed/NIMzQATJ#qvuA2GW_iqsOCLvxWBsa-_34frUUiG_M21_1xuk3mpo";
  // 'https://mega.co.nz/#!NIMzQATJ!qvuA2GW_iqsOCLvxWBsa-_34frUUiG_M21_1xuk3mpo';

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
  const { data: data2 } = await axios.get(u);
  const $$ = cheerio.load(data2);
  const r = $$("script")[0].children[0].data;
  const rp = JSON.parse(r.replace("var VIDEO_CONFIG =", ""));
  const aa = rp.streams[0].play_url;

  try {
    const { data: qq } = await axios.get(decodeURIComponent(aa));
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  run,
};
