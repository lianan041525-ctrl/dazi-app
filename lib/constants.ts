export const CATEGORIES = [
  { key: 'meal', name: '饭搭子', icon: '🍲', cls: 'cat-meal' },
  { key: 'drink', name: '酒搭子', icon: '🍻', cls: 'cat-drink' },
  { key: 'photo', name: '约拍搭子', icon: '📸', cls: 'cat-photo' },
  { key: 'travel', name: '出游搭子', icon: '✈️', cls: 'cat-travel' },
  { key: 'mahjong', name: '麻将搭子', icon: '🀄', cls: 'cat-mahjong' },
  { key: 'badminton', name: '羽毛球搭子', icon: '🏸', cls: 'cat-badminton' },
  { key: 'billiards', name: '桌球搭子', icon: '🎱', cls: 'cat-billiards' },
  { key: 'tennis', name: '网球搭子', icon: '🎾', cls: 'cat-tennis' },
  { key: 'basketball', name: '篮球搭子', icon: '🏀', cls: 'cat-basketball' },
  { key: 'pingpong', name: '乒乓球搭子', icon: '🏓', cls: 'cat-pingpong' },
  { key: 'study', name: '学习搭子', icon: '📚', cls: 'cat-study' },
  { key: 'movie', name: '电影搭子', icon: '🎬', cls: 'cat-movie' },
  { key: 'game', name: '游戏搭子', icon: '🎮', cls: 'cat-game' },
] as const;

export const CATEGORY_MAP: Record<string, { name: string; icon: string }> =
  Object.fromEntries(CATEGORIES.map((c) => [c.key, { name: c.name, icon: c.icon }]));

export const TIME_OPTIONS = [
  { value: 1, label: '今天' },
  { value: 2, label: '今晚' },
  { value: 3, label: '明天' },
  { value: 4, label: '本周末' },
];

export const HOT_CITIES = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '西安'];

export function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}
