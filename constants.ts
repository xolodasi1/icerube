
import { Video } from './types';

export const CATEGORIES: string[] = ['Все', 'Музыка', 'Игры', 'Новости', 'Технологии', 'Обучение', 'Развлечения', 'Шортсы'];

export const MOCK_VIDEOS: Video[] = [
  {
    id: 'dQw4w9WgXcQ',
    title: 'Легендарный нейро-хит 2025',
    thumbnail: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=1000',
    channelId: 'ch-master',
    channelName: 'Neural Music',
    channelAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neural',
    views: 1200500,
    likes: 45000,
    postedAt: Date.now() - 3600000 * 24,
    duration: '3:42',
    description: 'Официальный визуализатор нейронной сети для вашего настроения.',
    category: 'Музыка',
    comments: []
  },
  {
    id: 'shorts-1',
    title: 'Будущее уже здесь #shorts',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000',
    channelId: 'ch-tech',
    channelName: 'Cyber Life',
    channelAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech',
    views: 850000,
    likes: 120000,
    postedAt: Date.now() - 3600000,
    duration: '0:15',
    description: 'Короткий взгляд на новые технологии будущего.',
    category: 'Шортсы',
    comments: []
  },
  {
    id: 'z9vP_n5mH6E',
    title: 'Как работают нейросети: Гайд',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1000',
    channelId: 'ch-edu',
    channelName: 'AI Academy',
    channelAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Academy',
    views: 45000,
    likes: 3200,
    postedAt: Date.now() - 3600000 * 5,
    duration: '12:05',
    description: 'Разбираем архитектуру современных LLM моделей за 10 минут.',
    category: 'Обучение',
    comments: []
  }
];
