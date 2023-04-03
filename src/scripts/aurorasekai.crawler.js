const fs = require("fs");
const puppeteer = require("puppeteer");

module.exports = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto("https://aurorasekai.com/");

  const results = await page.$$eval(".item-container a", (links) => {
    return links.map((link) => {
      const img = link.querySelector("img");
      const rating = link.querySelector("div.imdb-rating").textContent;
      const year = link.querySelector("span.movie-date").textContent;
      const description = link.querySelector("p.movie-description").textContent;

      return {
        url: link.href,
        rating: rating,
        year: year,
        title: img.getAttribute("alt"),
        image: img.getAttribute("data-src"),
        description: description,
      };
    });
  });

  fs.writeFile("src/data/aurorasekai.json", JSON.stringify(results), (err) => {
    if (err) throw err;
    console.log("Results saved to results.json");
  });

  await browser.close();
};
