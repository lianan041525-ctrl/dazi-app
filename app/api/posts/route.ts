import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// GET /api/posts?city=深圳&category=meal&page=1&size=20
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const size = Math.min(parseInt(searchParams.get('size') || '20', 10), 50);
  const from = (page - 1) * size;
  const to = from + size - 1;

  const sb = supabaseServer();
  let q = sb
    .from('posts')
    .select(
      'post_id,category,title,content,city,district,created_at,profiles(nickname,gender,age,wechat_id,city)',
      { count: 'exact' }
    )
    .eq('status', 1)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (city) q = q.eq('city', city);
  if (category) q = q.eq('category', category);

  const { data, count, error } = await q;
  if (error) return NextResponse.json({ code: 500, msg: error.message });
  return NextResponse.json({
    code: 0,
    msg: 'ok',
    data: { list: data ?? [], total: count ?? 0, page, size },
  });
}
