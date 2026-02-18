
import React, { useState, useRef, useEffect } from 'react';
import { Video, UserState } from '../types';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Music, RefreshCcw } from 'lucide-react';

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

  const shorts = videos;

  if (shorts.length === 0) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-700">
        <RefreshCcw className="w-10 h-10 animate-spin-slow opacity-20" />
        <p className="font-black uppercase tracking-widest italic text-xs">Сигналы шортсов не обнаружены...</p>
        <p className="text-[10px] font-bold opacity-50">Нейросеть готовит подборку для вашего узла</p>
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
          <div className="relative h-full aspect-[9/16] bg-black shadow-[0_0_100px_rgba(0,0,0,1)] border-x border-white/5">
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
                src={`https://www.youtube.com/embed/${video.id}?autoplay=${index === activeIndex ? 1 : 0}&controls=0&loop=1&playlist=${video.id}&modestbranding=1&rel=0`}
                allow="autoplay"
              ></iframe>
            )}

            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none"></div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-4 pointer-events-none z-10">
              <div className="flex items-center gap-3 pointer-events-auto">
                <img src={video.channelAvatar} className="w-10 h-10 rounded-full border border-cyan-500/50 shadow-lg" alt="" />
                <span className="font-bold text-sm tracking-tight text-white drop-shadow-md">@{video.channelName.replace(/\s+/g, '').toLowerCase()}</span>
                <button className="bg-cyan-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  Связать
                </button>
              </div>
              <p className="text-sm font-medium line-clamp-2 max-w-[85%] pointer-events-auto leading-snug text-white drop-shadow-md">
                {video.title}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-slate-300 font-bold uppercase tracking-widest pointer-events-auto bg-black/20 backdrop-blur-sm p-2 rounded-lg w-fit">
                <Music className="w-3 h-3 text-cyan-500" /> Сигнал — {video.channelName}
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-20">
              <button 
                onClick={() => onToggleLike(video.id)}
                className="flex flex-col items-center gap-1 group pointer-events-auto"
              >
                <div className={`p-3.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 transition-all group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40 shadow-xl ${userState.likedVideos.includes(video.id) ? 'text-cyan-400 border-cyan-500/30' : 'text-white'}`}>
                  <ThumbsUp className={`w-6 h-6 ${userState.likedVideos.includes(video.id) ? 'fill-cyan-400/20' : ''}`} />
                </div>
                <span className="text-[10px] font-black text-white drop-shadow-lg">{(video.likes + (userState.likedVideos.includes(video.id) ? 1 : 0)).toLocaleString()}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                <div className="p-3.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white transition-all group-hover:bg-slate-800 shadow-xl">
                  <ThumbsDown className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-white drop-shadow-lg uppercase tracking-tighter italic">Нет</span>
              </button>

              <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                <div className="p-3.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white transition-all group-hover:bg-slate-800 shadow-xl">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-white drop-shadow-lg">{video.comments.length}</span>
              </button>

              <button className="flex flex-col items-center gap-1 group pointer-events-auto">
                <div className="p-3.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 text-white transition-all group-hover:bg-slate-800 shadow-xl">
                  <Share2 className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black text-white drop-shadow-lg uppercase tracking-tighter">Сеть</span>
              </button>

              <button className="p-2 pointer-events-auto">
                <MoreVertical className="w-6 h-6 text-slate-400" />
              </button>

              <div className="w-11 h-11 rounded-xl bg-slate-900 border border-white/10 overflow-hidden animate-spin-slow shadow-2xl mt-4">
                <img src={video.channelAvatar} className="w-full h-full object-cover opacity-60" alt="" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShortsFeed;
