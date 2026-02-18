
import React, { useState, useMemo, useEffect } from 'react';
import { Loader2, PlayCircle, Zap, Search as SearchIcon } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoCard from './components/VideoCard';
import VideoPlayer from './components/VideoPlayer';
import ShortsFeed from './components/ShortsFeed';
import UploadModal from './components/UploadModal';
import ChannelModal from './components/ChannelModal';
import { CATEGORIES } from './constants';
import { Video, UserState, Channel, Comment, ViewMode } from './types';
import { fetchRealVideos } from './services/geminiService';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('gt_v9_user');
    return saved ? JSON.parse(saved) : {
      channel: null,
      subscriptions: [],
      likedVideos: [],
      history: []
    };
  });

  const [channelStats, setChannelStats] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('gt_v9_stats');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('gt_v9_user', JSON.stringify(userState));
    localStorage.setItem('gt_v9_stats', JSON.stringify(channelStats));
  }, [userState, channelStats]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setIsLoading(true);
    setSelectedVideoId(null);
    try {
      const results = await fetchRealVideos(query);
      setVideos(results);
      setViewMode('all');
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVideos = useMemo(() => {
    let results = [...videos];
    
    if (viewMode === 'user' && userState.channel) {
      results = results.filter(v => v.channelId === userState.channel?.id || v.isUserUploaded);
    } else if (viewMode === 'subs') {
      results = results.filter(v => userState.subscriptions.includes(v.channelId));
    } else if (viewMode === 'liked') {
      results = results.filter(v => userState.likedVideos.includes(v.id));
    } else if (viewMode === 'history') {
      results = results.filter(v => userState.history.includes(v.id))
        .sort((a, b) => userState.history.indexOf(b.id) - userState.history.indexOf(a.id));
    } else if (viewMode === 'shorts') {
      results = results.filter(v => v.category === 'Шортсы' || v.duration.length <= 4 || v.title.toLowerCase().includes('shorts'));
    }
    
    if (selectedCategory !== 'Все') {
      results = results.filter(v => v.category === selectedCategory);
    }
    
    return results;
  }, [videos, selectedCategory, userState, viewMode]);

  const selectVideo = (video: Video) => {
    setSelectedVideoId(video.id);
    setUserState(prev => ({
      ...prev,
      history: [video.id, ...prev.history.filter(id => id !== video.id)].slice(0, 50)
    }));
  };

  const handleModeChange = async (mode: ViewMode) => {
    setViewMode(mode);
    setSelectedVideoId(null);
    
    // Fetch content if switching to special views and list is empty
    if (mode === 'trending' || (mode === 'shorts' && filteredVideos.length === 0)) {
      setIsLoading(true);
      const query = mode === 'shorts' ? "YouTube Shorts trending 2025" : "Популярное на YouTube сегодня";
      const newContent = await fetchRealVideos(query);
      setVideos(newContent);
      setIsLoading(false);
    } else if (mode === 'all') {
      setVideos([]); // Reset home to empty if desired, or keep search results
      setSearchQuery('');
      setSelectedCategory('Все');
    }
  };

  const toggleLike = (videoId: string) => {
    setUserState(prev => {
      const isLiked = prev.likedVideos.includes(videoId);
      return { 
        ...prev, 
        likedVideos: isLiked ? prev.likedVideos.filter(id => id !== videoId) : [...prev.likedVideos, videoId] 
      };
    });
  };

  const toggleSubscribe = (channelId: string) => {
    setUserState(prev => {
      const isSubbed = prev.subscriptions.includes(channelId);
      const newSubs = isSubbed ? prev.subscriptions.filter(id => id !== channelId) : [...prev.subscriptions, channelId];
      setChannelStats(currentStats => ({
        ...currentStats,
        [channelId]: Math.max(0, (currentStats[channelId] || 0) + (isSubbed ? -1 : 1))
      }));
      return { ...prev, subscriptions: newSubs };
    });
  };

  const addComment = (videoId: string, comment: Comment) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, comments: [comment, ...v.comments] } : v));
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100">
      <Header 
        onSearch={handleSearch} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onHomeClick={() => handleModeChange('all')}
        onUploadClick={() => userState.channel ? setIsUploadModalOpen(true) : setIsChannelModalOpen(true)}
        onProfileClick={() => userState.channel ? handleModeChange('user') : setIsChannelModalOpen(true)}
        userAvatar={userState.channel?.avatar}
      />
      
      {!selectedVideoId && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onModeChange={handleModeChange}
          currentMode={viewMode}
        />
      )}

      {selectedVideoId ? (
        <VideoPlayer 
          video={videos.find(v => v.id === selectedVideoId) || videos[0]} 
          onVideoSelect={selectVideo}
          allVideos={videos}
          isLiked={userState.likedVideos.includes(selectedVideoId)}
          isSubscribed={userState.subscriptions.includes(videos.find(v => v.id === selectedVideoId)?.channelId || '')}
          subscriberCount={channelStats[videos.find(v => v.id === selectedVideoId)?.channelId || ''] || 0}
          onToggleLike={toggleLike}
          onToggleSubscribe={toggleSubscribe}
          onAddComment={addComment}
          userState={userState}
        />
      ) : viewMode === 'shorts' ? (
        <main className={`pt-14 ${isSidebarOpen ? 'md:ml-60' : 'md:ml-20'}`}>
          {isLoading ? (
            <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
               <div className="relative">
                  <Loader2 className="w-16 h-16 text-cyan-500 animate-spin" />
                  <Zap className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto animate-pulse" />
               </div>
               <p className="font-black uppercase tracking-[0.4em] text-[10px] text-cyan-400/60">Инициализация нейро-шортсов...</p>
            </div>
          ) : (
            <ShortsFeed videos={filteredVideos} onToggleLike={toggleLike} userState={userState} />
          )}
        </main>
      ) : (
        <main className={`transition-all duration-500 pt-14 ${isSidebarOpen ? 'md:ml-60' : 'md:ml-20'}`}>
          <div className={`fixed top-14 right-0 ${isSidebarOpen ? 'md:left-60' : 'md:left-20'} bg-[#05070a]/90 backdrop-blur-xl z-30 flex items-center gap-3 px-6 py-4 overflow-x-auto no-scrollbar border-b border-white/5`}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-cyan-500 border-cyan-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10 mt-14 min-h-[calc(100vh-7rem)] flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-6 text-cyan-400">
                <div className="relative">
                  <Loader2 className="w-14 h-14 animate-spin opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="font-black uppercase tracking-[0.5em] text-[10px]">Сканирование_пространства</p>
                  <p className="text-[8px] font-bold text-slate-700 uppercase tracking-widest italic">Связь с Gemini API установлена...</p>
                </div>
              </div>
            ) : filteredVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 animate-feed">
                {filteredVideos.map(video => (
                  <VideoCard key={video.id} video={video} onClick={selectVideo} />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="w-32 h-32 bg-slate-900/30 rounded-full flex items-center justify-center mb-8 border border-white/5 relative group">
                  <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
                  <SearchIcon className="w-12 h-12 text-slate-800 relative z-10" />
                </div>
                <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-4 bg-gradient-to-b from-white to-slate-800 bg-clip-text text-transparent">
                  Сигналы не обнаружены
                </h2>
                <p className="text-slate-600 font-bold uppercase tracking-[0.3em] text-[10px] max-w-xs leading-loose">
                  Система GeminiTube находится в режиме ожидания. Используйте поиск, чтобы найти трансляции в глобальной сети.
                </p>
                <div className="mt-8 flex gap-4">
                  <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping"></div>
                  <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping [animation-delay:200ms]"></div>
                  <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping [animation-delay:400ms]"></div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} onUpload={(v) => setVideos([v, ...videos])} />}
      {isChannelModalOpen && <ChannelModal onClose={() => setIsChannelModalOpen(false)} onCreate={(c) => setUserState({...userState, channel: c})} />}
    </div>
  );
};

export default App;
