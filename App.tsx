
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, CheckCircle, Radio, PlayCircle } from 'lucide-react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import VideoCard from './components/VideoCard';
import VideoPlayer from './components/VideoPlayer';
import UploadModal from './components/UploadModal';
import ChannelModal from './components/ChannelModal';
import { CATEGORIES } from './constants';
import { Video, UserState, Channel, Comment } from './types';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  
  // App Data
  const [videos, setVideos] = useState<Video[]>([]);
  const [userState, setUserState] = useState<UserState>({
    channel: null,
    subscriptions: [],
    likedVideos: []
  });

  // REAL Subscriber Stats: { [channelId]: number }
  const [channelStats, setChannelStats] = useState<Record<string, number>>({});
  
  // UI States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'user' | 'subs'>('all');

  // Persistence
  useEffect(() => {
    const savedVideos = localStorage.getItem('gt_v3_videos');
    const savedUser = localStorage.getItem('gt_v3_user');
    const savedStats = localStorage.getItem('gt_v3_stats');
    
    if (savedVideos) setVideos(JSON.parse(savedVideos));
    if (savedUser) setUserState(JSON.parse(savedUser));
    if (savedStats) setChannelStats(JSON.parse(savedStats));
  }, []);

  useEffect(() => {
    localStorage.setItem('gt_v3_videos', JSON.stringify(videos));
    localStorage.setItem('gt_v3_user', JSON.stringify(userState));
    localStorage.setItem('gt_v3_stats', JSON.stringify(channelStats));
  }, [videos, userState, channelStats]);

  const selectedVideo = useMemo(() => 
    videos.find(v => v.id === selectedVideoId) || null
  , [videos, selectedVideoId]);

  const filteredVideos = useMemo(() => {
    let results = [...videos];
    
    if (viewMode === 'user' && userState.channel) {
      results = results.filter(v => v.channelId === userState.channel?.id);
    } else if (viewMode === 'subs') {
      results = results.filter(v => userState.subscriptions.includes(v.channelId));
    }
    
    if (selectedCategory !== 'All') {
      results = results.filter(v => v.category === selectedCategory);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.channelName.toLowerCase().includes(q)
      );
    }
    return results.sort((a, b) => b.postedAt - a.postedAt);
  }, [videos, selectedCategory, searchQuery, userState, viewMode]);

  const handleHomeClick = () => {
    setSelectedVideoId(null);
    setSearchQuery('');
    setSelectedCategory('All');
    setViewMode('all');
  };

  const handleProfileClick = () => {
    if (!userState.channel) {
      setIsChannelModalOpen(true);
    } else {
      setSelectedVideoId(null);
      setViewMode('user');
      setSearchQuery('');
    }
  };

  const handleUploadClick = () => {
    if (!userState.channel) {
      setIsChannelModalOpen(true);
    } else {
      setIsUploadModalOpen(true);
    }
  };

  const handleCreateChannel = (channel: Channel) => {
    setUserState(prev => ({ ...prev, channel }));
    setChannelStats(prev => ({ ...prev, [channel.id]: 0 }));
    setIsChannelModalOpen(false);
    setViewMode('user');
  };

  const handleUpload = (newVideo: Video) => {
    if (userState.channel) {
      newVideo.channelId = userState.channel.id;
      newVideo.channelName = userState.channel.name;
      newVideo.channelAvatar = userState.channel.avatar;
    }
    newVideo.postedAt = Date.now();
    newVideo.views = 0;
    newVideo.likes = 0;
    newVideo.comments = [];
    
    setVideos(prev => [newVideo, ...prev]);
    setSelectedVideoId(newVideo.id);
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
    if (channelId === userState.channel?.id) return;
    
    setUserState(prev => {
      const isSubbed = prev.subscriptions.includes(channelId);
      const newSubs = isSubbed ? prev.subscriptions.filter(id => id !== channelId) : [...prev.subscriptions, channelId];
      
      setChannelStats(currentStats => {
        const count = currentStats[channelId] || 0;
        return { ...currentStats, [channelId]: isSubbed ? Math.max(0, count - 1) : count + 1 };
      });

      return { ...prev, subscriptions: newSubs };
    });
  };

  const addComment = (videoId: string, comment: Comment) => {
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, comments: [comment, ...v.comments] } : v));
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 selection:bg-cyan-500/30">
      <Header 
        onSearch={setSearchQuery} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onHomeClick={handleHomeClick}
        onUploadClick={handleUploadClick}
        onProfileClick={handleProfileClick}
        userAvatar={userState.channel?.avatar}
      />
      
      {!selectedVideo && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onModeChange={setViewMode}
          currentMode={viewMode}
          hasSubscribed={userState.subscriptions.length > 0}
        />
      )}

      {selectedVideo ? (
        <VideoPlayer 
          video={selectedVideo} 
          onVideoSelect={(v) => setSelectedVideoId(v.id)}
          allVideos={videos}
          isLiked={userState.likedVideos.includes(selectedVideo.id)}
          isSubscribed={userState.subscriptions.includes(selectedVideo.channelId)}
          subscriberCount={channelStats[selectedVideo.channelId] || 0}
          onToggleLike={toggleLike}
          onToggleSubscribe={toggleSubscribe}
          onAddComment={addComment}
          userState={userState}
        />
      ) : (
        <main className={`transition-all duration-500 pt-14 ${isSidebarOpen ? 'md:ml-60' : 'md:ml-20'}`}>
          <div className={`fixed top-14 right-0 ${isSidebarOpen ? 'md:left-60' : 'md:left-20'} bg-[#05070a]/90 backdrop-blur-xl z-30 flex items-center gap-3 px-6 py-4 overflow-x-auto no-scrollbar transition-all duration-500 border-b border-white/5`}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                  selectedCategory === cat 
                    ? 'bg-cyan-500 text-white border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                    : 'bg-slate-900/50 hover:bg-slate-800 border-slate-800 text-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="p-0 mt-14">
            {viewMode === 'user' && userState.channel && (
              <div className="w-full animate-feed mb-10">
                <div className="h-48 md:h-64 w-full bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border-b border-white/5 relative overflow-hidden">
                   <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                </div>
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 -mt-16 flex flex-col md:flex-row items-center md:items-end gap-6 pb-8 border-b border-white/5">
                  <div className="relative group">
                    <img 
                      src={userState.channel.avatar} 
                      className="w-32 h-32 md:w-40 md:h-40 rounded-3xl object-cover border-4 border-[#05070a] shadow-2xl relative z-10" 
                      alt="Profile" 
                    />
                    <div className="absolute -inset-2 bg-cyan-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition-all duration-500"></div>
                  </div>
                  <div className="flex-1 text-center md:text-left pb-2">
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase flex items-center justify-center md:justify-start gap-3">
                      {userState.channel.name}
                      <CheckCircle className="w-6 h-6 text-cyan-400" />
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm mt-1">
                      {userState.channel.handle} • {filteredVideos.length} Broadcasts • {channelStats[userState.channel.id] || 0} Nodes Linked
                    </p>
                  </div>
                  <button onClick={handleUploadClick} className="mb-2 bg-white text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl">
                    New Broadcast
                  </button>
                </div>
              </div>
            )}

            <div className="px-6 md:px-10 py-10 max-w-[2000px] mx-auto">
              <div className="mb-10 flex items-center justify-between">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                  <span className="w-1.5 h-8 bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,1)]"></span>
                  {viewMode === 'user' ? 'Local Archive' : viewMode === 'subs' ? 'Linked Networks' : 'Global Feed'}
                </h2>
              </div>

              {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-8 gap-y-14 animate-feed">
                  {filteredVideos.map(video => (
                    <VideoCard 
                      key={video.id} 
                      video={video} 
                      onClick={(v) => setSelectedVideoId(v.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[40vh] border-2 border-dashed border-slate-900 rounded-[3rem] bg-slate-900/5 group">
                  <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-white/5 group-hover:border-cyan-500/30 transition-all">
                    <PlayCircle className="w-8 h-8 text-slate-800 group-hover:text-cyan-600 transition-colors" />
                  </div>
                  <p className="text-xl font-black italic text-slate-800 uppercase tracking-tighter">No signals detected in this sector</p>
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {isUploadModalOpen && <UploadModal onClose={() => setIsUploadModalOpen(false)} onUpload={handleUpload} />}
      {isChannelModalOpen && <ChannelModal onClose={() => setIsChannelModalOpen(false)} onCreate={handleCreateChannel} />}
    </div>
  );
};

export default App;
