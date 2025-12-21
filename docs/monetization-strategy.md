# Jobscope 収益化戦略ドキュメント

## 概要

Chrome拡張機能 + Notionテンプレートを$5で販売し、顧客満足度を最大化するための戦略

---

## 1. 顧客満足度を最大化する戦略

### 1.1 価値提案の明確化

**$5で得られる価値を明確に：**

| 提供物 | 具体的価値 |
|--------|-----------|
| Chrome拡張機能 | ワンクリック求人解析、30+項目の自動抽出 |
| Notionテンプレート | 最適化済みDB構造、ビュー設定済み |
| セットアップガイド | 5分で完了する動画付きガイド |
| アップデート | 永続的な無料アップデート |

### 1.2 オンボーディング体験の最適化

```
購入 → 即座にアクセス → 5分で稼働
```

**具体的施策：**

1. **購入直後の自動配信**
   - Notionテンプレート複製リンク
   - 拡張機能インストールリンク
   - ステップバイステップセットアップ動画（日本語）

2. **つまずきポイントの先回り対応**
   - Notion Integration Token取得方法（スクリーンショット付き）
   - Database ID確認方法（図解）
   - OpenAI API Key取得・設定方法
   - よくあるエラーとその対処法

3. **成功体験を早く**
   - 「最初の1件を解析してみよう」チュートリアル
   - サンプル求人URLを提供

### 1.3 Notionテンプレートの付加価値

**基本セット（$5に含まれる）：**

```
📊 Job Tracker Database
├── 🔍 ビュー: 全求人一覧（テーブル）
├── 📋 ビュー: カンバン（ステータス別）
├── 📅 ビュー: カレンダー（面接日程）
├── ⭐ ビュー: マッチ度別フィルター
├── 📈 ビュー: 給与レンジ比較
└── 🏷️ プリセット: スキルタグ（日本のIT職向け）
```

**差別化ポイント：**
- 日本の求人サイトに最適化されたプロパティ
- 万円単位の給与管理
- 日本語UIとカテゴリ名
- 面接準備セクション付き

### 1.4 サポート体制

| サポートレベル | 内容 |
|---------------|------|
| セルフサービス | FAQ、動画ガイド、トラブルシューティング |
| コミュニティ | Discord/Slack チャンネル（購入者限定） |
| 直接サポート | メール対応（24-48時間以内） |

---

## 2. クロスプラットフォーム課金の統合方法

### 2.1 課題

```
Chrome Web Store で購入 → 拡張機能のみ？
Notion マーケットプレイス で購入 → テンプレートのみ？

→ どちらで買っても両方使えるようにしたい
```

### 2.2 解決策: 統一ライセンスキー方式

**アーキテクチャ：**

```
┌─────────────────────────────────────────────────────────┐
│                  あなたのバックエンド                      │
│              (License Verification API)                   │
│                                                           │
│  POST /api/verify-license                                │
│  - license_key: string                                   │
│  - Returns: { valid: true, products: ["chrome", "notion"]}│
└─────────────────────────────────────────────────────────┘
           ▲                           ▲
           │                           │
    ┌──────┴──────┐             ┌──────┴──────┐
    │   Chrome    │             │   Notion    │
    │  Extension  │             │  Template   │
    │             │             │             │
    │ ライセンス  │             │ 埋め込み    │
    │ キー入力    │             │ ページで    │
    │ → 検証      │             │ キー発行    │
    └─────────────┘             └─────────────┘
```

### 2.3 具体的実装パターン

#### パターンA: Gumroad/Lemon Squeezy 統合（推奨）

**なぜ推奨か：**
- 両プラットフォームの外部リンク制限を回避
- 1つの商品ページで両方を販売
- ライセンスキー自動発行機能あり

**フロー：**

```
1. Chrome Web Store
   └─ 無料で配布（フリーミアム）
   └─ 拡張機能内に「Pro版を購入」ボタン
   └─ → Gumroad/Lemon Squeezyへ誘導

2. Notion Marketplace
   └─ テンプレート無料公開
   └─ テンプレート内に「Pro版」購入リンク
   └─ → 同じGumroad/Lemon Squeezy商品へ

3. 購入後
   └─ ライセンスキー自動発行
   └─ 顧客はキーをChrome拡張に入力
   └─ Pro機能がアンロック + テンプレートフルアクセス
```

**実装コード例（Chrome拡張側）：**

```typescript
// src/lib/license.ts
export async function verifyLicense(licenseKey: string): Promise<boolean> {
  // Lemon Squeezy License API
  const response = await fetch(
    `https://api.lemonsqueezy.com/v1/licenses/validate`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        license_key: licenseKey,
        instance_id: await getInstanceId()
      })
    }
  );

  const data = await response.json();
  return data.valid === true;
}
```

#### パターンB: 独自バックエンド方式

**必要なもの：**
- 簡易バックエンド（Cloudflare Workers / Vercel Functions）
- データベース（Supabase / PlanetScale）

**テーブル設計：**

```sql
CREATE TABLE licenses (
  id UUID PRIMARY KEY,
  license_key VARCHAR(32) UNIQUE,
  email VARCHAR(255),
  purchase_source ENUM('chrome', 'notion', 'gumroad'),
  purchase_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);
```

#### パターンC: 信頼ベースのシンプル方式（小規模向け）

**フロー：**

```
1. 購入者にメールで以下を送付：
   - Chrome拡張機能リンク（非公開/限定公開）
   - Notionテンプレート複製リンク
   - セットアップガイドPDF

2. Chrome Web Store は「非公開」設定
   - 購入者のみがリンクを知っている

3. Notionテンプレートは購入者専用URLで共有
```

**メリット:** 実装コスト0
**デメリット:** リンク流出リスク

---

## 3. プラットフォーム別の制約と対応

### 3.1 Chrome Web Store

| 制約 | 対応策 |
|------|--------|
| 課金は拡張内課金APIのみ | 外部決済へ誘導（許可されている） |
| 30%手数料 | 外部決済を使えば回避可能 |
| 審査に時間がかかる | 先に公開しておく |

**推奨アプローチ：**
- 拡張機能は**無料で公開**
- 拡張内に「Pro版購入」ボタンを設置
- 外部の決済ページ（Gumroad等）へリンク

### 3.2 Notion Marketplace (Notion Template Gallery)

| 制約 | 対応策 |
|------|--------|
| 無料テンプレートのみ | 基本版を無料公開し、Pro版は外部販売 |
| 直接課金不可 | テンプレート内に購入リンクを埋め込み |
| 外部リンク制限あり | 説明文ではなくテンプレート内ページに記載 |

**推奨アプローチ：**
- 基本テンプレートを無料公開（機能制限）
- テンプレート内に「フル版を購入」ページを含める
- 購入者には別のフルテンプレートを配布

---

## 4. 推奨する最終戦略

### 4.1 販売チャネル構成

```
┌─────────────────────────────────────────────────────────┐
│                   Lemon Squeezy                         │
│                （メイン販売プラットフォーム）               │
│                                                         │
│  商品: Jobscope Pro ($5)                               │
│  含まれるもの:                                          │
│  ├─ Chrome拡張機能（Pro版ライセンスキー）                │
│  ├─ Notionテンプレート（フル版複製リンク）               │
│  ├─ セットアップ動画                                    │
│  └─ 購入者限定Discordアクセス                           │
│                                                         │
│  ライセンスキー: 自動発行・自動検証                      │
└─────────────────────────────────────────────────────────┘
         ▲                              ▲
         │                              │
┌────────┴────────┐           ┌────────┴────────┐
│  Chrome Store   │           │ Notion Template │
│    (無料)       │           │  Gallery (無料) │
│                 │           │                 │
│ 基本機能のみ    │           │ 基本構造のみ    │
│ 「Pro版購入」   │           │ 「Pro版購入」   │
│  ボタン設置     │           │  リンク設置     │
└─────────────────┘           └─────────────────┘
```

### 4.2 フリーミアム機能分割

| 機能 | 無料版 | Pro版 ($5) |
|------|--------|------------|
| 基本解析 | ✅ 月5件まで | ✅ 無制限 |
| Notion保存 | ✅ 基本項目のみ | ✅ 全30+項目 |
| テンプレート | 基本ビュー | 全ビュー + 分析ダッシュボード |
| スキルマッチ | ❌ | ✅ |
| 面接準備 | ❌ | ✅ |
| サポート | コミュニティ | 優先メール |
| アップデート | 基本 | 優先アクセス |

### 4.3 顧客満足度KPI

| 指標 | 目標 |
|------|------|
| オンボーディング完了率 | 90%以上 |
| 最初の解析までの時間 | 10分以内 |
| 7日後アクティブ率 | 70%以上 |
| 返金率 | 5%以下 |
| NPS | 50以上 |

---

## 5. 実装優先順位

### Phase 1: MVP (1週間)

- [ ] Lemon Squeezyアカウント作成・商品設定
- [ ] ライセンス検証コードを拡張機能に追加
- [ ] Notionフルテンプレート作成
- [ ] セットアップガイド作成

### Phase 2: 最適化 (2週間)

- [ ] オンボーディングメール自動化
- [ ] 使用状況トラッキング
- [ ] フィードバック収集システム

### Phase 3: 成長 (継続)

- [ ] 機能追加（ユーザーフィードバック基づき）
- [ ] 他言語対応
- [ ] アフィリエイトプログラム

---

## 6. 技術実装詳細

### 6.1 ライセンス検証の追加

**新規ファイル: `src/lib/license.ts`**

```typescript
interface LicenseStatus {
  valid: boolean;
  tier: 'free' | 'pro';
  expiresAt?: string;
}

const LEMON_SQUEEZY_API = 'https://api.lemonsqueezy.com/v1';

export async function checkLicense(): Promise<LicenseStatus> {
  const { license_key } = await chrome.storage.local.get('license_key');

  if (!license_key) {
    return { valid: false, tier: 'free' };
  }

  try {
    const response = await fetch(`${LEMON_SQUEEZY_API}/licenses/validate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ license_key })
    });

    const data = await response.json();

    if (data.valid) {
      return { valid: true, tier: 'pro' };
    }
  } catch (error) {
    console.error('License validation failed:', error);
  }

  return { valid: false, tier: 'free' };
}

export async function activateLicense(licenseKey: string): Promise<boolean> {
  const status = await checkLicense();
  if (status.valid) {
    await chrome.storage.local.set({ license_key: licenseKey });
    return true;
  }
  return false;
}
```

### 6.2 UI変更 (App.tsx)

```tsx
// 使用量トラッキング
const [usageCount, setUsageCount] = useState(0);
const [isPro, setIsPro] = useState(false);

const FREE_LIMIT = 5;

// 解析前チェック
const handleAnalyze = async () => {
  if (!isPro && usageCount >= FREE_LIMIT) {
    // Pro版購入を促すモーダル表示
    showUpgradeModal();
    return;
  }
  // 通常の解析処理
};
```

---

## まとめ

**質問への回答：**

1. **顧客満足度最大化** → オンボーディング最適化 + 充実したテンプレート + サポート体制

2. **クロスプラットフォーム課金** → **Lemon Squeezy/Gumroad** を中間レイヤーとして使用
   - 両プラットフォームから外部決済ページへ誘導
   - 1つのライセンスキーで両方をアンロック
   - 技術的には統一APIで検証

この方式なら、どこで購入しても同じライセンスキーが発行され、Chrome拡張もNotionテンプレートも両方使えます。
