import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

const API = process.env.REACT_APP_API_BASE || "http://localhost:3000/api";
Modal.setAppElement("#root");

function slugify(text) {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

function deslugify(slug, folders) {
  return folders.find((f) => slugify(f.name) === slug);
}

function EventGallery({ folders }) {
  const { folderSlug } = useParams();
  const folder = deslugify(folderSlug, folders);
  const folderId = folder?.id;

  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (!folderId) return;
    console.log(`Fetching images for folder: ${folderId}`);
    axios
      .get(`${API}/events/${folderId}/images`)
      .then((res) => {
        console.log("Images loaded:", res.data);
        setImages(res.data);
      })
      .catch((err) => console.error("Error loading images:", err));
  }, [folderId]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !folderId) return;

    const formData = new FormData();
    formData.append("photo", file);
    setUploading(true);

    try {
      console.log("Uploading file...");
      await axios.post(`${API}/events/${folderId}/upload`, formData);
      console.log("Upload complete");
      e.target.value = "";
      const res = await axios.get(`${API}/events/${folderId}/images`);
      setImages(res.data);
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  if (!folderId) {
    return <p className="p-6 text-red-600">Event not found</p>;
  }

  return (
    <div className="p-6 space-y-6">
      <Link to="/" className="text-blue-500 underline">
        ← Back to Events
      </Link>
      <input type="file" onChange={handleUpload} />
      {uploading && <p>Uploading...</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(`/api/events/${folderId}/image/${img.id}`)}
            className="focus:outline-none"
          >
            <img
              src={`/api/events/${folderId}/image/${img.id}`}
              alt={img.name}
              className="rounded shadow w-full"
            />
          </button>
        ))}
      </div>

      <Modal
        isOpen={!!selectedImage}
        onRequestClose={() => setSelectedImage(null)}
        contentLabel="Image Preview"
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50"
      >
        <img src={selectedImage} alt="Preview" className="max-h-[90vh] rounded shadow-lg" />
      </Modal>
    </div>
  );
}

function Home({ events }) {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Event Gallery</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => navigate(`/events/${slugify(event.name)}`)}
            className="p-4 bg-blue-100 rounded hover:bg-blue-200"
          >
            {event.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    console.log("Fetching events...");
    axios
      .get(`${API}/events`)
      .then((res) => {
        console.log("Events loaded:", res.data);
        setEvents(res.data);
      })
      .catch((err) => console.error("Error loading events:", err));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home events={events} />} />
        <Route path="/events/:folderSlug" element={<EventGallery folders={events} />} />
      </Routes>
    </Router>
  );
}

export default App;
