const express = require("express");
const cors = require("cors");
const scrapeData = require("./scraper");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/scrape/:semestr/:mode", async (req, res) => {
  const { semestr, mode } = req.params;
  const semestrNumber = parseInt(semestr);

  if (
    ![2, 4, 6].includes(semestrNumber) ||
    !["stacjonarne", "zaoczne"].includes(mode)
  ) {
    return res
      .status(400)
      .json({ error: "Nieprawidłowy semestr lub tryb studiów" });
  }

  try {
    const data = await scrapeData(semestrNumber, mode);
    res.json(data);
  } catch (error) {
    console.error("Błąd scrapowania:", error);
    res.status(500).json({ error: "Wystąpił błąd" });
  }
});

app.listen(PORT, () => {
  console.log(`Serwer działa na http://localhost:${PORT}`);
});
