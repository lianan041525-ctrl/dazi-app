# 附近搭子 H5 — MVP

同城约搭子 H5，Next.js 14 + Supabase 一栈到底。

## 快速开始（5 分钟跑起来）

### 1. 创建 Supabase 项目
- 打开 https://supabase.com → New Project
- 等待项目初始化完成（约 2 分钟）
- 在 Project Settings → API 拿到：
  - `Project URL` → 填入 `NEXT_PUBLIC_SUPABASE_URL`
  - `anon public` key → 填入 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. 执行数据库初始化
- Supabase Dashboard → SQL Editor → New query
- 粘贴 `supabase/init.sql` 的全部内容，点 Run
- 会自动建表、开启 RLS、创建自动注册 profile 的触发器

### 3. 开启手机号登录
- Authentication → Providers → Phone，开启
- 配置短信服务商（任选其一）：
  - **Twilio**（国际号推荐）
  - **阿里云 SMS / 腾讯云 SMS**（国内号推荐，需在 Supabase 填 API Key）
- 开发阶段可临时在 Auth → Providers → Phone 里勾选 "Enable phone confirmations" 并关闭；或者用邮箱登录临时调试

### 4. 本地启动
```bash
cp .env.local.example .env.local
# 填入第 1 步的 URL 和 anon key

npm install
npm run dev
```
打开 http://localhost:3000，手机模式查看（Chrome DevTools → Toggle Device Toolbar）。

## 目录结构

```
dazi-app/
├── app/
│   ├── layout.tsx              根布局（480px 容器）
│   ├── globals.css             全局样式
│   ├── page.tsx                首页
│   ├── login/page.tsx          登录（手机号 OTP）
│   ├── post/page.tsx           发布需求
│   ├── list/page.tsx           匹配列表
│   ├── detail/[id]/page.tsx    详情页
│   ├── mine/page.tsx           我的
│   └── api/
│       ├── contact/route.ts    联系接口
│       └── posts/route.ts      列表接口（可选）
├── components/
│   ├── TabBar.tsx
│   ├── Toast.tsx
│   ├── CategoryGrid.tsx
│   ├── PostCard.tsx
│   └── CitySheet.tsx
├── lib/
│   ├── supabase-browser.ts
│   ├── supabase-server.ts
│   ├── constants.ts
│   └── store.ts                Zustand 城市持久化
└── supabase/
    └── init.sql                一键建表脚本
```

## 核心功能

| 功能 | 页面 | 实现 |
| --- | --- | --- |
| 登录 | `/login` | Supabase Auth 手机号 OTP |
| 首页 | `/` | 类目宫格 + 附近最新 |
| 发布 | `/post` | 表单 → `posts` 表 |
| 列表 | `/list` | 按城市 + 类目筛选，时间倒序 |
| 详情 | `/detail/[id]` | 展示需求 + 立即联系 → 揭示微信 |
| 我的 | `/mine` | 个人信息 + 我的发布管理 |
| 联系 | `/api/contact` | 写 contact_logs + 返回对方微信 |
| 举报 | 详情页弹窗 | 写 reports 表，后台处理 |

## 设计要点

- **没有独立 IM 系统**：点「立即联系」后直接揭示对方微信号，让用户去微信继续沟通。这是 MVP 阶段验证需求最快的路径。
- **发布时强制填微信**：保证需求真实，也避免用户点了「联系」却联系不上。
- **RLS 保护**：`contact_logs` 只有参与双方能读；`posts` 下架的只有本人能看。对方微信通过服务端 API 返回，前端查不到。
- **自动建 profile**：`auth.users` 插入时自动插入 `profiles`，避免前端多一次请求。

## 开发优先级（7 天版）

- **D1-2** ✅ 脚手架 + 数据库 + 登录 + 首页
- **D3** ✅ 发布 + 列表
- **D4** ✅ 详情 + 联系
- **D5** ✅ 我的 + 举报
- **D6** 接入埋点 + 最简后台（用 Supabase Dashboard 直接管理即可）
- **D7** 真机测试 + 微信内打开适配 + 灰度 100 人

## 部署

### 前端：Vercel 一键部署
```bash
# 推到 GitHub 后在 Vercel 导入
# 环境变量填入：
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 域名 + 微信内打开
- 备案域名必须
- 在微信开放平台配置 JS 安全域名（如果后续接微信登录）

## 下一步迭代

- P1：图片上传（Supabase Storage）、收藏、微信登录
- P2：站内 IM（Supabase Realtime）、会员解锁联系方式、距离排序
- P3：推荐算法、实名认证、城市 SEO 页

## 注意

- 短信通道需要实名备案，国内号码建议阿里云/腾讯云，约 0.045 元/条
- Supabase 免费版每月 50K 月活够用，单表 500MB 够跑到万级需求
- 线上务必开启 Supabase 的 rate limiting，防止接口被刷
