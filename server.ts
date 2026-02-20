
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// In-memory store for videos
let videos: any[] = [
  {
    id: 'init-1',
    title: 'Добро пожаловать в IceTube',
    description: 'Первое видео в нашей новой сети.',
    category: 'Развлечения',
    thumbnail: 'https://picsum.photos/seed/ice1/800/450',
    channelId: 'system',
    channelName: 'IceTube System',
    channelAvatar: 'https://picsum.photos/seed/system/100/100',
    views: 1234,
    likes: 56,
    postedAt: Date.now() - 3600000,
    duration: '1:45',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    isUserUploaded: true,
    comments: []
  },
  {
    id: 'init-2',
    title: 'Демонстрация нейросети',
    description: 'Как работает наш поиск.',
    category: 'Технологии',
    thumbnail: 'https://picsum.photos/seed/ice2/800/450',
    channelId: 'system',
    channelName: 'IceTube System',
    channelAvatar: 'https://picsum.photos/seed/system/100/100',
    views: 890,
    likes: 42,
    postedAt: Date.now() - 7200000,
    duration: '2:15',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    isUserUploaded: true,
    comments: []
  }
];

// API Routes
app.get("/api/videos", (req, res) => {
  res.json(videos);
});

app.post("/api/upload", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const videoUrl = `/uploads/${req.file.filename}`;
  res.json({ videoUrl });
});

app.post("/api/videos", (req, res) => {
  const newVideo = req.body;
  videos = [newVideo, ...videos];
  io.emit("video:new", newVideo);
  res.status(201).json(newVideo);
});

// Socket.io logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "Transport:", socket.conn.transport.name);
  
  socket.on("video:upload", (video) => {
    videos = [video, ...videos];
    io.emit("video:new", video);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
