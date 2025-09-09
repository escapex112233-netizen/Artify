import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());

// Serve static files from arts folder
app.use("/arts", express.static(path.join(process.cwd(), "arts")));

// Helper: convert folder name (like "AnimeArts") to "Anime Arts"
function humanizeCategory(folderName) {
  return folderName.replace(/([A-Z])/g, " $1").trim();
}

app.get("/api/arts", (req, res) => {
  try {
    const basePath = path.join(process.cwd(), "arts");
    const categories = fs.readdirSync(basePath);

    let arts = [];

    categories.forEach((categoryFolder) => {
      const categoryPath = path.join(basePath, categoryFolder);

      if (fs.statSync(categoryPath).isDirectory()) {
        const files = fs.readdirSync(categoryPath);

        files.forEach((file) => {
          const ext = path.extname(file).toLowerCase();
          if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
            const name = path.basename(file, ext);
            let price = 0;

            // agar naam me number ho toh usko price treat karenge
            const match = name.match(/(\d+)/);
            if (match) {
              price = parseInt(match[1]);
            }

            arts.push({
              category: humanizeCategory(categoryFolder), // "Anime Arts"
              name: name,
              price: price,
              file: `/arts/${categoryFolder}/${file}`, // safe URL
            });
          }
        });
      }
    });

    res.json(arts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to read arts" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
