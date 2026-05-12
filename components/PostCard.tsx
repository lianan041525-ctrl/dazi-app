'use client';
import Link from 'next/link';
import { CATEGORY_MAP, timeAgo } from '@/lib/constants';

export interface PostCardData {
  post_id: number;
  category: string;
  title: string;
  content: string;
  city: string;
  district?: string | null;
  created_at: string;
  profiles?: {
    nickname: string;
    avatar?: string | null;
    avatar_url?: string | null;
    gender?: number | null;
    age?: number | null;
  } | null;
}

export default function PostCard({ post }: { post: PostCardData }) {
  const cat = CATEGORY_MAP[post.category] ?? { name: '其他', icon: '📌' };
  const p = post.profiles;
  const gender = p?.gender;
  const genderIcon = gender === 2 ? '♀' : gender === 1 ? '♂' : '';
  const genderCls = gender === 2 ? 'bg-brand/20 text-pink-200' : 'bg-accent-purple/20 text-purple-200';

  return (
    <Link href={`/detail/${post.post_id}`} className="glass-card glass-card-hover p-4 block animate-fade-in">
      <div className="flex items-center gap-3 mb-2.5">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium shrink-0 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #FF5E78 0%, #6C5CE7 100%)', color: '#fff' }}>
          {(p?.avatar_url || p?.avatar) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar_url || p.avatar || ''} alt="" className="w-full h-full object-cover" />
          ) : (
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.user_id}&backgroundColor=b6e3f4,ffdfbf,ffd5dc,c0aede`} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-white truncate">{p?.nickname ?? '匿名'}</span>
            {genderIcon && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${genderCls}`}>
                {genderIcon} {p?.age ?? ''}
              </span>
            )}
          </div>
          <div className="text-[11px] text-white/40 mt-0.5">
            {post.city}{post.district ? ` · ${post.district}` : ''} · {timeAgo(post.created_at)}
          </div>
        </div>
        <button className="btn-gradient text-[11px] px-3 py-1.5 rounded-full font-medium shrink-0"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = `/detail/${post.post_id}`; }}>
          打招呼
        </button>
      </div>

      <div className="text-[15px] font-medium text-white mb-1">{post.title}</div>
      <p className="text-sm text-white/65 leading-relaxed line-clamp-2">{post.content}</p>

      <div className="flex gap-1.5 mt-2.5">
        <span className="text-[10px] bg-brand/20 text-pink-200 px-2 py-0.5 rounded-md">
          {cat.icon} {cat.name}
        </span>
      </div>
    </Link>
  );
}
