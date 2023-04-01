const fs = require("fs");
const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("https://www3.gogoanimes.fi/");

  const results = await page.$$eval("ul.items a img", (payload) => {
    return payload.map((payload) => {
      const anchorTag = payload.closest("a");
      return {
        title: anchorTag.title,
        url: anchorTag.href,
        poster: payload.src,
      };
    });
  });

  fs.writeFile("./src/data/gogonime.json", JSON.stringify(results), (err) => {
    if (err) throw err;
    console.log("Results saved to results.json");
  });

  await browser.close();
})();
