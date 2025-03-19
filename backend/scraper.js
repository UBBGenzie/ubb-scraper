const puppeteer = require("puppeteer");

function extractName(text) {
  const regex =
    /-\s*(?:prof\. UBB\s*)?(?:(?:prof\.|dr hab\.|dr|mgr|inż\.|hab\.)\s*)+([\p{L}]+)\s+([\p{L}-]+)/u;
  const match = text.match(regex);
  return match
    ? `${match[1]} ${match[2]}`
    : "Nie znaleziono imienia i nazwiska";
}

function getPriority(name) {
  if (name.includes("wyk")) return 1;
  if (name.includes("lab")) return 2;
  return 3;
}

async function fetchSubjectsFromPage(page, url, subjectMap) {
  await page.goto(url, { waitUntil: "networkidle2" });

  let index = 0;
  let element;

  while ((element = await page.$(`#course_${index}`)) !== null) {
    let name = await page.evaluate((el) => el.innerText.trim(), element);
    let subjectCode = name.split(",")[0];

    let currentPriority = getPriority(name);
    const uniqueKey = `${subjectCode}_${index}`;

    if (!subjectMap.has(uniqueKey)) {
      subjectMap.set(uniqueKey, {
        id: index,
        name,
        przedmiot: subjectCode,
        priority: currentPriority,
        coordinator_info: "",
        coordinator_name: "",
      });
    }
    index++;
  }
}

function filterSubjectsByPriority(subjects) {
  const filteredSubjects = [];
  const subjectMap = new Map();

  subjects.forEach((subject) => {
    const subjectName = subject.przedmiot;
    const currentPriority = subject.priority;

    if (!subjectMap.has(subjectName)) {
      subjectMap.set(subjectName, {
        maxPriority: currentPriority,
        subject: { ...subject },
        coordinators: new Set([subject.coordinator_name]),
      });
    } else {
      const existing = subjectMap.get(subjectName);
      if (currentPriority === 1) {
        subjectMap.set(subjectName, {
          maxPriority: currentPriority,
          subject: { ...subject },
          coordinators: new Set([subject.coordinator_name]),
        });
      } else if (existing.maxPriority !== 1) {
        existing.coordinators.add(subject.coordinator_name);
        existing.subject.coordinator_name = Array.from(
          existing.coordinators
        ).join(", ");
        existing.subject.name = subject.name;
        existing.subject.id = subject.id;
        existing.subject.priority = Math.min(
          existing.subject.priority,
          subject.priority
        );
        subjectMap.set(subjectName, existing);
      }
    }
  });

  subjectMap.forEach((value) => {
    filteredSubjects.push(value.subject);
  });

  return filteredSubjects;
}

const SEMESTR_URLS = {
  stacjonarne: {
    2: "https://plany.ubb.edu.pl/plan.php?type=2&id=12626&bw=0&winW=1617&winH=817&loadBG=000000",
    4: "https://plany.ubb.edu.pl/plan.php?type=2&id=12627&bw=0&winW=1617&winH=817&loadBG=000000",
    6: "https://plany.ubb.edu.pl/plan.php?type=2&id=12628&bw=0&winW=1617&winH=817&loadBG=000000",
  },
  zaoczne: {
    2: "https://plany.ubb.edu.pl/plan.php?type=2&id=12145&winW=1821&winH=920&loadBG=000000",
    4: "https://plany.ubb.edu.pl/plan.php?type=2&id=12146&winW=1821&winH=920&loadBG=000000",
    6: "https://plany.ubb.edu.pl/plan.php?type=2&id=136938&winW=1821&winH=920&loadBG=000000",
  },
};

const WEEK_PARAMS = {
  stacjonarne: ["w=706", "w=707"],
  zaoczne: ["w=705", "w=707"],
};

async function fetchLegend(page) {
  return await page.evaluate(() => {
    let legendMap = new Map();
    let legendElement = document.querySelector("#legend div:nth-child(2)");
    if (legendElement) {
      let lines = legendElement.innerText.split("\n");
      lines.forEach((line) => {
        let parts = line.split(" - ");
        if (parts.length >= 2) {
          let code = parts[0].trim();
          let fullName = parts
            .slice(1)
            .join(" - ")
            .split(", występowanie:")[0]
            .trim();
          legendMap.set(code, fullName);
        }
      });
    }
    return Object.fromEntries(legendMap);
  });
}

async function scrapeData(semestr, mode) {
  if (!SEMESTR_URLS[mode] || !SEMESTR_URLS[mode][semestr]) {
    throw new Error("Nieprawidłowy semestr lub tryb studiów");
  }

  const baseUrl = SEMESTR_URLS[mode][semestr];
  const urls = WEEK_PARAMS[mode].map((week) => `${baseUrl}&${week}`);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  let subjectMap = new Map();
  let coordinatorMap = new Map();

  for (const url of urls) {
    await fetchSubjectsFromPage(page, url, subjectMap);
  }

  let subjects = Array.from(subjectMap.values());
  const legend = await fetchLegend(page);

  subjects.forEach((subject) => {
    if (legend[subject.przedmiot]) {
      subject.przedmiot = legend[subject.przedmiot];
    }
  });

  for (let { id, href, text, course_id } of await page.evaluate(() => {
    let courses = [];
    let index = 0;
    let element;

    while ((element = document.getElementById(`course_${index}`))) {
      let courseId = index;
      let links = Array.from(element.querySelectorAll("a"))
        .map((a) => ({
          id: a.href.split("id=")[1],
          href: a.href,
          text: a.innerText.trim(),
          course_id: courseId,
        }))
        .filter((link) => link.href.includes("type=10"));
      courses.push(...links);
      index++;
    }
    return courses;
  })) {
    if (!coordinatorMap.has(text)) {
      try {
        await page.goto(href, { waitUntil: "networkidle2" });
        await page.waitForSelector("body");

        const courseContent = await page.evaluate(() => {
          const element = document.evaluate(
            "/html/body/div[3]/div",
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
          ).singleNodeValue;
          return element ? element.innerText.trim() : "Brak danych";
        });

        const coordinatorName = extractName(courseContent);
        if (coordinatorName) {
          coordinatorMap.set(text, coordinatorName);
        }
      } catch (error) {
        console.error(
          `Błąd podczas przetwarzania kursu ${text}:`,
          error.message
        );
      }
    }
  }

  subjects.forEach((subject) => {
    const coordinatorCodes =
      subject.name.split("\n")[1]?.trim().split(" ") || [];
    const coordinatorNames = coordinatorCodes
      .map((code) => coordinatorMap.get(code))
      .filter((name) => name)
      .join(", ");
    subject.coordinator_name =
      coordinatorNames || "Nie znaleziono imienia i nazwiska";
  });

  const filteredSubjects = filterSubjectsByPriority(subjects);

  await browser.close();
  return filteredSubjects;
}

module.exports = scrapeData;
