# 🔍 Jobscope - Chrome Extension

求人情報をAIで解析し、Notionデータベースに保存するChrome拡張機能です。

## ✨ 主な機能

| 機能                 | 説明                                                    |
| :------------------- | :------------------------------------------------------ |
| **ゼロクリック解析** | 求人ページを開いてボタン一発でAI解析                    |
| **サイドパネル表示** | ページを見ながら解析結果を確認・編集                    |
| **Notion連携**       | 解析データをNotionデータベースに直接保存・更新          |
| **モデル選択・追加** | GPT-4o mini, GPT-5 Nanoなどを選択可能・カスタム追加対応 |
| **プロンプト設定**   | 抽出ルールや要約フォーマットを自由にカスタマイズ        |
| **ローカル保存**     | APIキーはブラウザ内に安全に保管                         |

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
