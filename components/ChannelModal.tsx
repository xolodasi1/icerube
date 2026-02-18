
import React, { useState } from 'react';
import { X, UserCircle, Zap } from 'lucide-react';
import { Channel } from '../types';

interface ChannelModalProps {
  onClose: () => void;
  onCreate: (channel: Channel) => void;
}

const ChannelModal: React.FC<ChannelModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newChannel: Channel = {
      id: 'ch-' + Math.random().toString(36).substr(2, 9),
      name,
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      subscribers: 0
    };
    onCreate(newChannel);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass w-full max-w-md rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)]">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <UserCircle className="w-6 h-6" /> Create Your Channel
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex flex-col items-center mb-4">
            <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-cyan-500/50 flex items-center justify-center overflow-hidden">
              {name ? (
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`} alt="Preview" />
              ) : (
                <UserCircle className="w-10 h-10 text-slate-500" />
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2 uppercase tracking-widest font-bold">Avatar Preview</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400">Channel Name</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cyber Explorer"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400">Handle</label>
            <input
              required
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@username"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition-all"
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 py-3 rounded-xl font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-white" /> Initialize Channel
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChannelModal;
