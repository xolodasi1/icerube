
import React, { useState, useEffect } from 'react';
import { Video, Comment, Channel, UserState } from '../types';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Sparkles, CheckCircle, BellRing, Bell, Send, ArrowLeft } from 'lucide-react';
import { summarizeVideo } from '../services/geminiService';
import VideoCard from './VideoCard';

interface VideoPlayerProps {
  video: Video;
  onVideoSelect: (video: Video) => void;
  allVideos: Video[];
  isLiked: boolean;
  isSubscribed: boolean;
  subscriberCount: number;
  onToggleLike: (videoId: string) => void;
  onToggleSubscribe: (channelId: string) => void;
  onAddComment: (videoId: string, comment: Comment) => void;
  userState: UserState;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  video, 
  onVideoSelect, 
  allVideos, 
  isLiked, 
  isSubscribed,
  subscriberCount,
  onToggleLike,
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
    <div className="flex flex-col lg:flex-row gap-8 p-4 md:p-10 mt-14 max-w-[1800px] mx-auto animate-in fade-in duration-500">
      <div className="flex-1 min-w-0">
        <div className="aspect-video w-full bg-black rounded-[2rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5">
          {video.isUserUploaded ? (
            <video controls autoPlay className="w-full h-full bg-black" src={video.videoUrl} />
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

        <div className="mt-8">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">{video.title}</h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mt-6 pb-8 border-b border-white/5">
            <div className="flex items-center gap-5">
              <img src={video.channelAvatar} alt="" className="w-14 h-14 rounded-2xl border border-cyan-500/20 p-0.5 object-cover" />
              <div className="mr-4">
                <p className="font-black italic flex items-center gap-2 text-xl tracking-tighter">
                  {video.channelName}
                  <CheckCircle className="w-5 h-5 text-cyan-400" />
                </p>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{subscriberCount.toLocaleString()} Узлов привязано</p>
              </div>
              
              {video.channelId !== userState.channel?.id && (
                <button 
                  onClick={() => onToggleSubscribe(video.channelId)}
                  className={`px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center gap-3 ${
                    isSubscribed 
                    ? 'bg-slate-900 text-slate-500 border border-slate-800' 
                    : 'bg-white text-black shadow-xl shadow-white/5 hover:bg-slate-200'
                  }`}
                >
                  {isSubscribed ? <BellRing className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                  {isSubscribed ? 'Связано' : 'Связать узел'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-900/50 border border-slate-800 rounded-xl h-12 p-1">
                <button 
                  onClick={() => onToggleLike(video.id)}
                  className={`flex items-center gap-2 px-6 py-2 hover:bg-white/5 border-r border-slate-800 transition-all ${isLiked ? 'text-cyan-400' : 'text-slate-400'}`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isLiked ? 'fill-cyan-400/10' : ''}`} />
                  <span className="text-xs font-black">{(video.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
                </button>
                <button className="px-6 py-2 hover:bg-white/5 text-slate-400 transition-colors">
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
              <button className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-6 py-2 h-12 rounded-xl hover:bg-slate-800 transition-all font-black text-[10px] uppercase tracking-widest text-slate-400">
                <Share2 className="w-4 h-4" /> Поделиться
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-slate-900/30 border border-white/5 rounded-[2rem] p-8 text-sm group">
          <div className="flex items-center justify-between mb-6">
            <div className="font-black italic uppercase tracking-widest text-slate-500 text-xs flex gap-6">
              <span>{video.views.toLocaleString()} Импульсов</span>
              <span>{new Date(video.postedAt).toLocaleDateString()}</span>
            </div>
            {!summary && !loadingSummary && (
              <button 
                onClick={handleSummarize}
                className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] text-cyan-400 hover:bg-cyan-500/20 transition-all cold-glow"
              >
                <Sparkles className="w-3 h-3" /> Нейро-инсайт
              </button>
            )}
          </div>
          
          <div className="space-y-6">
            {loadingSummary && <div className="text-cyan-400 animate-pulse font-black uppercase tracking-widest text-[10px]">Обработка сигнала данных...</div>}
            {summary && (
              <div className="p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500"></div>
                <p className="text-slate-300 leading-relaxed italic text-base">"{summary}"</p>
              </div>
            )}
            <p className="whitespace-pre-line text-slate-500 leading-relaxed font-medium text-base">
              {video.description || "Система: Метаданные сигнала не предоставлены."}
            </p>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center gap-8 mb-10">
             <h2 className="text-2xl font-black italic tracking-tighter uppercase">Обратная связь [{video.comments.length}]</h2>
             <div className="h-px flex-1 bg-white/5"></div>
          </div>

          <form onSubmit={handlePostComment} className="flex gap-6 mb-12">
            {userState.channel ? (
              <>
                <img src={userState.channel.avatar} className="w-12 h-12 rounded-xl border border-white/10" alt="" />
                <div className="flex-1 space-y-4">
                  <input 
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Введите протокол ответа..."
                    className="w-full bg-transparent border-b border-slate-800 focus:border-cyan-500 outline-none py-3 font-bold text-sm uppercase tracking-widest transition-all"
                  />
                  <div className="flex justify-end gap-4">
                    <button 
                      type="submit" 
                      disabled={!newComment.trim()}
                      className="px-8 py-2 bg-cyan-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-20 cold-glow transition-all"
                    >
                      Передать
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full p-6 bg-slate-900/40 border border-slate-800 rounded-2xl text-center text-slate-700 font-black uppercase tracking-widest text-xs">
                Для обратной связи требуется идентификация узла.
              </div>
            )}
          </form>

          <div className="space-y-10">
            {video.comments.map((comment) => (
              <div key={comment.id} className="flex gap-6 group">
                <img src={comment.avatar} className="w-12 h-12 rounded-xl grayscale group-hover:grayscale-0 transition-all border border-white/5" alt="" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-cyan-500 uppercase text-[10px] tracking-widest">@{comment.author.replace(/\s+/g, '_').toLowerCase()}</span>
                    <span className="text-slate-700 font-bold uppercase text-[10px] tracking-tighter">{comment.time}</span>
                  </div>
                  <p className="text-slate-300 text-base leading-snug">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:w-[450px] space-y-6">
        <h3 className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-600 italic px-2">Ближайшие сигналы</h3>
        <div className="flex flex-col gap-4">
          {allVideos.filter(v => v.id !== video.id).slice(0, 10).map(v => (
            <VideoCard key={v.id} video={v} layout="list" onClick={onVideoSelect} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
