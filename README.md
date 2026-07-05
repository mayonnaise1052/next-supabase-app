# Next.js + Supabase App

[Next.js](https://nextjs.org) `with-supabase` スターターをベースに、認証と `projects` テーブルの **Row Level Security (RLS)** をアプリから確認できるように拡張したプロジェクトです。

## Features

- **Next.js 16** App Router + Proxy (`proxy.ts`) によるセッション管理
- **Supabase Auth**（メール / パスワード、Cookie ベース SSR）
- **`/projects`** — RLS ポリシーの動作確認用 UI（一覧・作成・アーカイブ・削除）
- **`/protected`** — 認証済みユーザーのみアクセス可能なデモページ
- [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com/)

## Routes

| Path | Description |
|------|-------------|
| `/` | ホーム（セットアップ手順） |
| `/auth/login` | ログイン |
| `/auth/sign-up` | サインアップ |
| `/auth/confirm` | メール確認コールバック |
| `/protected` | 認証デモページ |
| `/projects` | **RLS 確認用** — 自分の `projects` 行のみ表示・操作 |

## Prerequisites

- Node.js 20.9+（推奨: 24 LTS）
- [Supabase](https://supabase.com/dashboard) プロジェクト

## Environment variables

`.env.local` を作成し、Supabase ダッシュボードの **Project Settings → API** から値を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
```

- URL は `https://….supabase.co` のみ（`/rest/v1` などのパスは付けない）
- 引用符は不要
- ダッシュボードに **anon public** と表示されていても、この変数名でその値を使えます

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Windows: SSL certificate (required on some PCs)

`npm` / `next dev` が Supabase へ接続できず、ログイン後もセッションが維持されない場合があります。ユーザー環境変数に次を設定してください。

| Name | Value |
|------|-------|
| `NODE_OPTIONS` | `--use-system-ca` |

Git Bash で一時的に使う場合:

```bash
export NODE_OPTIONS=--use-system-ca
npm run dev
```

### 3. Start the dev server

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。`localhost` と `127.0.0.1` は混在させないでください。

## Supabase setup

### Authentication → URL Configuration

| Setting | Local value |
|---------|-------------|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/**` |

### Authentication → Email Templates → Confirm signup

サーバー側でメール確認を処理するため、リンクを次の形式に変更します。

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}
```

### Database: `projects` table + RLS

SQL Editor でテーブルとポリシーを作成します。例:

```sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  name text not null,
  status text not null default 'active',
  constraint projects_status_check check (status in ('active', 'archived'))
);

alter table public.projects enable row level security;

create policy "Users can view own projects"
  on public.projects for select to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete to authenticated
  using (auth.uid() = user_id);
```

任意（INSERT 時に `user_id` を自動設定）:

```sql
alter table public.projects
  alter column user_id set default auth.uid();
```

## Verify RLS from the app

1. `/auth/sign-up` でアカウント作成 → メール確認
2. `/auth/login` でログイン
3. `/projects` を開く
4. 確認内容:
   - **Your user ID** が表示される
   - **自分の `user_id` の行だけ** 一覧に出る
   - **Create project** で INSERT が通る
   - **Archive / Restore / Delete** で UPDATE / DELETE が通る

SQL Editor からの INSERT は RLS をバイパスするため、アプリからの動作確認には `/projects` を使ってください。

## Scripts

```bash
npm run dev    # 開発サーバー
npm run build  # 本番ビルド
npm run start  # 本番サーバー
npm run lint   # ESLint
```

## Project structure (highlights)

```
app/
  auth/           # ログイン・サインアップ・メール確認
  projects/       # RLS 確認用ページ
  protected/      # 認証デモ
components/
  projects/       # 一覧・作成フォーム・アクション
lib/
  supabase/       # Server / Client Supabase クライアント
  types/project.ts
proxy.ts          # セッション更新（Next.js 16 Proxy）
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

デプロイ後は Supabase の **Site URL** と **Redirect URLs** を本番ドメインに更新してください。

## References

- [Supabase Auth + Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js with-supabase example](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)
