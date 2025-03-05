const puppeteer = require("puppeteer");
 
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://plany.ubb.edu.pl/plan.php?type=0&id=12652");
  console.log("Strona załadowana pomyślnie");
  await browser.close();
})();
 