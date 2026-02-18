
import React, { useState, useEffect } from 'react';
import { Video, Comment, Channel, UserState } from '../types';
import { ThumbsUp, ThumbsDown, Share2, Download, Sparkles, CheckCircle, BellRing, Bell, FolderPlus, FolderCheck } from 'lucide-react';
import { summarizeVideo } from '../services/geminiService';
import VideoCard from './VideoCard';

interface VideoPlayerProps {
  video: Video;
  onVideoSelect: (video: Video) => void;
  allVideos: Video[];
  isLiked: boolean;
  isArchived: boolean;
  isSubscribed: boolean;
  subscriberCount: number;
  onToggleLike: (videoId: string) => void;
  onToggleArchive: (videoId: string) => void;
  onToggleSubscribe: (channelId: string) => void;
  onAddComment: (videoId: string, comment: Comment) => void;
  userState: UserState;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  onVideoSelect, 
  allVideos, 
  isLiked, 
  isArchived,
  isSubscribed,
  subscriberCount,
  onToggleLike,
  onToggleArchive,
  onToggleSubscribe,
  onAddComment,
  userState
}) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    setSummary(null);
    window.scrollTo(0, 0);
  }, [video.id]);

  const handleSummarize = async () => {
    setLoadingSummary(true);
    const res = await summarizeVideo(video.title, video.description);
    setSummary(res);
    setLoadingSummary(false);
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userState.channel) return;

    const comment: Comment = {
      id: 'com-' + Math.random().toString(36).substr(2, 9),
      author: userState.channel.name,
      avatar: userState.channel.avatar,
      text: newComment,
      likes: 0,
      time: 'Только что'
    };

    onAddComment(video.id, comment);
    setNewComment('');
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex-1 min-w-0">
        <div className="aspect-video w-full bg-black rounded-xl md:rounded-3xl overflow-hidden shadow-2xl border border-white/5">
          {video.isUserUploaded ? (
            <video controls autoPlay className="w-full h-full" src={video.videoUrl} />
          ) : (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          )}
        </div>

        <div className="mt-6">
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-tight">{video.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <img src={video.channelAvatar} alt="" className="w-10 h-10 md:w-12 md:h-12 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-black italic flex items-center gap-1.5 text-sm md:text-base tracking-tighter truncate">
                  {video.channelName}
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                </p>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{subscriberCount.toLocaleString()} узлов</p>
              </div>
              
              <button 
                onClick={() => onToggleSubscribe(video.channelId)}
                className={`px-4 md:px-6 py-2 rounded-lg font-black uppercase tracking-widest text-[9px] transition-all ${
                  isSubscribed ? 'bg-slate-900 text-slate-600' : 'bg-white text-black'
                }`}
              >
                {isSubscribed ? 'Связано' : 'Связать'}
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center bg-slate-900/50 border border-slate-800 rounded-lg p-0.5">
                <button 
                  onClick={() => onToggleLike(video.id)}
                  className={`flex items-center gap-2 px-4 py-2 border-r border-slate-800 transition-all ${isLiked ? 'text-cyan-400' : 'text-slate-400'}`}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-cyan-400/10' : ''}`} />
                  <span className="text-[10px] font-black">{(video.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
                </button>
                <button className="px-4 py-2 text-slate-400">
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <button 
                onClick={() => onToggleArchive(video.id)}
                className={`flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg transition-all font-black text-[9px] uppercase tracking-widest ${isArchived ? 'text-cyan-400 border-cyan-500/30' : 'text-slate-400'}`}
              >
                {isArchived ? <FolderCheck className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5" />}
                {isArchived ? 'В папке' : 'В архив'}
              </button>

              <button className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-lg text-slate-400 font-black text-[9px] uppercase tracking-widest">
                <Share2 className="w-3.5 h-3.5" /> Сеть
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-slate-900/30 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-4 text-[9px] font-black uppercase text-slate-600 tracking-widest">
              <span>{video.views.toLocaleString()} импульсов</span>
              <span>{new Date(video.postedAt).toLocaleDateString()}</span>
            </div>
            <button onClick={handleSummarize} className="text-[9px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/5 px-3 py-1 rounded-full border border-cyan-500/20">
              Нейро-инсайт
            </button>
          </div>
          <div className="text-xs md:text-sm text-slate-400 leading-relaxed">
            {summary && <p className="mb-4 text-cyan-100 italic p-3 bg-cyan-500/5 border-l-2 border-cyan-500 rounded-r-lg">"{summary}"</p>}
            <p className="whitespace-pre-line">{video.description || "Система: Описание не обнаружено."}</p>
          </div>
        </div>

        <div className="mt-12">
           <h2 className="text-lg font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3">
             Обратная связь <span className="text-[10px] text-slate-700 font-black px-2 py-0.5 bg-slate-900 rounded-md">[{video.comments.length}]</span>
           </h2>
           <form onSubmit={handlePostComment} className="flex gap-4 mb-8">
              {userState.channel ? (
                <>
                  <img src={userState.channel.avatar} className="w-10 h-10 rounded-lg" alt="" />
                  <input 
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Введите сигнал ответа..."
                    className="flex-1 bg-transparent border-b border-slate-800 focus:border-cyan-500 outline-none py-2 font-bold text-xs uppercase"
                  />
                  <button type="submit" className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">OK</button>
                </>
              ) : (
                <div className="w-full p-4 bg-slate-900/40 rounded-xl text-center text-[9px] font-black uppercase text-slate-700">Требуется узел связи для отправки</div>
              )}
           </form>
           <div className="space-y-6">
              {video.comments.map(c => (
                <div key={c.id} className="flex gap-4">
                   <img src={c.avatar} className="w-9 h-9 rounded-lg opacity-60" alt="" />
                   <div>
                      <p className="text-[9px] font-black text-cyan-500 mb-1">@{c.author.toLowerCase()}</p>
                      <p className="text-xs text-slate-300 leading-snug">{c.text}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      <div className="xl:w-[400px] space-y-4">
        <h3 className="font-black uppercase tracking-widest text-[9px] text-slate-700 mb-4">Схожие сигналы</h3>
        <div className="flex flex-col gap-3">
          {allVideos.filter(v => v.id !== video.id).slice(0, 12).map(v => (
            <VideoCard key={v.id} video={v} layout="list" onClick={onVideoSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
