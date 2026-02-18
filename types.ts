
export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channelId: string;
  channelName: string;
  channelAvatar: string;
  views: number;
  likes: number;
  postedAt: number; // timestamp
  duration: string;
  description: string;
  category: string;
  videoUrl?: string;
  isUserUploaded?: boolean;
  comments: Comment[]; // Now comments are part of the video object
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
  subscriptions: string[]; // array of channel IDs
  likedVideos: string[]; // array of video IDs
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  likes: number;
  time: string;
}

export type Category = 'All' | 'Music' | 'Gaming' | 'News' | 'Tech' | 'Education' | 'Entertainment';
