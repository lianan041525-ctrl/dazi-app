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
    gender?: number | null;
    age?: number | null;
  } | null;
}

export default function PostCard({ post }: { post: PostCardData }) {
  const cat = CATEGORY_MAP[post.category] ?? { name: '其他', icon: '📌' };
  const p = post.profiles;

  return (
    <Link
      href={`/detail/${post.post_id}`}
      className="block bg-white rounded-2xl p-4 shadow-sm active:bg-gray-50"
    >
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full bg-brand-50 flex items-center justify-center
                        text-lg shrink-0 overflow-hidden">
          {p?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <span>{p?.nickname?.[0] ?? '👤'}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium truncate">{p?.nickname ?? '匿名'}</span>
            {p?.age ? <span className="text-gray-400 text-xs">{p.age}岁</span> : null}
            <span className="ml-auto text-xs text-gray-400">{timeAgo(post.created_at)}</span>
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-xs bg-brand-50 text-brand px-2 py-0.5 rounded-full">
              {cat.icon} {cat.name}
            </span>
            <span className="text-xs text-gray-400">
              {post.city}{post.district ? `·${post.district}` : ''}
            </span>
          </div>

          <div className="mt-2 font-medium text-[15px] truncate">{post.title}</div>
          <div className="mt-1 text-sm text-gray-600 line-clamp-2">{post.content}</div>
        </div>
      </div>
    </Link>
  );
}
