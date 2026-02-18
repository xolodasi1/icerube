
import React from 'react';
import { Video } from '../types';
import { MoreVertical, CheckCircle, Eye, Heart } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
  layout?: 'grid' | 'list';
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, layout = 'grid' }) => {
  const formatCompact = (n: number) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
  };

  if (layout === 'list') {
    return (
      <div 
        onClick={() => onClick(video)}
        className="flex gap-3 group cursor-pointer mb-3 p-1 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5"
      >
        <div className="relative flex-shrink-0 w-44 h-24 rounded-lg overflow-hidden border border-white/5 shadow-lg">
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
          <span className="absolute bottom-1.5 right-1.5 bg-black/90 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 font-black rounded border border-white/10 uppercase">
            {video.duration}
          </span>
        </div>
        <div className="flex flex-col gap-1 flex-1 py-1">
          <h3 className="text-sm font-bold line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">
            {video.title}
          </h3>
          <div className="text-[11px] text-slate-500 mt-1 font-bold space-y-0.5">
            <p className="hover:text-white transition-colors flex items-center gap-1 uppercase tracking-tighter">
              {video.channelName} 
              <CheckCircle className="w-3 h-3 text-cyan-600" />
            </p>
            <p className="flex items-center gap-2">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatCompact(video.views)}</span>
              <span>•</span>
              <span>{timeAgo(video.postedAt)}</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(video)}
      className="flex flex-col gap-4 group cursor-pointer"
    >
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-[#0a0f1d] border border-white/5 shadow-2xl transition-all duration-500 group-hover:shadow-cyan-500/20 group-hover:border-cyan-500/30">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a]/80 via-transparent to-transparent opacity-60"></div>
        <span className="absolute bottom-3 right-3 bg-[#05070a]/90 backdrop-blur-md text-white text-[11px] px-2 py-1 font-black rounded-lg border border-white/10 shadow-2xl tracking-widest uppercase">
          {video.duration}
        </span>
      </div>
      
      <div className="flex gap-4 px-1">
        <img 
          src={video.channelAvatar} 
          alt={video.channelName} 
          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-white/5 group-hover:border-cyan-500/50 transition-all duration-500 shadow-lg"
        />
        <div className="flex flex-col gap-1.5 flex-1 pr-2">
          <h3 className="font-bold text-lg line-clamp-2 leading-[1.2] group-hover:text-cyan-400 transition-colors tracking-tight">
            {video.title}
          </h3>
          <div className="text-sm font-bold text-slate-500">
            <p className="hover:text-slate-200 transition-colors flex items-center gap-1.5 uppercase tracking-tighter text-xs">
              {video.channelName}
              <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />
            </p>
            <div className="flex items-center gap-3 mt-1 text-[11px] opacity-80 uppercase tracking-widest">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {formatCompact(video.views)}</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {formatCompact(video.likes)}</span>
              <span>{timeAgo(video.postedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
