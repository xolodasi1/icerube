
import React from 'react';
import { Home, Compass, PlaySquare, Clock, ThumbsUp, ChevronRight, UserCircle, History, Flame, Music2, Gamepad2, Trophy, Settings, HelpCircle, Radio, Zap, FolderHeart } from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
      active 
      ? 'bg-cyan-500/10 text-cyan-400 font-black italic' 
      : 'hover:bg-white/5 text-slate-500 hover:text-white'
    }`}
  >
    {active && <div className="absolute left-0 top-0 w-1 h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,1)]"></div>}
    <Icon className={`w-5 h-5 transition-transform ${active ? 'text-cyan-400' : 'group-hover:scale-110'}`} />
    <span className="text-xs font-bold uppercase tracking-widest truncate">{label}</span>
  </button>
);

interface SidebarProps {
  isOpen: boolean;
  onModeChange: (mode: ViewMode) => void;
  currentMode: ViewMode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onModeChange, currentMode }) => {
  const modes = [
    { id: 'all', icon: Home, label: 'Главная лента' },
    { id: 'shorts', icon: Zap, label: 'Нейро-Шортсы' },
    { id: 'subs', icon: Radio, label: 'Подписки (Узлы)' },
  ] as const;

  if (!isOpen) return (
    <aside className="fixed left-0 top-14 bottom-0 w-20 bg-[#05070a] flex flex-col items-center py-6 z-40 hidden md:flex border-r border-white/5">
      <div className="flex flex-col gap-8">
        {modes.map(m => (
          <div key={m.id} onClick={() => onModeChange(m.id)} className={`flex flex-col items-center gap-1.5 cursor-pointer group transition-all ${currentMode === m.id ? 'text-cyan-400' : 'text-slate-700 hover:text-slate-400'}`}>
            <m.icon className="w-5 h-5 group-hover:scale-110" />
            <span className="text-[7px] font-black uppercase tracking-tighter">{m.label.split(' ')[0]}</span>
          </div>
        ))}
        <div onClick={() => onModeChange('archive')} className={`flex flex-col items-center gap-1.5 cursor-pointer group transition-all ${currentMode === 'archive' ? 'text-cyan-400' : 'text-slate-700 hover:text-slate-400'}`}>
          <FolderHeart className="w-5 h-5 group-hover:scale-110" />
          <span className="text-[7px] font-black uppercase tracking-tighter">Архив</span>
        </div>
      </div>
    </aside>
  );

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-60 bg-[#05070a] overflow-y-auto z-40 p-4 hidden md:block border-r border-white/5 no-scrollbar shadow-2xl">
      <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
        {modes.map(m => (
          <SidebarItem key={m.id} icon={m.icon} label={m.label} active={currentMode === m.id} onClick={() => onModeChange(m.id)} />
        ))}
      </div>
      
      <div className="mt-4 flex flex-col gap-1 border-b border-white/5 pb-4">
        <h3 className="px-4 py-2 text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Библиотека</h3>
        <SidebarItem icon={History} label="Лог событий" active={currentMode === 'history'} onClick={() => onModeChange('history')} />
        <SidebarItem icon={FolderHeart} label="Папка Архива" active={currentMode === 'archive'} onClick={() => onModeChange('archive')} />
        <SidebarItem icon={ThumbsUp} label="Одобрено" active={currentMode === 'liked'} onClick={() => onModeChange('liked')} />
      </div>

      <div className="mt-4 flex flex-col gap-1 border-b border-white/5 pb-4">
        <h3 className="px-4 py-2 text-[9px] font-black text-slate-700 uppercase tracking-widest italic">Навигатор</h3>
        <SidebarItem icon={Flame} label="Тренды" active={currentMode === 'trending'} onClick={() => onModeChange('trending')} />
        <SidebarItem icon={Music2} label="Аудио" onClick={() => onModeChange('trending')} />
        <SidebarItem icon={Gamepad2} label="Игры" onClick={() => onModeChange('trending')} />
      </div>

      <div className="mt-4 flex flex-col gap-1 opacity-40">
        <SidebarItem icon={Settings} label="Система" />
      </div>
    </aside>
  );
};

export default Sidebar;
