# 🔍 Jobscope - Chrome Extension

> **[🌐 紹介ページ (LP) を見る](docs/lp/index.html)**

求人情報をAIで解析し、Notionデータベースに保存するChrome拡張機能です。

## ✨ 主な機能

| 機能                     | 説明                                                        |
| :----------------------- | :---------------------------------------------------------- |
| **ゼロクリック解析**     | 求人ページを開いてボタン一発でAI解析                        |
| **サイドパネル表示**     | ページを見ながら解析結果を確認・編集                        |
| **Notion連携**           | 解析データをNotionデータベースに直接保存・更新              |
| **🆕 URL重複チェック**    | 既にNotionに登録済みの求人を自動検出して更新モードに切替    |
| **🆕 企業リサーチリンク** | 口コミサイト・SNS検索URLを自動生成（OpenWork/X/LinkedIn等） |
| **モデル選択・追加**     | GPT-4o mini, GPT-5 Nanoなどを選択可能・カスタム追加対応     |
| **プロンプト設定**       | 抽出ルールや要約フォーマットを自由にカスタマイズ            |
| **ローカル保存**         | APIキーはブラウザ内に安全に保管                             |

## 🚀 インストール

1. **ビルド**
   ```bash
   npm install
   npm run build
   ```

2. **Chromeに読み込み**
   - `chrome://extensions` を開く
   - 「デベロッパーモード」をON
   - 「パッケージ化されていない拡張機能を読み込む」で `dist` フォルダを選択

## ⚙️ 設定

1. ブラウザツールバーのJobscopeアイコンをクリック
2. 右上の歯車アイコンで設定画面を開く
3. 以下を入力:
   - **OpenAI API Key** (sk-...)
   - **Notion Integration Token** (secret_...)
   - **Notion Database ID**

## 📖 使い方

1. 求人サイト（Green, Wantedlyなど）で求人ページを開く
2. Jobscopeアイコンをクリックしてサイドパネルを開く
3. 「Analyze This Page」をクリック
4. 解析結果を確認・編集
5. 「Save to Notion」でNotionに保存

### 🆕 企業リサーチ機能（Phase 1）

解析時に以下のリサーチリンクが自動生成されます：

**定性的リサーチ（口コミ・評判）**
- 🔍 **OpenWork** - 社員・元社員の口コミ、評価スコア
- 🔍 **Lighthouse** - 企業の評判・年収情報
- 🔍 **キャリコネ** - 働きがいや社風の実態

**SNS・記事検索**
- 🐦 **X (Twitter)** - 社員の声や企業評判
- 📝 **note** - 社員の体験談やインタビュー
- 💼 **LinkedIn** - 企業情報・社員プロフィール

**企業公式情報**
- 🏢 **企業HP** - AI が推測した公式ウェブサイト

各リンクは **クリック可能** で、新しいタブで開きます。
企業の多角的なリサーチが **ワンクリック** で可能になります！

## 🛠 技術スタック

- **Framework**: Vite + React + TypeScript
- **Chrome Extension**: CRXJS
- **Styling**: Tailwind CSS
- **API**: OpenAI, Notion

## 📁 プロジェクト構成

```
Jobscope/
├── src/
│   ├── App.tsx          # メインサイドパネルUI
│   ├── options.tsx      # 設定画面
│   ├── content.ts       # コンテンツスクリプト（DOM取得）
│   ├── background.ts    # サービスワーカー
│   ├── manifest.json    # 拡張機能設定
│   └── lib/
│       ├── openai.ts    # AI解析ロジック
│       └── notion.ts    # Notion API連携
├── legacy_server/       # 旧Next.jsサーバー（アーカイブ）
└── docs/
    ├── walkthrough.md   # 利用ガイド
    └── property_reference.md
```

## 📝 ライセンス

MIT License
