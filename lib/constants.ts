export const CATEGORIES = [
  { key: 'meal',   name: '饭搭子',   icon: '🍲' },
  { key: 'sport',  name: '运动搭子', icon: '🏸' },
  { key: 'movie',  name: '电影搭子', icon: '🎬' },
  { key: 'game',   name: '游戏搭子', icon: '🎮' },
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
  if (diff < 60)   return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}
