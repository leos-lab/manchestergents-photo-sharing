# Photo Share Platform

A fullstack, Dockerized photo sharing platform for events. Users can:

- View event-specific photo galleries
- Upload pictures without logging in
- Host files on Google Drive via service account
- Navigate with modern UI and lightbox preview

## 🧰 Tech Stack

- **Frontend**: React + TailwindCSS + React Router + React Modal
- **Backend**: Node.js + Express + Google Drive API
- **Hosting**: Docker Compose (for local or cloud deployment)

## 🚀 Getting Started

### 1. Clone the Repo

```bash
git clone https://github.com/your-username/photo-share-platform.git
cd photo-share-platform/photo-share-backend
```

### 2. Add Your Environment Variables

Create a `.env` file inside `photo-share-backend`:

```
GOOGLE_DRIVE_FOLDER_ID=your-root-folder-id
PORT=3000
```

Place your Google Drive service account key as `service_account.json` in the same folder.

### 3. Run with Docker

```bash
docker compose up --build
```

- Frontend runs at: [http://localhost:5173](http://localhost:5173)
- Backend API runs at: [http://localhost:3000](http://localhost:3000)

## 🛡️ Security

- Images are served through a secure backend proxy.
- No public Google Drive permissions are required.
- `.env` and `service_account.json` are git-ignored for safety.

## 📸 Features to Add

- Admin-only delete
- QR code invite links
- Image tagging, captions, search
- Upload moderation

## 📂 Folder Structure

```
photo-share-backend/
photo-share-frontend/
```

Let me know if you'd like this deployed on Render, Railway, or Vercel.
