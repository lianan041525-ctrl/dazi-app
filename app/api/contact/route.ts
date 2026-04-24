import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(req: Request) {
  try {
    const sb = supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ code: 401, msg: '请先登录' });

    const { post_id } = await req.json();
    if (!post_id) return NextResponse.json({ code: 400, msg: '参数错误' });

    // 拉取发帖人信息 + 联系方式
    const { data: post, error: postErr } = await sb
      .from('posts')
      .select('user_id,status,profiles(nickname,gender,age,wechat_id,city)')
      .eq('post_id', post_id)
      .single();

    if (postErr || !post)
      return NextResponse.json({ code: 404, msg: '需求不存在' });
    if (post.status !== 1)
      return NextResponse.json({ code: 400, msg: '该需求已下架' });
    if (post.user_id === user.id)
      return NextResponse.json({ code: 400, msg: '不能联系自己' });

    const wechat = (post as any).profiles?.wechat_id;
    if (!wechat)
      return NextResponse.json({ code: 404, msg: '对方未设置联系方式' });

    // 写联系记录（upsert 防重复）
    await sb.from('contact_logs').upsert(
      {
        from_user_id: user.id,
        to_user_id: post.user_id,
        post_id,
        greeting: '你好，我对你的需求感兴趣',
      },
      { onConflict: 'from_user_id,post_id', ignoreDuplicates: true }
    );

    // 联系次数 +1（尽力而为，失败不影响主流程）
    try { await sb.rpc('increment_contact_count', { pid: post_id }); } catch {}

    return NextResponse.json({
      code: 0,
      msg: 'ok',
      data: { wechat_id: wechat },
    });
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message || '服务器错误' });
  }
}
