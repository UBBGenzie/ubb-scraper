const puppeteer = require("puppeteer");
 
(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
 
  // Przejdź na stronę główną
  const url = "https://plany.ubb.edu.pl/plan.php?type=0&id=12652";
  await page.goto(url, { waitUntil: "networkidle2" });
 
  // Pobierz wszystkie kursy course_0, course_1, course_2 itd.
  const courseLinks = await page.evaluate(() => {
    let courses = [];
    let index = 0;
    let element;
 
    while ((element = document.getElementById(`course_${index}`))) {
      let links = Array.from(element.querySelectorAll("a"))
        .map((a) => ({
          id: a.href.split("id=")[1], // Pobranie ID kursu z URL
          href: a.href,
          text: a.innerText.trim(),
        }))
        .filter((link) => link.href.includes("type=10")); // Filtruj tylko nauczycieli
      courses.push(...links);
      index++;
    }
    return courses;
  });
 
  let courseData = [];
 
  // Iteracja po linkach i zbieranie informacji
  for (let { id, href, text } of courseLinks) {
    try {
      const newPage = await browser.newPage();
      await newPage.goto(href, { waitUntil: "networkidle2" });
      await newPage.waitForSelector("body"); // Upewnienie się, że body jest załadowane
 
      // Pobierz treść z podanego XPatha
      const courseContent = await newPage.evaluate(() => {
        const element = document.evaluate(
          "/html/body/div[3]/div",
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue;
        return element ? element.innerText.trim() : "Brak danych";
      });
 
      // Zapisz dane do obiektu
      courseData.push({
        id: id,
        name: text,
        coordinator_info: courseContent,
      });
 
      console.log(`Treść dla kursu ${text}: ${courseContent}`);
      await newPage.close();
    } catch (error) {
      console.error(`Błąd podczas przetwarzania kursu ${text}:`, error.message);
    }
  }
 
  console.log("Zebrane dane:", JSON.stringify(courseData, null, 2));
 
  await browser.close();
})();