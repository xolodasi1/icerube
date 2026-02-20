import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Loader2, PlayCircle, Zap, Search as SearchIcon, Home, 
  Radio, FolderHeart, History, Heart, Terminal 
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [userState, setUserState] = useState<UserState>(() => {
    const saved = localStorage.getItem('gt_v11_user');
    return saved ? JSON.parse(saved) : {
      channel: null,
      subscriptions: [],
      likedVideos: [],
      archivedVideos: [],
      history: []
    };
  });

  const [channelStats, setChannelStats] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('gt_v11_stats');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize Socket.io
  useEffect(() => {
    // NOTE: The "[vite] failed to connect to websocket" error in the console is expected 
    // and benign in this environment (HMR is disabled). It can be ignored.
    
    const newSocket = io({
      transports: ['websocket'],
      reconnectionAttempts: 5,
      timeout: 10000,
    });
    
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connection error (expected in some environments):', err.message);
    });

    newSocket.on('video:new', (newVideo: Video) => {
      setVideos(prev => {
        if (prev.find(v => v.id === newVideo.id)) return prev;
        return [newVideo, ...prev];
      });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch initial videos from server
  useEffect(() => {
    const loadInitialVideos = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/videos');
        let serverVideos = [];
        if (response.ok) {
          serverVideos = await response.json();
        }

        if (serverVideos.length > 0) {
          setVideos(prev => {
            const unique = serverVideos.filter((nv: Video) => !prev.find(pv => pv.id === nv.id));
            return [...unique, ...prev];
          });
        } else {
          // Fallback: If server is empty (e.g. after restart), fetch trends from Gemini
          const trends = await fetchRealVideos("Trending world videos 2025");
          setVideos(trends);
        }
      } catch (e) {
        console.error("Failed to fetch initial videos", e);
        // Even on error, try to show something
        const trends = await fetchRealVideos("Trending world videos 2025");
        setVideos(trends);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialVideos();

    // Fallback polling for serverless environments where WebSockets might fail
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/videos');
        if (response.ok) {
          const latestVideos = await response.json();
          setVideos(prev => {
            const newOnes = latestVideos.filter((nv: Video) => !prev.find(pv => pv.id === nv.id));
            if (newOnes.length === 0) return prev;
            return [...newOnes, ...prev];
          });
        }
      } catch (e) {
        // Silent fail for polling
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('gt_v11_user', JSON.stringify(userState));
    localStorage.setItem('gt_v11_stats', JSON.stringify(channelStats));
  }, [userState, channelStats]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setIsLoading(true);
    setSelectedVideoId(null);
    try {
      const results = await fetchRealVideos(query);
      setVideos(prev => {
        const unique = results.filter(nv => !prev.find(pv => pv.id === nv.id));
        return [...unique, ...prev];
      });
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
    } else if (viewMode === 'archive') {
      results = results.filter(v => userState.archivedVideos.includes(v.id));
    } else if (viewMode === 'history') {
      results = results.filter(v => userState.history.includes(v.id))
        .sort((a, b) => userState.history.indexOf(b.id) - userState.history.indexOf(a.id));
    } else if (viewMode === 'shorts') {
      results = results.filter(v => v.category === 'Шортсы' || v.duration.length <= 4);
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
    
    if ((mode === 'trending' || mode === 'shorts') && filteredVideos.length === 0) {
      setIsLoading(true);
      const query = mode === 'shorts' ? "YouTube Shorts trends 2025" : "Trends YouTube world 2025";
      const newContent = await fetchRealVideos(query);
      setVideos(prev => {
        const unique = newContent.filter(nv => !prev.find(pv => pv.id === nv.id));
        return [...unique, ...prev];
      });
      setIsLoading(false);
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

  const toggleArchive = (videoId: string) => {
    setUserState(prev => {
      const isArchived = prev.archivedVideos.includes(videoId);
      return { 
        ...prev, 
        archivedVideos: isArchived ? prev.archivedVideos.filter(id => id !== videoId) : [...prev.archivedVideos, videoId] 
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
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col">
      <Header 
        onSearch={handleSearch} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onHomeClick={() => { setViewMode('all'); setSelectedVideoId(null); }}
        onUploadClick={() => userState.channel ? setIsUploadModalOpen(true) : setIsChannelModalOpen(true)}
        onProfileClick={() => userState.channel ? handleModeChange('user') : setIsChannelModalOpen(true)}
        userAvatar={userState.channel?.avatar}
      />
      
      <div className="flex flex-1 overflow-hidden pt-14">
        {!selectedVideoId && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onModeChange={handleModeChange}
            currentMode={viewMode}
          />
        )}

        <div className={`flex-1 overflow-y-auto no-scrollbar pb-20 md:pb-0 ${!selectedVideoId && isSidebarOpen ? 'md:ml-60' : !selectedVideoId ? 'md:ml-20' : ''}`}>
          {selectedVideoId ? (
            <VideoPlayer 
              video={videos.find(v => v.id === selectedVideoId) || videos[0]} 
              onVideoSelect={selectVideo}
              allVideos={videos}
              isLiked={userState.likedVideos.includes(selectedVideoId)}
              isArchived={userState.archivedVideos.includes(selectedVideoId)}
              isSubscribed={userState.subscriptions.includes(videos.find(v => v.id === selectedVideoId)?.channelId || '')}
              subscriberCount={channelStats[videos.find(v => v.id === selectedVideoId)?.channelId || ''] || 0}
              onToggleLike={toggleLike}
              onToggleArchive={toggleArchive}
              onToggleSubscribe={toggleSubscribe}
              onAddComment={addComment}
              userState={userState}
            />
          ) : viewMode === 'shorts' ? (
            <ShortsFeed videos={filteredVideos} onToggleLike={toggleLike} userState={userState} />
          ) : (
            <div className="flex flex-col">
              {/* Categories */}
              <div className="sticky top-0 bg-[#05070a]/90 backdrop-blur-xl z-30 flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-white/5">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                      selectedCategory === cat ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="p-4 md:p-8 flex-1">
                {isLoading ? (
                  <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-cyan-400">
                    <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                    <p className="font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Ожидание ответа нейросети...</p>
                  </div>
                ) : filteredVideos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 animate-feed">
                    {filteredVideos.map(video => (
                      <VideoCard key={video.id} video={video} onClick={selectVideo} />
                    ))}
                  </div>
                ) : (
                  <div className="h-[70vh] flex flex-col items-center justify-center text-center px-6">
                    <div className="relative mb-8 group">
                      <div className="absolute inset-0 bg-cyan-500/10 blur-3xl rounded-full scale-150 group-hover:bg-cyan-500/20 transition-all"></div>
                      <Terminal className="w-20 h-20 text-slate-800 relative z-10 group-hover:text-slate-700 transition-colors" />
                    </div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-600 mb-2">
                      Линия свободна
                    </h2>
                    <p className="text-slate-800 text-[10px] font-black uppercase tracking-[0.4em] max-w-xs leading-loose">
                      Введите поисковый запрос в терминал сверху, чтобы инициализировать поток данных.
                    </p>
                    <div className="mt-12 flex gap-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-1.5 h-1.5 bg-slate-900 rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0a0f1d]/95 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around z-[60] px-2 pb-safe">
        <button onClick={() => { handleModeChange('all'); }} className={`flex flex-col items-center gap-1 ${viewMode === 'all' && videos.length === 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
          <Home className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Главная</span>
        </button>
        <button onClick={() => handleModeChange('shorts')} className={`flex flex-col items-center gap-1 ${viewMode === 'shorts' ? 'text-cyan-400' : 'text-slate-500'}`}>
          <Zap className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Шортсы</span>
        </button>
        <button onClick={() => handleModeChange('subs')} className={`flex flex-col items-center gap-1 ${viewMode === 'subs' ? 'text-cyan-400' : 'text-slate-500'}`}>
          <Radio className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Узлы</span>
        </button>
        <button onClick={() => handleModeChange('archive')} className={`flex flex-col items-center gap-1 ${viewMode === 'archive' ? 'text-cyan-400' : 'text-slate-500'}`}>
          <FolderHeart className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Архив</span>
        </button>
      </nav>

      {isUploadModalOpen && (
        <UploadModal 
          onClose={() => setIsUploadModalOpen(false)} 
          channel={userState.channel}
          onUpload={async (v) => {
            setVideos(prev => [v, ...prev]);
            // 1. Notify via socket for immediate update if connected
            socket?.emit('video:upload', v);
            
            // 2. Persist to server via POST (more reliable for serverless)
            try {
              await fetch('/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(v)
              });
            } catch (e) {
              console.error("Failed to persist video to server", e);
            }
          }} 
        />
      )}
      {isChannelModalOpen && <ChannelModal onClose={() => setIsChannelModalOpen(false)} onCreate={(c) => setUserState({...userState, channel: c})} />}
    </div>
  );
};

export default App;
