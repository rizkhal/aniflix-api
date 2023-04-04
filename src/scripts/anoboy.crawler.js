const fs = require("fs");
const dotenv = require("dotenv");
const browser = require("../utils/browser");

dotenv.config();

const WEB_URL = `${process.env.ANOBOY_PROVIDER}/`;

const latest = async () => {
  const chrome = await browser();
  const page = await chrome.newPage();

  await page.goto(WEB_URL);

  const results = await page.$$eval(".home_index a", (links) => {
    const blackLists = "div.wp-pagenavi a";
    const blackLists2 = "h2 a";
    const blackLists3 = "#jadwal a";

    const blacklistAnchors = Array.from(document.querySelectorAll(blackLists));
    const blacklistAnchors2 = Array.from(
      document.querySelectorAll(blackLists2)
    );
    const blacklistAnchors3 = Array.from(
      document.querySelectorAll(blackLists3)
    );

    const anchors = links.filter(
      (anchor) =>
        !blacklistAnchors.includes(anchor) &&
        !blacklistAnchors2.includes(anchor) &&
        !blacklistAnchors3.includes(anchor)
    );

    return anchors.map((link) => {
      const img = link.querySelector("img");
      const schedule = link.querySelector(".jamup");

      return {
        url: link.href,
        title: link.title,
        episodeId: link.href.split("/").slice(3).join("/"),
        image: img?.getAttribute("src"),
        schedule: schedule.textContent.trim(),
      };
    });
  });

  fs.writeFile(
    "src/static/anoboy.json",
    JSON.stringify({ data: results }),
    (err) => {
      if (err) throw err;
      console.log("Results saved to results.json");
    }
  );

  await chrome.close();
};

const info = async (animeId) => {
  const HIT_URL = WEB_URL + animeId;
  const chrome = await browser();
  const page = await chrome.newPage();
  await page.goto(HIT_URL);

  const title = await page.$eval("div.pagetitle h1", (payload) =>
    payload.textContent.trim()
  );

  const results = await page.$$eval("div.unduhan table tr", (payload) => {
    return payload.map((item) => {
      return {
        label: item.querySelector("th").textContent.trim(),
        value: item.querySelector("td").textContent.trim(),
      };
    });
  });

  const elements = await page.$$(".unduhan");
  const firstElement = elements[0];
  const description = await page.evaluate(
    (element) => element.textContent,
    firstElement
  );

  await chrome.close();

  return {
    title: title,
    description: description,
    meta: results,
  };
};

const watch = async (episodeId) => {
  const HIT_URL = WEB_URL + episodeId;

  const chrome = await browser();
  const page = await chrome.newPage();

  await page.goto(HIT_URL);

  const results = await page.$$eval("div.vmiror", (payloads) => {
    return payloads.map((item) => {
      const a = item.querySelectorAll("a");

      const links = Array.from(a).map((item) => {
        return {
          link: item.getAttribute("data-video"),
          resolution: item.textContent.trim(),
        };
      });

      const serverResolutions = item.textContent;
      const [server, _] = serverResolutions.trim().split(" ");

      return {
        server: server,
        videos: links,
      };
    });
  });

  const video360 = await page.$eval("iframe#mediaplayer", (payload) =>
    payload.getAttribute("src")
  );

  const mirrors = results.map((item) => {
    return {
      ...item,
      videos: item.videos.map((subItem) => {
        return {
          ...subItem,
          link: subItem.link === "/loading.html" ? video360 : subItem.link,
        };
      }),
    };
  });

  await chrome.close();

  return mirrors;
};

const schedule = async () => {
  const HIT_URL = `${WEB_URL}2015/05/anime-subtitle-indonesia-ini-adalah-arsip-file-kami/`;

  const chrome = await browser();
  const page = await chrome.newPage();
  await page.goto(HIT_URL);

  const results = await page.$$eval("div.unduhan", (payloads) => {
    return payloads.map((item) => {
      if (item.querySelector("h1")) {
        const title = item.querySelector("h1").textContent;

        const links = item.querySelectorAll("a");

        const results = [];
        for (let i = 0; i < links.length; i++) {
          results.push({
            href: links[i].href,
            title: links[i].parentElement.textContent.trim(),
          });
        }

        return {
          day: title,
          items: results,
        };
      }
    });
  });

  const filtered = results.filter((item) => item !== null);

  fs.writeFile(
    "src/static/anoboy/schedule.json",
    JSON.stringify({ data: filtered }),
    (err) => {
      if (err) throw err;
      console.log("Results saved to results.json");
    }
  );

  await chrome.close();
};

module.exports = {
  info,
  latest,
  watch,
  schedule,
};
