require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { listFolders, listImages, uploadFile, streamFile } = require("./googleDrive");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(cors());

// List event folders
app.get("/api/events", async (req, res) => {
  try {
    const folders = await listFolders(ROOT_FOLDER_ID);
    res.json(folders);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch folders");
  }
});

// List images in an event folder
app.get("/api/events/:folderId/images", async (req, res) => {
  try {
    const images = await listImages(req.params.folderId);
    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch images");
  }
});

// Upload to an event folder
app.post("/api/events/:folderId/upload", upload.single("photo"), async (req, res) => {
  try {
    const uploaded = await uploadFile(req.params.folderId, req.file);
    res.json(uploaded);
  } catch (err) {
    console.error(err);
    res.status(500).send("Upload failed");
  }
});

// Proxy an image securely
app.get("/api/events/:folderId/image/:fileId", async (req, res) => {
  try {
    await streamFile(req.params.fileId, res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Image streaming failed");
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
