
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
// Hardcoded values as requested by user
const SUPABASE_URL_HARDCODED = "https://ullomarmkawbrzlfgbfo.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY_HARDCODED = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbG9tYXJta2F3YnJ6bGZnYmZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTU3Nzc0MiwiZXhwIjoyMDg3MTUzNzQyfQ.z2nyeeQRZBS52luGteE7epbgDGJ_ISwAMr89hFluYes";

const supabaseUrl = (process.env.SUPABASE_URL as string) || SUPABASE_URL_HARDCODED;
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY as string) || SUPABASE_SERVICE_ROLE_KEY_HARDCODED;

let supabase: any = null;

const getSupabase = () => {
  if (!supabase) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase environment variables are missing. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }
    supabase = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabase;
};

// Initialize Supabase Storage Bucket
(async () => {
  try {
    const client = getSupabase();
    const { data: buckets, error } = await client.storage.listBuckets();
    if (error) {
      console.warn("Error listing buckets:", error.message);
      return;
    }
    
    const bucketExists = buckets?.some(b => b.name === 'icetube-assets');
    if (!bucketExists) {
      console.log("Creating 'icetube-assets' bucket...");
      const { error: createError } = await client.storage.createBucket('icetube-assets', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['video/*', 'image/*']
      });
      
      if (createError) {
        console.error("Failed to create bucket:", createError.message);
      } else {
        console.log("Bucket 'icetube-assets' created successfully.");
      }
    }
  } catch (e) {
    console.warn("Storage initialization skipped (Supabase not configured or unreachable).");
  }
})();

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
    const client = getSupabase();
    const { data, error } = await client
      .from('videos')
      .select('*')
      .order('postedAt', { ascending: false });
    
    if (error) {
      // Handle missing table error gracefully
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.warn("WARNING: Table 'videos' not found in Supabase. Returning empty list.");
        return res.json([]);
      }
      throw error;
    }
    res.json(data || []);
  } catch (error: any) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: error.message || "Failed to fetch videos" });
  }
});

app.post("/api/upload", upload.single("video"), async (req, res) => {
  console.log("Upload request received");
  try {
    const client = getSupabase();
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
    const { data, error } = await client.storage
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
    const { data: { publicUrl } } = client.storage
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
    const client = getSupabase();
    const newVideo = req.body;
    const { data, error } = await client
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
