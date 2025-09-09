import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Folder jahan tumhare arts rakhe hain
const ARTS_DIR = path.join(process.cwd(), "arts");

// Helper function: filename se art ka naam + price nikalna
function parseArt(filename) {
  const ext = path.extname(filename); // .png
  const base = path.basename(filename, ext); // GokuAnime45

  // last numbers = price
  const match = base.match(/(\d+)$/);
  const price = match ? parseInt(match[1]) : 0;
  const name = match ? base.replace(match[1], "") : base;

  return { name, price, filename };
}

// API: sabhi arts
app.get("/api/arts", (req, res) => {
  let result = [];

  const categories = fs.readdirSync(ARTS_DIR);
  categories.forEach((category) => {
    const categoryPath = path.join(ARTS_DIR, category);
    if (fs.lstatSync(categoryPath).isDirectory()) {
      const files = fs.readdirSync(categoryPath);
      files.forEach((file) => {
        const art = parseArt(file);
        result.push({
          category,
          name: art.name,
          price: art.price,
          file: `/arts/${category}/${art.filename}`
        });
      });
    }
  });

  res.json(result);
});

// API: ek category ke arts
app.get("/api/arts/:category", (req, res) => {
  const category = req.params.category;
  const categoryPath = path.join(ARTS_DIR, category);

  if (!fs.existsSync(categoryPath)) {
    return res.status(404).json({ error: "Category not found" });
  }

  const files = fs.readdirSync(categoryPath);
  const result = files.map((file) => {
    const art = parseArt(file);
    return {
      category,
      name: art.name,
      price: art.price,
      file: `/arts/${category}/${art.filename}`
    };
  });

  res.json(result);
});

// Static files serve karna
app.use("/arts", express.static(ARTS_DIR));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});