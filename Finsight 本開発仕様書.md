# Finsight 本開発仕様書

**バージョン:** 1.0  
**作成日:** 2026年2月7日  
**対象:** Codex本開発チーム  
**作成者:** Manus AI

---

## エグゼクティブサマリー

Finsightは、地域金融機関の融資担当者が中小企業融資審査を行う際の認知負荷を劇的に軽減し、迅速かつ質の高い意思決定を支援するAI駆動型の融資審査支援プラットフォームです。本ドキュメントは、プロトタイプ開発で検証されたコンセプトを基に、本開発で実装すべき機能要件、技術仕様、データモデル、UI/UX設計を包括的にまとめたものです。

**プロダクトの核心価値:** 融資担当者が「判断するための情報」を瞬時に、必要最小限の量で提供することで、担当者の専門性と判断力を最大化します。

---

## 1. プロダクト概要

### 1.1 プロダクト名とコンセプト

**Finsight (フィンサイト)**

> *Finance (金融) × Insight (洞察)*  
> 複雑な融資審査に、的確な洞察を提供する。

### 1.2 背景と解決すべき課題

中小企業融資審査における現状の課題は、以下の3点に集約されます。

**課題1: 情報の洪水**  
融資担当者は、決算書、試算表、事業計画書、資金繰り表など多様な形式の書類を読み解く必要があります。申請企業の業種や事業フェーズも多岐にわたり、画一的な評価が困難です。

**課題2: 分析の負荷**  
財務指標の計算、業界ベンチマークとの比較、キャッシュフロー予測など、定量分析に膨大な時間を費やしています。この時間は、本来担当者が注力すべき「事業の将来性や経営者の資質といった定性的評価」から奪われています。

**課題3: 判断の遅れと質のばらつき**  
情報収集と分析に時間がかかることで審査が遅延し、担当者の経験値によって評価の質にばらつきが生じています。

**Finsightの解決アプローチ:**  
AIによる決算書の自動解析、財務指標の即時計算、キャッシュフローシミュレーション、稟議書ドラフトの自動生成により、担当者が「考える」時間と「顧客と対話する」時間を創出します。

### 1.3 ターゲットユーザー

**プライマリーユーザー:** 地域金融機関（地方銀行、信用金庫、信用組合）の中小企業向け融資担当者

**ユーザー特性:**
- 日々5〜10件の融資申請を処理
- 財務諸表の読解能力を持つが、データ入力や書類作成に時間を取られている
- 経験豊富な担当者と若手担当者で評価の質にばらつきがある
- 既存の基幹システム（勘定系システム、CRM）を使用している

### 1.4 プロダクトゴール

**短期目標（6ヶ月以内）:**
- 融資審査1件あたりの平均処理時間を**50%削減**
- 融資担当者のデイリーアクティブユーザー率（DAU）**80%以上**

**中期目標（1年以内）:**
- 担当者間の評価のばらつきを抑制し、審査品質を標準化
- プロダクトNPS（ネット・プロモーター・スコア）**50以上**

**長期目標（2年以内）:**
- 融資実行後1年以内の延滞発生率を**20%削減**
- 融資担当者が顧客との対話や伴走支援に費やす時間を**30%増加**

---

## 2. 機能要件

### 2.1 コア機能一覧

本開発では、以下の3つのコア機能を実装します。

| 機能名 | 優先度 | 概要 |
|--------|--------|------|
| インスタント企業診断ダッシュボード | P0（必須） | 決算書アップロードから5分以内に財務状況とリスク要因を可視化 |
| キャッシュフローシミュレーション | P0（必須） | 融資実行後の返済能力を直感的に評価 |
| 稟議書ドラフト自動生成 | P0（必須） | 分析結果を基にした稟議書の自動生成 |

### 2.2 機能詳細

#### 2.2.1 インスタント企業診断ダッシュボード

**ユーザーストーリー:**
> 融資担当者として、融資申請書（PDFやスキャン画像）をシステムにアップロードするだけで、企業の基本的な財務状況とリスク要因が一目でわかるダッシュボードを確認したい。これにより、最初の5分で審査の方向性を見定め、深掘りすべきポイントを特定できる。

**機能要素:**

**1. 決算書自動解析（AI-OCR）**
- **入力:** PDF、JPEG、PNG形式の決算書（貸借対照表、損益計算書）
- **処理:** AI-OCRエンジンによる文字認識と財務データの構造化抽出
- **出力:** JSON形式の財務データ（売上高、営業利益、純利益、総資産、総負債、純資産、流動資産、流動負債など）
- **精度要件:** 主要財務項目の抽出精度95%以上
- **処理時間:** 1ページあたり5秒以内

**2. 財務指標自動計算とベンチマーク比較**

計算する財務指標:

| カテゴリ | 指標名 | 計算式 |
|----------|--------|--------|
| 収益性 | ROE（自己資本利益率） | 純利益 ÷ 自己資本 × 100 |
| 収益性 | ROA（総資産利益率） | 純利益 ÷ 総資産 × 100 |
| 収益性 | 営業利益率 | 営業利益 ÷ 売上高 × 100 |
| 安全性 | 流動比率 | 流動資産 ÷ 流動負債 × 100 |
| 安全性 | 自己資本比率 | 自己資本 ÷ 総資産 × 100 |
| 安全性 | 負債比率 | 総負債 ÷ 自己資本 × 100 |
| 効率性 | 総資産回転率 | 売上高 ÷ 総資産 |
| 効率性 | 棚卸資産回転率 | 売上原価 ÷ 棚卸資産 |

**ベンチマークデータソース:**
- 業種別財務データ（中小企業庁「中小企業実態基本調査」、TDB企業情報データベース等）
- 企業規模別（従業員数、売上高）でセグメント化
- 最新年度のデータを使用

**表示方法:**
- 各指標を業界平均と並べて棒グラフで表示
- 業界平均を上回る場合は緑、下回る場合は赤でハイライト
- 偏差値形式（50を平均とした相対評価）でも表示

**3. キャッシュフローハイライト**
- 過去3期分の営業キャッシュフロー、投資キャッシュフロー、財務キャッシュフローを折れ線グラフで表示
- 直近の資金繰り状況（増加・減少トレンド）をアラート形式で表示
- 季節変動パターンの検出（月次データがある場合）

**4. リスクアラート**
- 以下の条件に該当する場合、アラートを表示:
  - 自己資本比率が10%未満
  - 流動比率が100%未満
  - 3期連続で営業利益が赤字
  - 債務超過（総負債 > 総資産）
  - 売上高が前年比20%以上減少

**UI設計:**
- ダッシュボードは1画面に収まるよう設計
- 重要度の高い情報を上部に配置（リスクアラート → 財務指標 → キャッシュフロー）
- グラフは直感的に理解できるよう、色分けとラベルを明確化

---

#### 2.2.2 キャッシュフローシミュレーション

**ユーザーストーリー:**
> 融資担当者として、融資希望額と返済期間を入力するだけで、企業の将来のキャッシュフローがどう変化するかをシミュレーションしたい。これにより、無理のない返済計画かどうかを客観的に判断できる。

**機能要素:**

**1. ベースケースシミュレーション**
- **入力パラメータ:**
  - 融資額（万円単位）
  - 返済期間（月数）
  - 金利（年率%）
  - 据置期間（月数、オプション）
- **計算ロジック:**
  - 元利均等返済方式での月次返済額を計算
  - 過去の営業キャッシュフローの平均値を基に、将来のキャッシュフローを予測
  - 月次返済額を差し引いた純キャッシュフローを計算
- **出力:**
  - 月次キャッシュフロー予測グラフ（返済期間全体）
  - 月次返済額、総返済額、総利息額の表示
  - キャッシュフローが負になる月をハイライト

**2. リスクシナリオシミュレーション**

プリセットシナリオ:
- **売上減少シナリオ:** 売上が10%、20%、30%減少した場合
- **経費増加シナリオ:** 人件費や原材料費が10%、20%増加した場合
- **金利上昇シナリオ:** 金利が0.5%、1.0%上昇した場合

**カスタムシナリオ:**
- ユーザーが任意のパラメータ（売上変動率、経費変動率、金利）を入力してシミュレーション可能

**出力:**
- ベースケースとリスクシナリオを重ねた折れ線グラフ
- 各シナリオでのキャッシュフロー最低値と、負になる期間をハイライト

**3. 返済計画の妥当性評価**
- キャッシュフローが一度も負にならない場合: 「返済計画は妥当です」と表示
- キャッシュフローが負になる月がある場合: 「返済計画にリスクがあります。融資額または返済期間の見直しを検討してください」と警告表示

**UI設計:**
- シミュレーション入力フォームはシンプルに（融資額、返済期間、金利の3項目のみ）
- リスクシナリオはボタン一つで切り替え可能
- グラフは拡大・縮小可能で、特定の月をホバーすると詳細データを表示

---

#### 2.2.3 稟議書ドラフト自動生成

**ユーザーストーリー:**
> 融資担当者として、これまでの分析結果が反映された稟議書のドラフトをワンクリックで生成したい。これにより、書類作成に費やす時間を短縮し、最終的な判断の精査に集中できる。

**機能要素:**

**1. 稟議書テンプレート**

標準的な稟議書フォーマット:
```
【融資稟議書】

1. 申請企業概要
   - 企業名: [自動入力]
   - 業種: [自動入力]
   - 設立年: [自動入力]
   - 代表者: [自動入力]
   - 従業員数: [自動入力]

2. 融資概要
   - 融資希望額: [自動入力]
   - 融資期間: [自動入力]
   - 資金使途: [ユーザー入力]
   - 返済方法: [自動入力]

3. 財務状況分析
   - 直近期の売上高: [自動入力]
   - 直近期の営業利益: [自動入力]
   - 直近期の純利益: [自動入力]
   - 自己資本比率: [自動入力]（業界平均: [自動入力]）
   - ROE: [自動入力]（業界平均: [自動入力]）
   - 流動比率: [自動入力]（業界平均: [自動入力]）
   
   【財務上の強み】
   [AIが自動生成: 業界平均を上回る指標を列挙]
   
   【懸念されるリスク要因】
   [AIが自動生成: 業界平均を下回る指標、アラート項目を列挙]

4. 返済能力評価
   - 月次返済額: [自動入力]
   - 営業キャッシュフロー（直近期平均）: [自動入力]
   - 返済余力: [自動計算: 営業CF - 月次返済額]
   
   【シミュレーション結果】
   [AIが自動生成: ベースケースとリスクシナリオの結果を要約]

5. 総合評価
   【推奨可否】
   [AIが自動生成: 財務状況とシミュレーション結果を基に、融資推奨度を3段階で評価]
   - 推奨: 財務状況良好、返済計画に問題なし
   - 条件付き推奨: 一部リスクあり、保全強化や返済期間調整を推奨
   - 慎重審査: 重大なリスク要因あり、追加ヒアリングや保全強化が必要
   
   【担当者所見】
   [ユーザーが自由記述で追記]

6. 保全状況
   [ユーザーが入力]
```

**2. AI生成ロジック**
- LLM（Large Language Model）を使用して、財務指標とシミュレーション結果を基に自然言語で稟議書を生成
- プロンプト設計:
  - 入力: 財務指標（JSON形式）、ベンチマーク比較結果、シミュレーション結果、リスクアラート
  - 出力: 「財務上の強み」「懸念されるリスク要因」「シミュレーション結果要約」「推奨可否」の各セクション
- トーン: 客観的、簡潔、具体的な数値を含む

**3. 編集機能**
- 生成された稟議書はMarkdown形式で編集可能
- 担当者が定性的な評価や特記事項を追記
- バージョン管理機能（編集履歴を保存）

**4. エクスポート機能**
- PDF形式でダウンロード
- Word形式でダウンロード（既存の稟議書フォーマットに合わせて調整可能）

**UI設計:**
- 「稟議書生成」ボタンをダッシュボード上部に配置
- 生成された稟議書はプレビュー画面で確認
- 編集モードと閲覧モードを切り替え可能

---

### 2.3 対象外機能（Non-Goals）

以下の機能は本開発のスコープ外とします。

- **融資判断の完全自動化:** 最終的な融資可否の判断は必ず人間（融資担当者、審査部門）が行う
- **個人向けローン、住宅ローン審査:** 中小企業融資に特化
- **株式投資や市場分析機能:** 融資審査に直接関係のない機能は含めない
- **顧客管理（CRM）機能:** 既存CRMシステムとの連携を前提とし、自身ではCRM機能を持たない
- **外部信用調査データベースとのリアルタイム連携:** 将来的な拡張として検討するが、初期バージョンでは手動アップロードで対応

---

## 3. 技術仕様

### 3.1 システムアーキテクチャ

**構成:**
- **フロントエンド:** React 19 + TypeScript + Tailwind CSS 4
- **バックエンド:** Node.js (Express 4) + tRPC 11
- **データベース:** MySQL 8.0（TiDB Cloud推奨）
- **認証:** Manus OAuth（本開発では独自の認証システムに置き換え可能）
- **ストレージ:** AWS S3（決算書PDF、生成された稟議書PDFの保存）
- **AI/ML:**
  - OCRエンジン: Google Cloud Vision API または AWS Textract
  - LLM: OpenAI GPT-4 または Claude 3.5 Sonnet（稟議書生成用）

**デプロイ環境:**
- 開発環境: Manus開発サーバー
- 本番環境: AWS EC2 + RDS または Vercel + PlanetScale

### 3.2 データモデル

#### 3.2.1 テーブル設計

**users テーブル**
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

**loanApplications テーブル**
```sql
CREATE TABLE loanApplications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  companyName TEXT NOT NULL,
  industry VARCHAR(100),
  establishedYear INT,
  representativeName TEXT,
  employeeCount INT,
  loanAmount BIGINT NOT NULL,
  loanPeriod INT NOT NULL,
  interestRate DECIMAL(5,2),
  fundingPurpose TEXT,
  status ENUM('draft', 'analyzing', 'completed', 'approved', 'rejected') DEFAULT 'draft' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**financialStatements テーブル**
```sql
CREATE TABLE financialStatements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loanApplicationId INT NOT NULL,
  fileUrl TEXT NOT NULL,
  fileKey TEXT NOT NULL,
  fiscalYear INT NOT NULL,
  revenue BIGINT,
  operatingProfit BIGINT,
  netIncome BIGINT,
  totalAssets BIGINT,
  totalLiabilities BIGINT,
  equity BIGINT,
  currentAssets BIGINT,
  currentLiabilities BIGINT,
  operatingCashFlow BIGINT,
  investingCashFlow BIGINT,
  financingCashFlow BIGINT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (loanApplicationId) REFERENCES loanApplications(id) ON DELETE CASCADE
);
```

**financialMetrics テーブル**
```sql
CREATE TABLE financialMetrics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loanApplicationId INT NOT NULL,
  revenue BIGINT,
  operatingProfit BIGINT,
  netIncome BIGINT,
  totalAssets BIGINT,
  totalLiabilities BIGINT,
  equity BIGINT,
  currentAssets BIGINT,
  currentLiabilities BIGINT,
  roe DECIMAL(10,2),
  roa DECIMAL(10,2),
  currentRatio DECIMAL(10,2),
  debtEquityRatio DECIMAL(10,2),
  operatingMargin DECIMAL(10,2),
  equityRatio DECIMAL(10,2),
  assetTurnover DECIMAL(10,2),
  inventoryTurnover DECIMAL(10,2),
  industryAvgRoe DECIMAL(10,2),
  industryAvgRoa DECIMAL(10,2),
  industryAvgCurrentRatio DECIMAL(10,2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (loanApplicationId) REFERENCES loanApplications(id) ON DELETE CASCADE
);
```

**simulations テーブル**
```sql
CREATE TABLE simulations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loanApplicationId INT NOT NULL,
  scenarioType ENUM('base', 'revenue_decrease', 'cost_increase', 'interest_rate_increase', 'custom') NOT NULL,
  parameters JSON NOT NULL,
  results JSON NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (loanApplicationId) REFERENCES loanApplications(id) ON DELETE CASCADE
);
```

**proposalDocuments テーブル**
```sql
CREATE TABLE proposalDocuments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  loanApplicationId INT NOT NULL,
  content TEXT NOT NULL,
  version INT DEFAULT 1 NOT NULL,
  fileUrl TEXT,
  fileKey TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (loanApplicationId) REFERENCES loanApplications(id) ON DELETE CASCADE
);
```

#### 3.2.2 データフロー

1. **決算書アップロード:**
   - ユーザーがPDFをアップロード → S3に保存 → fileUrlとfileKeyをfinanicalStatementsテーブルに保存
   - OCR処理をバックグラウンドで実行 → 財務データを抽出 → financialStatementsテーブルを更新

2. **財務指標計算:**
   - financialStatementsテーブルから財務データを取得
   - 財務指標を計算 → financialMetricsテーブルに保存
   - 業界ベンチマークデータと比較 → 結果をfinancialMetricsテーブルに保存

3. **シミュレーション:**
   - ユーザーが融資額、返済期間、金利を入力
   - バックエンドでキャッシュフロー予測を計算
   - 結果をsimulationsテーブルに保存（JSON形式）

4. **稟議書生成:**
   - financialMetrics、simulations、loanApplicationsテーブルからデータを取得
   - LLMに送信して稟議書を生成
   - 生成された稟議書をproposalDocumentsテーブルに保存
   - PDF化してS3に保存 → fileUrlとfileKeyを更新

### 3.3 API設計（tRPC）

#### 3.3.1 主要エンドポイント

**loanApplications ルーター**
```typescript
loanApplications: router({
  create: publicProcedure
    .input(z.object({
      companyName: z.string(),
      industry: z.string().optional(),
      loanAmount: z.number(),
      loanPeriod: z.number(),
    }))
    .mutation(async ({ input }) => { /* ... */ }),
  
  list: publicProcedure
    .query(async () => { /* ... */ }),
  
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => { /* ... */ }),
  
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['draft', 'analyzing', 'completed', 'approved', 'rejected']).optional(),
      /* ... */
    }))
    .mutation(async ({ input }) => { /* ... */ }),
  
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => { /* ... */ }),
})
```

**financialStatements ルーター**
```typescript
financialStatements: router({
  upload: publicProcedure
    .input(z.object({
      loanApplicationId: z.number(),
      fileUrl: z.string(),
      fileKey: z.string(),
      fiscalYear: z.number(),
    }))
    .mutation(async ({ input }) => { /* ... */ }),
  
  analyzeOCR: publicProcedure
    .input(z.object({
      financialStatementId: z.number(),
    }))
    .mutation(async ({ input }) => {
      // OCR処理を実行し、財務データを抽出
      // financialStatementsテーブルを更新
    }),
  
  getByApplicationId: publicProcedure
    .input(z.object({ loanApplicationId: z.number() }))
    .query(async ({ input }) => { /* ... */ }),
})
```

**financialMetrics ルーター**
```typescript
financialMetrics: router({
  calculate: publicProcedure
    .input(z.object({
      loanApplicationId: z.number(),
    }))
    .mutation(async ({ input }) => {
      // 財務指標を計算
      // 業界ベンチマークと比較
      // financialMetricsテーブルに保存
    }),
  
  getByApplicationId: publicProcedure
    .input(z.object({ loanApplicationId: z.number() }))
    .query(async ({ input }) => { /* ... */ }),
})
```

**simulations ルーター**
```typescript
simulations: router({
  run: publicProcedure
    .input(z.object({
      loanApplicationId: z.number(),
      scenarioType: z.enum(['base', 'revenue_decrease', 'cost_increase', 'interest_rate_increase', 'custom']),
      parameters: z.object({
        loanAmount: z.number().optional(),
        loanPeriod: z.number().optional(),
        interestRate: z.number().optional(),
        revenueChangePercent: z.number().optional(),
        costChangePercent: z.number().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      // キャッシュフローシミュレーションを実行
      // 結果をsimulationsテーブルに保存
    }),
  
  getByApplicationId: publicProcedure
    .input(z.object({ loanApplicationId: z.number() }))
    .query(async ({ input }) => { /* ... */ }),
})
```

**proposalDocuments ルーター**
```typescript
proposalDocuments: router({
  generate: publicProcedure
    .input(z.object({
      loanApplicationId: z.number(),
    }))
    .mutation(async ({ input }) => {
      // 財務指標とシミュレーション結果を取得
      // LLMで稟議書を生成
      // proposalDocumentsテーブルに保存
    }),
  
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      content: z.string(),
    }))
    .mutation(async ({ input }) => { /* ... */ }),
  
  exportPDF: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      // Markdownを PDF に変換
      // S3にアップロード
      // fileUrlを返す
    }),
  
  getByApplicationId: publicProcedure
    .input(z.object({ loanApplicationId: z.number() }))
    .query(async ({ input }) => { /* ... */ }),
})
```

### 3.4 外部API連携

#### 3.4.1 OCRエンジン

**推奨: Google Cloud Vision API**

理由:
- 日本語の決算書に対する認識精度が高い
- テーブル構造の認識が可能
- 価格: 1,000リクエストあたり$1.50（月間1,000リクエストまで無料）

実装例:
```typescript
import vision from '@google-cloud/vision';

async function extractFinancialData(fileUrl: string) {
  const client = new vision.ImageAnnotatorClient();
  const [result] = await client.documentTextDetection(fileUrl);
  const fullTextAnnotation = result.fullTextAnnotation;
  
  // テキストから財務データを抽出するロジック
  // 正規表現やLLMを使用して構造化データに変換
  
  return {
    revenue: extractedRevenue,
    operatingProfit: extractedOperatingProfit,
    // ...
  };
}
```

#### 3.4.2 LLM（稟議書生成）

**推奨: OpenAI GPT-4o**

理由:
- 日本語の文章生成品質が高い
- 構造化された入力から自然な文章を生成可能
- 価格: 入力$2.50/1M tokens、出力$10.00/1M tokens

実装例:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateProposal(financialMetrics, simulationResults, applicationData) {
  const prompt = `
あなたは融資審査の専門家です。以下の情報を基に、融資稟議書の「財務上の強み」「懸念されるリスク要因」「シミュレーション結果要約」「推奨可否」のセクションを生成してください。

【企業情報】
企業名: ${applicationData.companyName}
業種: ${applicationData.industry}
融資希望額: ${applicationData.loanAmount}万円
融資期間: ${applicationData.loanPeriod}ヶ月

【財務指標】
ROE: ${financialMetrics.roe}% (業界平均: ${financialMetrics.industryAvgRoe}%)
ROA: ${financialMetrics.roa}% (業界平均: ${financialMetrics.industryAvgRoa}%)
流動比率: ${financialMetrics.currentRatio}% (業界平均: ${financialMetrics.industryAvgCurrentRatio}%)
自己資本比率: ${financialMetrics.equityRatio}%
営業利益率: ${financialMetrics.operatingMargin}%

【シミュレーション結果】
ベースケース: 月次返済額 ${simulationResults.base.monthlyPayment}万円、返済余力 ${simulationResults.base.surplusCashFlow}万円
売上20%減少シナリオ: 返済余力 ${simulationResults.revenueDecrease.surplusCashFlow}万円

出力形式:
【財務上の強み】
- ...

【懸念されるリスク要因】
- ...

【シミュレーション結果要約】
...

【推奨可否】
推奨/条件付き推奨/慎重審査 のいずれかを選択し、理由を記載してください。
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return response.choices[0].message.content;
}
```

---

## 4. UI/UX設計

### 4.1 デザイン原則

1. **情報の階層化:** 重要な情報を上部に配置し、詳細情報は折りたたみ可能に
2. **視覚的なフィードバック:** リスクアラートは赤、良好な指標は緑でハイライト
3. **ワンクリック操作:** シミュレーション実行、稟議書生成は1クリックで完了
4. **レスポンシブデザイン:** タブレット（iPad）でも快適に操作可能
5. **アクセシビリティ:** WCAG 2.1 AA準拠

### 4.2 画面構成

#### 4.2.1 ダッシュボード（案件一覧）

**レイアウト:**
- 左サイドバー: ナビゲーションメニュー（案件一覧、新規案件作成）
- メインエリア: 融資案件のリスト（カード形式）

**案件カード表示項目:**
- 企業名
- 業種
- 融資希望額
- ステータス（下書き、分析中、完了、承認、却下）
- 最終更新日
- リスクレベル（高・中・低）

**操作:**
- カードをクリックすると案件詳細ページに遷移
- 「新規案件作成」ボタンで新規案件作成フォームを表示

#### 4.2.2 案件詳細ページ

**タブ構成:**
1. **概要:** 企業情報、融資概要
2. **財務分析:** インスタント企業診断ダッシュボード
3. **シミュレーション:** キャッシュフローシミュレーション
4. **稟議書:** 稟議書ドラフト生成・編集

**財務分析タブ:**
- 上部: リスクアラート（赤背景で目立つように）
- 中央: 財務指標の棒グラフ（業界平均との比較）
- 下部: キャッシュフローの折れ線グラフ

**シミュレーションタブ:**
- 左側: 入力フォーム（融資額、返済期間、金利）
- 右側: シミュレーション結果グラフ
- 下部: リスクシナリオボタン（売上減少、経費増加、金利上昇）

**稟議書タブ:**
- 上部: 「稟議書生成」ボタン
- 中央: 稟議書プレビュー（Markdown形式）
- 下部: 「編集」「PDF出力」「Word出力」ボタン

### 4.3 カラーパレット

**プライマリカラー:**
- ブルー系（信頼感、プロフェッショナル）
- メイン: `#2563eb` (青)
- アクセント: `#3b82f6` (明るい青)

**セカンダリカラー:**
- グリーン: `#10b981` (良好な指標)
- レッド: `#ef4444` (リスクアラート)
- イエロー: `#f59e0b` (警告)

**背景:**
- ダークモード: `#0f172a` (背景)、`#1e293b` (カード)
- ライトモード: `#ffffff` (背景)、`#f8fafc` (カード)

### 4.4 フォント

- **見出し:** Inter（太字、サイズ24px〜32px）
- **本文:** Inter（通常、サイズ14px〜16px）
- **数値:** Roboto Mono（等幅、サイズ14px〜18px）

---

## 5. 開発計画

### 5.1 マイルストーン

| フェーズ | 期間 | 主要成果物 |
|----------|------|-----------|
| Phase 1: 基盤構築 | Week 1-2 | データベース設計、認証システム、基本UI |
| Phase 2: 決算書解析 | Week 3-4 | OCR連携、財務指標計算、ダッシュボード |
| Phase 3: シミュレーション | Week 5-6 | キャッシュフロー予測、リスクシナリオ |
| Phase 4: 稟議書生成 | Week 7-8 | LLM連携、稟議書テンプレート、PDF出力 |
| Phase 5: テスト・改善 | Week 9-10 | ユーザーテスト、バグ修正、パフォーマンス最適化 |
| Phase 6: リリース準備 | Week 11-12 | ドキュメント整備、デプロイ、トレーニング |

### 5.2 優先順位

**P0（必須）:**
- 決算書アップロード機能
- OCRによる財務データ抽出
- 財務指標計算とベンチマーク比較
- キャッシュフローシミュレーション（ベースケース）
- 稟議書ドラフト自動生成

**P1（重要）:**
- リスクシナリオシミュレーション
- 稟議書編集機能
- PDF/Word出力

**P2（あれば良い）:**
- 複数年度の財務トレンド分析
- 外部信用調査データベース連携
- 承認ワークフロー

### 5.3 リスクと対策

| リスク | 影響度 | 対策 |
|--------|--------|------|
| OCR精度が低い | 高 | 手動修正機能を実装、OCRエンジンを複数試す |
| LLMのコスト超過 | 中 | プロンプトを最適化、キャッシュ機能を実装 |
| ユーザー受容性が低い | 高 | 早期にユーザーテストを実施、フィードバックを反映 |
| データセキュリティ | 高 | 暗号化、アクセス制御、監査ログを実装 |

---

## 6. 成功指標（KPI）

### 6.1 定量指標

| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| 融資審査1件あたりの平均処理時間 | 50%削減 | ログ分析（案件作成から稟議書生成までの時間） |
| デイリーアクティブユーザー率（DAU） | 80%以上 | ログイン履歴分析 |
| 決算書OCR精度 | 95%以上 | 手動修正率の測定 |
| 稟議書生成成功率 | 90%以上 | エラーログ分析 |
| ユーザー満足度（NPS） | 50以上 | 四半期ごとのアンケート調査 |

### 6.2 定性指標

- ユーザーインタビューでのフィードバック
- 担当者の業務負荷軽減の実感
- 審査品質の向上（延滞率の変化）

---

## 7. セキュリティとコンプライアンス

### 7.1 データ保護

- **暗号化:** すべての個人情報と財務データはAES-256で暗号化
- **アクセス制御:** ロールベースアクセス制御（RBAC）を実装
- **監査ログ:** すべてのデータアクセスと変更を記録

### 7.2 コンプライアンス

- **個人情報保護法:** 個人情報の取得・利用・提供に関する同意取得
- **金融機関向けガイドライン:** 金融庁「金融分野におけるサイバーセキュリティ強化に向けた取組方針」に準拠
- **GDPR（将来的な海外展開を見据えて）:** データポータビリティ、削除権の実装

---

## 8. 運用とメンテナンス

### 8.1 監視

- **アプリケーション監視:** Datadog、New RelicなどのAPMツールを使用
- **エラー追跡:** Sentryでエラーログを収集
- **パフォーマンス監視:** レスポンスタイム、スループット、エラー率を監視

### 8.2 バックアップ

- **データベース:** 日次フルバックアップ、1時間ごとの差分バックアップ
- **S3:** バージョニング有効化、クロスリージョンレプリケーション

### 8.3 サポート

- **ユーザーサポート:** メール、チャットでの問い合わせ対応
- **ドキュメント:** ユーザーマニュアル、FAQ、動画チュートリアル
- **トレーニング:** 導入時のオンボーディングセッション

---

## 9. 付録

### 9.1 用語集

| 用語 | 定義 |
|------|------|
| ROE（自己資本利益率） | 純利益 ÷ 自己資本 × 100。企業が株主資本をどれだけ効率的に活用して利益を上げているかを示す指標 |
| ROA（総資産利益率） | 純利益 ÷ 総資産 × 100。企業が総資産をどれだけ効率的に活用して利益を上げているかを示す指標 |
| 流動比率 | 流動資産 ÷ 流動負債 × 100。短期的な支払能力を示す指標。100%以上が望ましい |
| 自己資本比率 | 自己資本 ÷ 総資産 × 100。企業の財務安全性を示す指標。高いほど安全 |
| キャッシュフロー | 一定期間における現金の流れ。営業CF、投資CF、財務CFの3つに分類される |
| 稟議書 | 融資の可否を判断するための内部文書。財務分析、リスク評価、推奨可否などを記載 |

### 9.2 参考資料

- 中小企業庁「中小企業実態基本調査」
- 金融庁「金融分野におけるサイバーセキュリティ強化に向けた取組方針」
- 日本銀行「貸出先別貸出金」統計
- TDB企業情報データベース

---

## 10. 変更履歴

| バージョン | 日付 | 変更内容 | 作成者 |
|-----------|------|----------|--------|
| 1.0 | 2026年2月7日 | 初版作成 | Manus AI |

---

**本仕様書に関する問い合わせ先:**  
Manus AI開発チーム
