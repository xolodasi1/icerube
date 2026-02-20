
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
const supabaseUrl = (process.env.SUPABASE_URL as string) || "";
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("WARNING: Supabase environment variables are missing. Persistence will not work.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Multer config for temporary storage before uploading to Supabase
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// API Routes
app.get("/api/videos", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('postedAt', { ascending: false });
    
    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: error.message || "Failed to fetch videos" });
  }
});

app.post("/api/upload", upload.single("video"), async (req, res) => {
  console.log("Upload request received");
  try {
    if (!req.file) {
      console.error("No file in request");
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    console.log(`Processing file: ${file.originalname}, size: ${file.size}`);
    
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExt}`;
    const filePath = `videos/${fileName}`;

    console.log(`Uploading to Supabase bucket 'icetube-assets' at path: ${filePath}`);
    const { data, error } = await supabase.storage
      .from('icetube-assets')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      return res.status(500).json({ error: error.message });
    }

    console.log("Upload successful, getting public URL");
    const { data: { publicUrl } } = supabase.storage
      .from('icetube-assets')
      .getPublicUrl(filePath);

    console.log("Public URL generated:", publicUrl);
    res.json({ videoUrl: publicUrl });
  } catch (error: any) {
    console.error("Internal Upload error:", error);
    res.status(500).json({ error: error.message || "Upload failed" });
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
    if (!data || data.length === 0) throw new Error("No data returned from insert");

    io.emit("video:new", data[0]);
    res.status(201).json(data[0]);
  } catch (error: any) {
    console.error("Error saving video metadata:", error);
    res.status(500).json({ error: error.message || "Failed to save video" });
  }
});

// Socket.io logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id, "Transport:", socket.conn.transport.name);
  
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
