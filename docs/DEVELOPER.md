# Jobscope 開発者向けドキュメント 🛠️

## 🔧 技術スタック
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context + LocalStorage
- **Integration**: Notion API, OpenAI API

## ⚠️ Notion連携に関する重要事項 (Critical)

本プロジェクトのNotion連携機能は、データベースのスキーマ構造に強く依存しています。
特に **「タイトル列」の扱い** に関して、実装時に大きな落とし穴となった点があるため、以下の構成を厳守してください。

### 1. データベースのカラム構成
Notion APIの仕様上、データベースには**必ず1つの `title` 型プロパティ（プライマリキー）** が存在します。
CSVインポートなどでDBを作成した場合、見かけ上の列名と内部IDが食い違うことがあります。

#### 正しいスキーマ定義
| 列名 (Display Name) | プロパティ型 (Notion)     | 内部動作・注意点                                                                              |
| ------------------- | ------------------------- | --------------------------------------------------------------------------------------------- |
| **Name**            | **Title (タイトル)**      | 会社名を格納。DBのプライマリキー。内部IDは通常 `title` です。                                 |
| **Job Title**       | **Text (リッチテキスト)** | 職種名（例：プロダクトマネージャー）を格納。**ここを `title` という名前にしないでください！** |

### 🚨 "Type mismatch" エラーについて
開発中に以下のエラーが発生した場合：
> `Type mismatch between request for property 'title'. Got type 'title' and expected type 'rich_text' from database schema.`

これは、**APIが「職種名(Text)」のつもりで送ったデータを、Notion側が「プライマリキー(Title)」として解釈しようとして衝突している**（あるいはその逆）状態です。

**解決策:**
一番左の列（Title型）以外の列名を `title` にせず、`Job Title` や `Position` などにリネームしてください。
本プロジェクトの `src/app/api/notion/route.ts` は、この `Name` (Title) と `Job Title` (Text) の分離を前提に実装されています。

## 📂 ディレクトリ構造

```
src/
├── app/
│   ├── api/          # API Routes (Notion, Scraper, Resume Analysis)
│   ├── resume/       # 履歴書管理画面
│   └── page.tsx      # メイントップページ
├── components/       # UIコンポーネント (ResumeTree, PreviewModal etc)
├── lib/
│   ├── notion.ts     # Notion Clientの初期化
│   └── resumes.ts    # 履歴書データの型定義とユーティリティ
└── docs/             # 各種ドキュメント
```

## 🧪 テスト・デバッグ
Notion連携のデバッグには、`test-scripts/` (もしあれば) やAPIルートに直接ログを仕込む方法が有効です。
`src/app/api/notion/route.ts` 内では、Notionクライアントをランタイムで初期化することで、Next.jsのビルド時キャッシュの影響を回避しています。
