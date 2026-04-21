-- ========================================
-- 同城搭子 — Supabase 初始化脚本
-- 在 Supabase SQL Editor 里一把执行
-- ========================================

-- 1. 用户资料表（auth.users 的扩展）
create table if not exists public.profiles (
  user_id       uuid primary key references auth.users on delete cascade,
  nickname      varchar(32) not null,
  avatar        text,
  gender        smallint default 0,   -- 0未知 1男 2女
  age           smallint,
  city          varchar(32),
  wechat_id     varchar(64),          -- 联系方式
  bio           varchar(200),
  created_at    timestamptz default now()
);

-- 2. 需求发布表
create table if not exists public.posts (
  post_id         bigserial primary key,
  user_id         uuid not null references auth.users on delete cascade,
  category        varchar(16) not null,   -- meal/sport/movie/game
  title           varchar(40) not null,
  content         varchar(200) not null,
  city            varchar(32) not null,
  district        varchar(64),
  meet_time_type  smallint,               -- 1今天 2今晚 3明天 4本周末 5自定义
  meet_time       timestamptz,
  gender_pref     smallint default 0,
  age_pref        varchar(16) default 'all',
  images          jsonb default '[]'::jsonb,
  status          smallint default 1,     -- 1上架 2已结束 3下架
  view_count      int default 0,
  contact_count   int default 0,
  created_at      timestamptz default now()
);
create index if not exists idx_posts_city_cat on public.posts(city, category, status);
create index if not exists idx_posts_created  on public.posts(created_at desc);

-- 3. 联系记录
create table if not exists public.contact_logs (
  id            bigserial primary key,
  from_user_id  uuid not null references auth.users on delete cascade,
  to_user_id    uuid not null references auth.users on delete cascade,
  post_id       bigint not null references public.posts on delete cascade,
  greeting      varchar(100),
  created_at    timestamptz default now(),
  unique (from_user_id, post_id)
);

-- 4. 举报表
create table if not exists public.reports (
  report_id       bigserial primary key,
  reporter_id     uuid not null references auth.users,
  target_post_id  bigint references public.posts,
  reason          varchar(32),
  status          smallint default 0,
  created_at      timestamptz default now()
);

-- ========================================
-- RLS 策略
-- ========================================
alter table public.profiles     enable row level security;
alter table public.posts        enable row level security;
alter table public.contact_logs enable row level security;
alter table public.reports      enable row level security;

-- profiles：所有人可读，本人可写
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select using (true);
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert with check (auth.uid() = user_id);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update using (auth.uid() = user_id);

-- posts：上架内容所有人可读；本人可增删改
drop policy if exists posts_read on public.posts;
create policy posts_read on public.posts for select using (status = 1 or auth.uid() = user_id);
drop policy if exists posts_insert on public.posts;
create policy posts_insert on public.posts for insert with check (auth.uid() = user_id);
drop policy if exists posts_update on public.posts;
create policy posts_update on public.posts for update using (auth.uid() = user_id);
drop policy if exists posts_delete on public.posts;
create policy posts_delete on public.posts for delete using (auth.uid() = user_id);

-- contact_logs：只有参与者可读，本人可写
drop policy if exists contact_read on public.contact_logs;
create policy contact_read on public.contact_logs for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);
drop policy if exists contact_insert on public.contact_logs;
create policy contact_insert on public.contact_logs for insert with check (auth.uid() = from_user_id);

-- reports：任何登录用户可提交
drop policy if exists reports_insert on public.reports;
create policy reports_insert on public.reports for insert with check (auth.uid() = reporter_id);

-- ========================================
-- 注册时自动建 profile
-- ========================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, nickname, city)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', '搭子' || substr(new.id::text, 1, 4)),
    coalesce(new.raw_user_meta_data->>'city', '深圳')
  )
  on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ========================================
-- 辅助 RPC：联系次数 +1
-- ========================================
create or replace function public.increment_contact_count(pid bigint)
returns void language sql security definer set search_path = public as $$
  update public.posts set contact_count = contact_count + 1 where post_id = pid;
$$;

-- ========================================
-- 演示数据（可选，上线时删）
-- ========================================
-- insert into public.posts (user_id, category, title, content, city, district, meet_time_type)
-- values ('YOUR-UUID', 'meal', '今晚想找人吃火锅', '海底捞，八点，南山', '深圳', '南山区', 2);
