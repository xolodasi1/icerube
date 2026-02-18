
import React, { useState, useRef, useEffect } from 'react';
import { Video, UserState } from '../types';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Music, UserPlus } from 'lucide-react';

interface ShortsFeedProps {
  videos: Video[];
  onToggleLike: (id: string) => void;
  userState: UserState;
}

const ShortsFeed: React.FC<ShortsFeedProps> = ({ videos, onToggleLike, userState }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / containerRef.current.clientHeight);
      if (index !== activeIndex) setActiveIndex(index);
    }
  };

  const shorts = videos.length > 0 ? videos : [];

  if (shorts.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-700 font-black uppercase tracking-widest italic">
        Сигналы шортсов не обнаружены
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      className="h-[calc(100vh-3.5rem)] overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black"
    >
      {shorts.map((video, index) => (
        <div key={video.id} className="h-full w-full snap-start relative flex items-center justify-center bg-slate-950">
          <div className="relative h-full aspect-[9/16] bg-black shadow-[0_0_100px_rgba(0,0,0,1)]">
            {video.isUserUploaded ? (
              <video 
                src={video.videoUrl} 
                loop 
                autoPlay={index === activeIndex} 
                muted={index !== activeIndex}
                className="h-full w-full object-cover"
              />
            ) : (
              <iframe
                className="h-full w-full pointer-events-none"
                src={`https://www.youtube.com/embed/${video.id}?autoplay=${index === activeIndex ? 1 : 0}&controls=0&loop=1&playlist=${video.id}`}
                allow="autoplay"
              ></iframe>
            )}

            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4 pointer-events-none">
              <div className="flex items-center gap-3 pointer-events-auto">
                <img src={video.channelAvatar} className="w-10 h-10 rounded-full border border-cyan-500/50" alt="" />
                <span className="font-bold text-sm tracking-tight">@{video.channelName.replace(/\s+/g, '').toLowerCase()}</span>
                <button className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest hover:scale-105 transition-all">
                  Подписаться
                </button>
              </div>
              <p className="text-sm font-medium line-clamp-2 max-w-[80%] pointer-events-auto leading-snug">
                {video.title}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest pointer-events-auto">
                <Music className="w-3 h-3 text-cyan-500" /> Оригинальный звук — {video.channelName}
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col gap-6 items-center">
              <button 
                onClick={() => onToggleLike(video.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className={`p-3 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/5 transition-all group-hover:bg-cyan-500/20 ${userState.likedVideos.includes(video.id) ? 'text-cyan-400 border-cyan-500/30' : 'text-white'}`}>
                  <ThumbsUp className={`w-6 h-6 ${userState.likedVideos.includes(video.id) ? 'fill-cyan-400/20' : ''}`} />
                </div>
                <span className="text-[10px] font-black">{video.likes + (userState.likedVideos.includes(video.id) ? 1 : 0)}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/5 text-white transition-all group-hover:bg-slate-800">
                  <ThumbsDown className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black italic uppercase">Нет</span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/5 text-white transition-all group-hover:bg-slate-800">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black">{video.comments.length}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group">
                <div className="p-3 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/5 text-white transition-all group-hover:bg-slate-800">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black italic uppercase">Поделиться</span>
              </button>

              <button className="p-1">
                <MoreVertical className="w-6 h-6 text-slate-500" />
              </button>

              <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 overflow-hidden animate-spin-slow">
                <img src={video.channelAvatar} className="w-full h-full object-cover opacity-50" alt="" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShortsFeed;
