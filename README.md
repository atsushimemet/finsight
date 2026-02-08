# Finsight

地域金融機関の融資担当者向け AI 駆動型融資審査支援プラットフォーム（トップページ・最小要件実装）。

## 技術スタック

- **フロント / BFF:** Next.js 15 (App Router) + TypeScript + Tailwind CSS 4
- **バックエンド / DB:** Supabase（PostgreSQL + Auth）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabase の準備

**A) ローカルで Supabase を動かす（推奨・Docker 使用）**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) などで Docker を起動しておく。
- **Supabase CLI** をインストールする（`npm install -g supabase` は非対応のため使わないこと）:
  ```bash
  # macOS (Homebrew)
  brew install supabase/tap/supabase
  ```
- プロジェクトでローカル Supabase を起動:
  ```bash
  supabase start
  ```
  表示された **API URL**（例: `http://127.0.0.1:54321`）と **anon key** を `.env.local` に設定する。マイグレーションは `supabase start` 時に自動適用される。
- **サンプル案件を入れる:** `supabase db reset` を実行するとマイグレーションの再適用と `supabase/seed.sql` の投入が行われ、案件一覧にサンプル 3 件が表示される。

**B) クラウドの Supabase を使う**

1. [Supabase](https://supabase.com) でプロジェクトを作成する。
2. **SQL Editor** で `supabase/migrations/20260207000000_create_loan_applications.sql` の内容を実行する。
3. **Authentication** でメール/パスワードや Google など認証方法を有効化する（任意）。

### 3. 環境変数

`.env.local.example` をコピーして `.env.local` を作成し、Supabase の値を設定する。

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL`: プロジェクト URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public key

### 4. 開発サーバー起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

## トップページ（ダッシュボード）の最小要件

仕様書「4.2.1 ダッシュボード（案件一覧）」に基づく実装です。

- **左サイドバー:** 案件一覧・新規案件作成へのナビゲーション
- **メインエリア:** 融資案件のカード一覧
  - 企業名・業種・融資希望額・ステータス・最終更新日・リスクレベルを表示
- **操作:** カードクリックで案件詳細へ遷移、「新規案件作成」で新規作成フォームを表示
- **MVP:** ログイン不要で案件一覧・新規案件作成が利用可能。サンプル案件は `supabase db reset` で投入される。

## ディレクトリ構成（抜粋）

```
src/
  app/
    (dashboard)/          # ダッシュボードレイアウト（サイドバー共通）
      page.tsx           # トップ（案件一覧）
      new/page.tsx       # 新規案件作成
      applications/[id]/ # 案件詳細（最小）
    api/applications/    # 案件作成 API
  components/dashboard/  # サイドバー・カード・フォーム等
  lib/supabase/         # Supabase クライアント（SSR/ブラウザ）
  types/database.ts     # 案件の型定義
supabase/migrations/    # DB マイグレーション
```

## 本番環境

- Next.js は Vercel 等にデプロイ可能。
- Supabase は本番プロジェクトでマイグレーションを実行し、RLS ポリシーでユーザーごとのアクセス制御を有効にしてください。

## デプロイ手順（Vercel + Supabase）

1. **Supabase プロジェクト作成**
   - Supabase ダッシュボードで本番用 Project を作成し、`NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を控える。
   - SQL Editor でマイグレーションを順番に実行:
     1. `supabase/migrations/20260207000000_create_loan_applications.sql`
     2. `supabase/migrations/20260207100000_mvp_anon_loan_applications.sql`
     3. `supabase/migrations/20260207200000_financial_analysis.sql`
     4. 追加の適用が必要な場合のみ `supabase/migrations/run_financial_analysis_manually.sql`
   - 初期データが必要なら `supabase/seed.sql`（案件＋財務データ）または `supabase/seed_financial_only.sql` を実行。
2. **環境変数設定**
   - Vercel の Project Settings → Environment Variables に `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`（必要なら `SUPABASE_SERVICE_ROLE_KEY`）を Production/Preview/Development へ登録。
   - ローカルで本番値を確認したい場合は `vercel env pull` で `.env.production.local` を取得。
3. **Vercel へデプロイ**
   - Vercel で New Project → GitHub リポジトリを選択し、Framework=Next.js、Build Command=`npm run build` のままインポート。
   - Production Branch を `main` に設定し Deploy。以降は `main` への push で自動デプロイ。
4. **動作確認**
   - デプロイ後、`https://<project>.vercel.app` でアプリを確認し、Supabase Studio でテーブル更新が反映されているかチェック。
   - Vercel Logs / Supabase Logs を監視し、エラーがないかモニタリング。

## 仕様書

詳細はルートの `Finsight 本開発仕様書.md` を参照してください。
