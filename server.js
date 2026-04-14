const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

// ✅ IMPORTANT: dynamic port
const PORT = process.env.PORT || 5000;

// ✅ ensure uploads folder exists
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// upload
app.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    res.json({ message: "Uploaded", file: req.file.filename });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// get files
app.get("/files", (req, res) => {
  fs.readdir(uploadPath, (err, files) => {
    if (err) return res.status(500).json({ error: "Cannot read files" });
    res.json(files);
  });
});

// delete
app.delete("/delete/:name", (req, res) => {
  const filePath = path.join(uploadPath, req.params.name);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.json({ message: "Deleted" });
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// access files
app.use("/uploads", express.static(uploadPath));

// start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));