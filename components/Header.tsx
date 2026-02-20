
import React, { useState } from 'react';
import { Menu, Search, Mic, Video as VideoIcon, Bell, User, Play, Plus, Zap } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  toggleSidebar: () => void;
  onHomeClick: () => void;
  onUploadClick: () => void;
  onProfileClick: () => void;
  userAvatar?: string;
}

const Header: React.FC<HeaderProps> = ({ onSearch, toggleSidebar, onHomeClick, onUploadClick, onProfileClick, userAvatar }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[#05070a]/90 backdrop-blur-2xl flex items-center justify-between px-6 z-50 border-b border-white/5 shadow-[0_1px_20px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-6">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-white/5 rounded-xl transition-all duration-300 active:scale-90"
        >
          <Menu className="w-5 h-5 text-slate-400" />
        </button>
        <div 
          onClick={onHomeClick}
          className="flex items-center gap-2 cursor-pointer select-none group"
        >
          <div className="relative">
            <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all group-hover:scale-110 group-hover:rotate-12">
              <Play className="w-4 h-4 fill-white text-white" />
            </div>
            <div className="absolute inset-0 bg-cyan-400 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
          </div>
          <span className="font-black text-2xl tracking-tighter italic bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent uppercase">
            ice-tube
          </span>
        </div>
      </div>

      <form 
        onSubmit={handleSubmit}
        className="hidden md:flex flex-1 max-w-[700px] ml-10 items-center gap-4"
      >
        <div className="flex flex-1 items-center group">
          <div className="flex flex-1 items-center bg-[#0a0f1d] border border-slate-800 rounded-l-2xl px-5 py-2.5 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.05)] transition-all">
            <Search className="w-4 h-4 text-slate-600 mr-3 group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              placeholder="Поиск в нейросети..."
              className="bg-transparent outline-none w-full text-white placeholder-slate-700 text-xs font-bold uppercase tracking-widest"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            className="bg-[#1e293b] border border-slate-800 border-l-0 px-6 py-2.5 rounded-r-2xl hover:bg-slate-700 transition-all active:bg-cyan-600"
          >
            <Search className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </form>

      <div className="flex items-center gap-5">
        <button 
          onClick={onUploadClick}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 px-4 py-2 rounded-xl transition-all group cold-glow active:scale-95"
        >
          <Zap className="w-4 h-4 text-cyan-400 group-hover:animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] hidden lg:block text-cyan-100">Трансляция</span>
        </button>
        
        <button className="p-2.5 hover:bg-white/5 rounded-xl relative transition-colors group">
          <Bell className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-cyan-500 rounded-full border-2 border-[#05070a] shadow-[0_0_10px_rgba(6,182,212,0.8)]"></span>
        </button>
        
        <button 
          onClick={onProfileClick}
          className="p-0.5 hover:ring-2 ring-cyan-500/50 rounded-xl transition-all active:scale-90 overflow-hidden bg-slate-800 shadow-xl border border-white/5"
        >
          {userAvatar ? (
            <img src={userAvatar} alt="User" className="w-9 h-9 object-cover rounded-lg" />
          ) : (
            <div className="w-9 h-9 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-600" />
            </div>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
