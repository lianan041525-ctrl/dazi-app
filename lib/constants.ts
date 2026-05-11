export const CATEGORIES = [
  // 生活类
  { key: 'meal', name: '饭搭子', icon: '🍜', cls: 'cat-meal' },
  { key: 'coffee', name: '咖啡搭子', icon: '☕', cls: 'cat-coffee' },
  { key: 'shopping', name: '逛街搭子', icon: '🛍️', cls: 'cat-shopping' },
  { key: 'exhibition', name: '看展搭子', icon: '🎨', cls: 'cat-exhibition' },
  // 娱乐类
  { key: 'movie', name: '电影搭子', icon: '🎬', cls: 'cat-movie' },
  { key: 'ktv', name: 'KTV搭子', icon: '🎤', cls: 'cat-ktv' },
  { key: 'escape', name: '密室搭子', icon: '🔐', cls: 'cat-escape' },
  { key: 'drink', name: '酒吧搭子', icon: '🍻', cls: 'cat-drink' },
  { key: 'game', name: '游戏搭子', icon: '🎮', cls: 'cat-game' },
  // 运动类
  { key: 'badminton', name: '羽毛球搭子', icon: '🏸', cls: 'cat-badminton' },
  { key: 'basketball', name: '篮球搭子', icon: '🏀', cls: 'cat-basketball' },
  { key: 'running', name: '跑步搭子', icon: '🏃', cls: 'cat-running' },
  { key: 'fitness', name: '健身搭子', icon: '💪', cls: 'cat-fitness' },
  { key: 'cycling', name: '骑行搭子', icon: '🚴', cls: 'cat-cycling' },
  // 出行类
  { key: 'travel', name: '旅游搭子', icon: '✈️', cls: 'cat-travel' },
  { key: 'roadtrip', name: '自驾搭子', icon: '🚗', cls: 'cat-roadtrip' },
  { key: 'camping', name: '露营搭子', icon: '⛺', cls: 'cat-camping' },
  // 学习类
  { key: 'study', name: '自习搭子', icon: '📚', cls: 'cat-study' },
  { key: 'language', name: '语言学习', icon: '🗣️', cls: 'cat-language' },
  { key: 'exam', name: '考研搭子', icon: '📝', cls: 'cat-exam' },
  // 其他
  { key: 'pet', name: '宠物搭子', icon: '🐾', cls: 'cat-pet' },
  { key: 'photo', name: '摄影搭子', icon: '📸', cls: 'cat-photo' },
  { key: 'date', name: '相亲搭子', icon: '💝', cls: 'cat-date' },
] as const;

export const CATEGORY_MAP: Record<string, { name: string; icon: string }> =
  Object.fromEntries(CATEGORIES.map((c) => [c.key, { name: c.name, icon: c.icon }]));

export const TIME_OPTIONS = [
  { value: 1, label: '今天' },
  { value: 2, label: '今晚' },
  { value: 3, label: '明天' },
  { value: 4, label: '本周末' },
];

export const HOT_CITIES = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉', '西安', '重庆', '南京', '苏州', '天津', '长沙', '郑州', '青岛', '厦门', '宁波', '合肥', '昆明', '沈阳', '哈尔滨', '济南', '大连', '福州', '南宁', '贵阳', '太原', '乌鲁木齐', '海口', '三亚'];

export function timeAgo(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}
