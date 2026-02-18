
import React from 'react';
import { Home, Compass, PlaySquare, Clock, ThumbsUp, ChevronRight, UserCircle, History, Flame, Music2, Gamepad2, Trophy, Settings, HelpCircle, MessageSquare, Library, Radio, Zap } from 'lucide-react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  accent?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, active, onClick, accent }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-4 py-3 rounded-xl transition-all duration-500 group relative overflow-hidden ${
      active 
      ? 'bg-cyan-500/10 text-cyan-400 font-black italic shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]' 
      : 'hover:bg-white/5 text-slate-500 hover:text-white'
    }`}
  >
    {active && <div className="absolute left-0 top-0 w-1 h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,1)]"></div>}
    <Icon className={`w-5 h-5 transition-transform duration-500 ${active ? 'text-cyan-400' : 'group-hover:scale-110'}`} />
    <span className="text-xs font-bold uppercase tracking-widest truncate">{label}</span>
  </button>
);

interface SidebarProps {
  isOpen: boolean;
  onModeChange?: (mode: 'all' | 'user' | 'subs' | 'shorts') => void;
  currentMode?: 'all' | 'user' | 'subs' | 'shorts';
  hasSubscribed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onModeChange, currentMode, hasSubscribed }) => {
  if (!isOpen) return (
    <aside className="fixed left-0 top-14 bottom-0 w-20 bg-[#05070a] flex flex-col items-center py-6 z-40 hidden md:flex border-r border-white/5 shadow-2xl">
      <div className="flex flex-col gap-10">
        <div onClick={() => onModeChange?.('all')} className={`flex flex-col items-center gap-2 cursor-pointer group transition-all ${currentMode === 'all' ? 'text-cyan-400' : 'text-slate-700 hover:text-slate-400'}`}>
          <Home className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Эфир</span>
        </div>
        <div onClick={() => onModeChange?.('shorts')} className={`flex flex-col items-center gap-2 cursor-pointer group transition-all ${currentMode === 'shorts' ? 'text-cyan-400' : 'text-slate-700 hover:text-slate-400'}`}>
          <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Шортс</span>
        </div>
        <div onClick={() => onModeChange?.('subs')} className={`flex flex-col items-center gap-2 cursor-pointer group transition-all ${currentMode === 'subs' ? 'text-cyan-400' : 'text-slate-700 hover:text-slate-400'}`}>
          <Radio className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="text-[8px] font-black uppercase tracking-tighter">Узлы</span>
        </div>
      </div>
    </aside>
  );

  return (
    <aside className="fixed left-0 top-14 bottom-0 w-60 bg-[#05070a] overflow-y-auto z-40 p-4 hidden md:block border-r border-white/5 no-scrollbar shadow-2xl">
      <div className="flex flex-col gap-1.5 border-b border-white/5 pb-6">
        <SidebarItem 
          icon={Home} 
          label="Главная лента" 
          active={currentMode === 'all'} 
          onClick={() => onModeChange?.('all')}
        />
        <SidebarItem 
          icon={Zap} 
          label="Нейро-Шортсы" 
          active={currentMode === 'shorts'}
          onClick={() => onModeChange?.('shorts')}
        />
        <SidebarItem 
          icon={Radio} 
          label="Подписки (Узлы)" 
          active={currentMode === 'subs'}
          onClick={() => onModeChange?.('subs')}
        />
      </div>
      
      <div className="mt-6 flex flex-col gap-1.5 border-b border-white/5 pb-6">
        <h3 className="px-4 py-2 text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] flex items-center justify-between italic">
          База данных <ChevronRight className="w-3 h-3" />
        </h3>
        <SidebarItem icon={UserCircle} label="Мой профиль" />
        <SidebarItem icon={History} label="Лог событий" />
        <SidebarItem 
          icon={PlaySquare} 
          label="Ваши сигналы" 
          active={currentMode === 'user'} 
          onClick={() => onModeChange?.('user')}
        />
        <SidebarItem icon={Clock} label="Отложенные" />
        <SidebarItem icon={ThumbsUp} label="Одобрено" />
      </div>

      <div className="mt-6 flex flex-col gap-1.5 border-b border-white/5 pb-6">
        <h3 className="px-4 py-2 text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] italic">Исследование сети</h3>
        <SidebarItem icon={Flame} label="Тренды" />
        <SidebarItem icon={Music2} label="Аудиоволны" />
        <SidebarItem icon={Gamepad2} label="Симуляции" />
        <SidebarItem icon={Trophy} label="Достижения" />
      </div>

      <div className="mt-6 flex flex-col gap-1.5 pb-20 opacity-40 hover:opacity-100 transition-opacity duration-500">
        <SidebarItem icon={Settings} label="Конфигурация" />
        <SidebarItem icon={HelpCircle} label="Техподдержка" />
      </div>
    </aside>
  );
};

export default Sidebar;
