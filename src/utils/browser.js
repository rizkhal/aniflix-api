const puppeteer = require("puppeteer");

const browser = async () =>
  await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

module.exports = browser;
