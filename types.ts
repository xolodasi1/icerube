
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  views: number;
  likes: number;
  postedAt: number;
  duration: string;
  description: string;
  category: string;
  videoUrl?: string;
  isUserUploaded?: boolean;
  comments: Comment[];
}

export interface Channel {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  subscribers: number;
}

export interface UserState {
  channel: Channel | null;
  subscriptions: string[];
  likedVideos: string[];
  archivedVideos: string[]; // Virtual "folder" storage
  history: string[];
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  time: string;
}

export type ViewMode = 'all' | 'user' | 'subs' | 'shorts' | 'liked' | 'history' | 'trending' | 'archive';
