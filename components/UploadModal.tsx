
import React, { useState, useRef } from 'react';
import { X, Upload, Film, FileText, CheckCircle2, Zap, Image as ImageIcon } from 'lucide-react';
import { Video } from '../types';
import { CATEGORIES } from '../constants';

interface UploadModalProps {
  onClose: () => void;
  onUpload: (video: Video) => void;
  channel: any;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onUpload, channel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Развлечения');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateThumbnail = (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(videoFile);
      video.muted = true;
      video.playsInline = true;

      video.onloadedmetadata = () => {
        video.currentTime = 1;
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        resolve(dataUrl);
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsGeneratingThumbnail(true);
      const thumb = await generateThumbnail(selectedFile);
      setThumbnail(thumb);
      setIsGeneratingThumbnail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !thumbnail) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', file);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      const { videoUrl } = await uploadRes.json();

      const newVideo: Video = {
        id: 'vid-' + Math.random().toString(36).substr(2, 9),
        title,
        description,
        category,
        thumbnail: thumbnail,
        channelId: channel?.id || 'guest',
        channelName: channel?.name || 'Гость',
        channelAvatar: channel?.avatar || 'https://picsum.photos/seed/guest/100/100',
        views: 0,
        likes: 0,
        postedAt: Date.now(),
        duration: '3:00',
        videoUrl,
        isUserUploaded: true,
        comments: []
      };

      onUpload(newVideo);
      onClose();
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(`Ошибка при загрузке видео: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="glass w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(6,182,212,0.1)] border border-cyan-500/20">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/20">
          <h2 className="text-2xl font-black italic tracking-tighter text-cyan-400 flex items-center gap-3 uppercase">
            <Upload className="w-6 h-6" /> Загрузка_Сигнала
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!file ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center gap-6 hover:border-cyan-500/50 hover:bg-cyan-500/5 cursor-pointer transition-all group"
            >
              <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500 border border-white/5">
                <Film className="w-10 h-10 text-cyan-500" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-black uppercase tracking-widest text-slate-300">Выберите нейро-пакет</p>
                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">MP4, WEBM, MKV // МАКС 500MB</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="video/*"
              />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-4 p-4 bg-cyan-500/5 rounded-2xl border border-cyan-500/20">
                <div className="w-24 h-14 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-white/10">
                  {isGeneratingThumbnail ? (
                    <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : thumbnail ? (
                    <img src={thumbnail} className="w-full h-full object-cover" alt="Thumb" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-sm font-black uppercase tracking-wider truncate text-cyan-100">{file.name}</p>
                   <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                     {isGeneratingThumbnail ? 'Извлечение превью...' : 'Сигнал готов'}
                   </p>
                </div>
                <button type="button" onClick={() => {setFile(null); setThumbnail(null);}} className="text-xs font-black text-slate-500 hover:text-white uppercase tracking-tighter transition-colors px-3">Сброс</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Название трансляции
                  </label>
                  <input
                    required
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="ВВЕДИТЕ ЗАГОЛОВОК..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition-all font-bold text-sm uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Категория сигнала</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition-all appearance-none font-bold text-sm uppercase"
                  >
                    {CATEGORIES.filter(c => c !== 'Все').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Краткое содержание</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ОПИШИТЕ ДАННЫЙ СИГНАЛ..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:border-cyan-500 outline-none transition-all resize-none font-medium text-sm"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <button 
              type="button" 
              onClick={onClose}
              className="px-8 py-3 rounded-xl hover:bg-white/5 font-black uppercase tracking-widest text-xs text-slate-500 hover:text-white transition-all"
            >
              Отмена
            </button>
            <button 
              disabled={!file || !title || !thumbnail || isUploading}
              type="submit"
              className={`px-10 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3 ${
                isUploading 
                ? 'bg-slate-800 cursor-not-allowed text-slate-600' 
                : 'bg-cyan-500 text-white shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95'
              }`}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Загрузка...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" /> Запустить эфир
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
