-- Run this SQL in your Supabase SQL Editor to set up the database

-- Create the videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    thumbnail TEXT,
    "channelId" TEXT,
    "channelName" TEXT,
    "channelAvatar" TEXT,
    views BIGINT DEFAULT 0,
    likes BIGINT DEFAULT 0,
    "postedAt" BIGINT,
    duration TEXT,
    description TEXT,
    category TEXT,
    "videoUrl" TEXT,
    "isUserUploaded" BOOLEAN DEFAULT FALSE,
    comments JSONB DEFAULT '[]'::jsonb
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON public.videos
    FOR SELECT USING (true);

-- Create policy to allow authenticated users (or service role) to insert
CREATE POLICY "Allow insert access" ON public.videos
    FOR INSERT WITH CHECK (true);

-- Create storage bucket if it doesn't exist (this is usually done via dashboard or API, but SQL can verify)
-- Note: Storage buckets are managed via the storage schema, usually better to use the dashboard or client API.
