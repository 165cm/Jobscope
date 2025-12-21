# Jobscope Walkthrough (使い方ガイド)

## 🎯 概要
Jobscopeは求人情報をAIで解析し、Notionデータベースに保存するツールです。

---

## 📋 基本的な使い方

### 1. 求人情報の入力
1. **URL入力** (推奨): 求人ページのURLを入力 → 自動スクレイピング
2. **テキスト入力**: URLが使えない場合、求人情報を直接貼り付け

### 2. AI解析
「解析」ボタンをクリックすると、AIが以下を自動抽出:
- 会社名、職種、年収、勤務地
- 従業員数、平均年齢、最寄り駅
- 求人媒体（doda, Green, Wantedly 等）を自動判定
- スキルマッチ度、特徴フラグ

### 3. プレビュー編集
解析結果は保存前に編集可能:
- **スキルタグ**: カンマ区切りで修正（「Word, Excel」→別タグへ分割）
- **会社名**: 自動で「株式会社」→「(株)」に省略
- **各項目**: 全て手動で修正可能

### 4. Notion保存
「Notionに保存」ボタンで、解析データがNotionへ送信されます。

---

## ⚙️ 初期設定

### 環境変数
`.env.local` に以下を設定:
```
NOTION_API_KEY=secret_xxxxx
NOTION_DATABASE_ID=xxxxx
OPENAI_API_KEY=sk-xxxxx
```

### Notionデータベース
[property_reference.md](./property_reference.md) を参照して、Notionのプロパティを設定してください。

---

## 📖 関連ドキュメント
- [セットアップガイド](./セットアップガイド.md)
- [プロパティリファレンス](./property_reference.md)
- [Notionビュー設定](./notion-views.md)
