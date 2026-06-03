import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

const FREE_DAILY_LIMIT = 0; // 免费用户每天限制次数

export async function POST(req: Request) {
  try {
    const sb = supabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return NextResponse.json({ code: 401, msg: '请先登录' });

    const { post_id } = await req.json();
    if (!post_id) return NextResponse.json({ code: 400, msg: '参数错误' });

    // 拉取帖子信息
    const { data: post, error: postErr } = await sb
      .from('posts')
      .select('user_id,status')
      .eq('post_id', post_id)
      .single();

    if (postErr || !post)
      return NextResponse.json({ code: 404, msg: '需求不存在' });
    if (post.status !== 1)
      return NextResponse.json({ code: 400, msg: '该需求已下架' });
    if (post.user_id === user.id)
      return NextResponse.json({ code: 400, msg: '不能联系自己' });

    // 单独查发帖人 profile
    const { data: posterProfile } = await sb
      .from('profiles')
      .select('wechat_id')
      .eq('user_id', post.user_id)
      .maybeSingle();

    const wechat = posterProfile?.wechat_id;
    if (!wechat)
      return NextResponse.json({ code: 404, msg: '对方未设置联系方式' });

    // ── 会员检查 ──────────────────────────────
    const { data: myProfile } = await sb
      .from('profiles')
      .select('vip_expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    const isVip = myProfile?.vip_expires_at &&
      new Date(myProfile.vip_expires_at) > new Date();

    if (!isVip) {
      const { data: myProfile2 } = await sb
        .from('profiles')
        .select('daily_contact_count, last_contact_date')
        .eq('user_id', user.id)
        .maybeSingle();

      const today = new Date().toISOString().slice(0, 10);
      const lastDate = myProfile2?.last_contact_date;
      const todayCount = lastDate === today ? (myProfile2?.daily_contact_count ?? 0) : 0;

      if (todayCount >= FREE_DAILY_LIMIT) {
        return NextResponse.json({
          code: 403,
          msg: `每天仅有1次免费打招呼机会，开通会员享无限联系`,
          data: { need_vip: true },
        });
      }

      // 检查是否已经联系过这条帖子
      const { data: existing } = await sb
        .from('contact_logs')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('post_id', post_id)
        .maybeSingle();

      if (!existing) {
        await sb.from('profiles').update({
          daily_contact_count: todayCount + 1,
          last_contact_date: today,
        }).eq('user_id', user.id);
      }
    }
    // ── 会员检查结束 ──────────────────────────────────

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

    // 写通知记录
    try {
      await sb.from('notifications').insert({
        user_id: post.user_id,
        type: 'contact',
        content: '有人对你的帖子感兴趣，向你打了招呼',
        is_read: false,
      });
    } catch {}

    return NextResponse.json({
      code: 0,
      msg: 'ok',
      data: { wechat_id: wechat },
    });
  } catch (e: any) {
    return NextResponse.json({ code: 500, msg: e.message || '服务器错误' });
  }
}
