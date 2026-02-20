
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

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

// Supabase Initialization
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("WARNING: Supabase environment variables are missing. Persistence will not work.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors());
app.use(express.json());

// Multer config for temporary storage before uploading to Supabase
const upload = multer({ storage: multer.memoryStorage() });

// API Routes
app.get("/api/videos", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('postedAt', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

app.post("/api/upload", upload.single("video"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`;
    const filePath = `videos/${fileName}`;

    const { data, error } = await supabase.storage
      .from('icetube-assets')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('icetube-assets')
      .getPublicUrl(filePath);

    res.json({ videoUrl: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.post("/api/videos", async (req, res) => {
  try {
    const newVideo = req.body;
    const { data, error } = await supabase
      .from('videos')
      .insert([newVideo])
      .select();

    if (error) throw error;

    io.emit("video:new", data[0]);
    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Error saving video metadata:", error);
    res.status(500).json({ error: "Failed to save video" });
  }
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
