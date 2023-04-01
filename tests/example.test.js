const puppeteer = require("puppeteer");

describe("My first Setup Testing", () => {
  it("Home landing page", async () => {
    const browser = await puppeteer.launch({ headless: false });
  });
});
