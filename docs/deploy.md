# デプロイガイド (Vercel)

Jobscopeをインターネット上で公開するための手順です。
本アプリケーションはAPI機能（AI解析・Notion保存）を使用しているため、**GitHub PagesではなくVercelへのデプロイを推奨**します。

## なぜGitHub Pagesでは動かないのか？
GitHub Pagesは「静的なWebサイト」のホスティングに特化しています。
Jobscopeのようにサーバー側でAPIを動かす（OpenAIやNotionと通信する）機能を持つアプリは、GitHub Pages上では正常に動作しません（画面は表示されますが、解析ボタンなどを押すとエラーになります）。

---

## 🚀 Vercelへのデプロイ手順 (推奨)

VercelはNext.jsの開発元が提供するホスティングサービスで、個人開発であれば**無料**で利用できます。

### 1. Vercelアカウントの作成
1.  [Vercel公式サイト](https://vercel.com/) にアクセスします。
2.  「Sign Up」をクリックし、「Continue with GitHub」を選択してGitHubアカウントでログインします。

### 2. プロジェクトのインポート
1.  Vercelのダッシュボードで「Add New ...」→「Project」をクリックします。
2.  GitHubリポジトリの一覧から、`Jobscope` の横にある「Import」ボタンをクリックします。

### 3. 環境変数の設定 (重要！)
デプロイ設定画面の「**Environment Variables**」という項目を開き、 `.env.local` に記述していた内容を登録します。

| Key (名前)            | Value (値)                          |
| :-------------------- | :---------------------------------- |
| `NOTION_API_KEY`      | `secret_...` から始まるNotionのキー |
| `NOTION_DATABASE_ID`  | NotionのデータベースID              |
| `OPENAI_API_KEY`      | `sk-...` から始まるOpenAIのキー     |
| `BASIC_AUTH_USER`     | (任意) Basic認証のユーザー名        |
| `BASIC_AUTH_PASSWORD` | (任意) Basic認証のパスワード        |

※ 値はコピペで慎重に入力してください。

### セキュリティについて (Basic認証)
`BASIC_AUTH_USER` と `BASIC_AUTH_PASSWORD` を設定すると、サイト全体にパスワード制限がかかります。
自分専用として使う場合は、必ず設定してください。

### 4. デプロイ実行
1.  設定が終わったら「Deploy」ボタンをクリックします。
2.  1〜2分ほどでビルドが完了し、完了画面が表示されます。
3.  表示されたURL (例: `jobscope.vercel.app`) にアクセスして動作を確認してください。

---

## 注意点
*   **OpenAIの料金**: 公開したサイトを誰かが利用するたびに、あなたのOpenAIアカウントのAPI利用料が発生します。URLの共有範囲にはご注意ください。
*   **Notionの権限**: 新しいページが保存されない場合は、Notion側でインテグレーション（コネクト）が外れていないか確認してください。
