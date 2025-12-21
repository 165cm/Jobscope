# Jobscope (ジョブスコープ) 🔭

**AIを活用した高度な求人・履歴書管理アプリケーション**

Jobscopeは、転職活動における「履歴書の管理」と「求人ごとの最適化」を効率化するために開発されました。
Base(事実)の履歴書から、企業ごとに特化したBranch(派生)を作成し、AIを使って求人票にマッチした志望動機や自己PRを自動生成します。

## ✨ 主な機能

- **🌳 履歴書のツリー管理 (Resume Tree)**
  - 「事実ベース(MAIN)」の履歴書を親として、企業ごとに「派生(BRANCH)」を作成
  - 履歴書のバージョン管理 (v1, v2...) が可能
- **🤖 求人情報のAI解析**
  - 求人サイトのURLを入力するだけで、募集要項を自動抽出
  - **New!** スクレイピングできないサイトでも、テキスト手動入力 + URL記録が可能に
  - **New!** 求人媒体（Source）の自動判定 - URL/本文から Green, Wantedly, doda などを自動検出
  - 履歴書とのマッチング度、不足スキル、推奨されるアピールポイントをAIが診断
- **📝 Notion連携強化**
  - 解析した求人データ（年収、勤務地、従業員数、平均年齢など）を詳細に保存
  - 自動保存機能により、解析完了と同時にNotionへ反映
  - [おすすめのNotionビュー設定](docs/notion-views.md) で比較検討もスムーズに
- **✏️ 編集可能なプレビュー (New!)**
  - 解析結果を保存前に手動で編集・修正可能
  - スキルタグのカンマ区切り編集でNotion保存エラーを防止
  - 会社名の自動省略機能（株式会社→(株) など）
- **📄 マークダウンプレビュー**
  - 作成した履歴書をリアルタイムでプレビュー・コピー可能

## 🚀 セットアップ

### 必要条件
- Node.js 18+
- Notion アカウント (データベース連携用)

### インストール

```bash
git clone https://github.com/165cm/Jobscope.git
cd Jobscope
npm install
```

### 環境設定
`.env.local` ファイルを作成し、以下の変数を設定してください。

```bash
# Notion API
NOTION_API_KEY=secret_xxxxxxxx
NOTION_DATABASE_ID=xxxxxxxx

# OpenAI API (AI解析用)
OPENAI_API_KEY=sk-xxxxxxxx
```

### 起動
```bash
npm run dev
```
`http://localhost:3000` にアクセスしてください。

## 📖 マニュアル
詳細な使い方は [Walkthrough](docs/walkthrough.md) を参照してください。
