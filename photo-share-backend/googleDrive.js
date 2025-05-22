const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const auth = new google.auth.GoogleAuth({
  keyFile: "service_account.json",
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

const listFolders = async (parentId) => {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });
  return res.data.files;
};

const listImages = async (folderId) => {
  const res = await drive.files.list({
    q: `'${folderId}' in parents and mimeType contains 'image/' and trashed=false`,
    fields: "files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink)",
  });
  return res.data.files;
};

const uploadFile = async (folderId, file) => {
  const fileMeta = {
    name: file.originalname,
    parents: [folderId],
  };

  const media = {
    mimeType: file.mimetype,
    body: fs.createReadStream(file.path),
  };

  const res = await drive.files.create({
    resource: fileMeta,
    media,
    fields: "id, name, webViewLink, webContentLink",
  });

  fs.unlinkSync(file.path);
  return res.data;
};

const streamFile = async (fileId, res) => {
  const file = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );
  file.data
    .on("end", () => {})
    .on("error", (err) => {
      console.error("Error downloading file.");
      res.sendStatus(500);
    })
    .pipe(res);
};

module.exports = {
  listFolders,
  listImages,
  uploadFile,
  streamFile,
};
