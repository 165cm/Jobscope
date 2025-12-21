# Jobscope 収益化戦略ドキュメント

## 概要

Chrome拡張機能 + Notionテンプレートを$5で販売し、顧客満足度を最大化するための戦略

**販売プラットフォーム: Notion Marketplace（メイン）+ Gumroad（補助）**

---

## 0. プラットフォーム利用規約の確認

### Chrome Web Store

| 項目 | 状況 |
|------|------|
| ネイティブ課金 | ❌ 2021年に廃止済み |
| 外部決済への誘導 | ✅ 許可（現在の標準） |
| 参考 | [Chrome Web Store payments deprecation](https://developer.chrome.com/docs/webstore/cws-payments-deprecation) |

### Notion Marketplace

| 項目 | 状況 |
|------|------|
| ネイティブ課金 | ✅ 2024年から対応（Stripe経由） |
| 外部決済への誘導 | ✅ 対象国外のみ許可 |
| 参考 | [Selling on Marketplace](https://www.notion.com/help/selling-on-marketplace) |

**結論：Notion Marketplaceでの正規販売が最適解**

---

## 1. 推奨スキーム：Notion Marketplace 中心戦略

### 1.1 なぜNotion中心か

| メリット | 詳細 |
|----------|------|
| 検索露出 | 有料テンプレートとしてMarketplaceで検索される |
| 信頼性 | Notion公式ストアからの購入で安心感 |
| シームレス体験 | Notionユーザーは外部サイトに飛ばず購入完了 |
| プラットフォームとWin-Win | 手数料を払うことで露出優遇の可能性 |
| ネイティブ分析 | 販売データをNotion管理画面で確認可能 |

### 1.2 販売チャネル構成

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ┌─────────────────────────┐    ┌─────────────────────────┐   │
│   │   Notion Marketplace    │    │       Gumroad           │   │
│   │      （メイン）          │    │      （補助）           │   │
│   │                         │    │                         │   │
│   │  $5 有料テンプレート    │    │  $5 バンドル            │   │
│   │  ├─ フルNotionテンプレ  │    │  ├─ Notionテンプレート  │   │
│   │  ├─ Chrome拡張リンク    │    │  ├─ Chrome拡張Pro       │   │
│   │  └─ セットアップガイド  │    │  └─ ライセンスキー      │   │
│   │                         │    │                         │   │
│   │  Notion手数料: あり     │    │  Gumroad手数料: 10%     │   │
│   │  露出: 高               │    │  露出: 低（自力集客）   │   │
│   └─────────────────────────┘    └─────────────────────────┘   │
│              │                              │                   │
│              ▼                              ▼                   │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                  Chrome Web Store                       │   │
│   │                    （無料公開）                          │   │
│   │                                                         │   │
│   │  基本機能: 無料・無制限                                  │   │
│   │  Pro機能: ライセンスキーでアンロック（Gumroad購入者向け）│   │
│   │                                                         │   │
│   │  ※ Notion購入者は拡張機能を制限なしで利用可能           │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 購入経路別の体験

#### 経路A: Notion Marketplace から購入（推奨・メイン）

```
1. ユーザーがNotion Marketplaceで「Jobscope」を発見
2. $5 で有料テンプレートを購入（Notion決済）
3. テンプレートが自動で複製される
4. テンプレート内の「セットアップ」ページを確認
5. Chrome拡張をインストール（無料版だが制限なし）
6. Notion購入者は特別なアクティベーション不要
   → 購入メールアドレスで自動認証
```

#### 経路B: Gumroad から購入（補助）

```
1. ユーザーがGumroad/自社サイトで発見
2. $5 でバンドルを購入
3. ライセンスキー + テンプレートリンクを受け取る
4. Chrome拡張をインストール
5. ライセンスキーを入力してPro機能アンロック
6. Notionテンプレートを複製
```

#### 経路C: Chrome拡張から発見（無料ユーザー）

```
1. Chrome Web Storeで拡張機能を発見
2. 無料でインストール・基本機能を利用
3. 気に入ったら「Pro版を購入」ボタンから
   → Notion Marketplace または Gumroad へ誘導
```

---

## 2. 顧客満足度を最大化する戦略

### 2.1 価値提案の明確化

**$5で得られる価値を明確に：**

| 提供物 | 具体的価値 |
|--------|-----------|
| Chrome拡張機能 | ワンクリック求人解析、30+項目の自動抽出 |
| Notionテンプレート | 最適化済みDB構造、5種類のビュー設定済み |
| セットアップガイド | 5分で完了する動画付きガイド |
| アップデート | 永続的な無料アップデート |

### 2.2 オンボーディング体験の最適化

```
購入 → 即座にアクセス → 5分で稼働
```

**具体的施策：**

1. **購入直後の自動配信**
   - Notionテンプレート自動複製（Marketplace購入時）
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

### 2.3 Notionテンプレートの付加価値

**$5に含まれる内容：**

```
📊 Job Tracker Database
├── 🔍 ビュー: 全求人一覧（テーブル）
├── 📋 ビュー: カンバン（ステータス別）
├── 📅 ビュー: カレンダー（面接日程）
├── ⭐ ビュー: マッチ度別フィルター
├── 📈 ビュー: 給与レンジ比較
├── 🏷️ プリセット: スキルタグ（日本のIT職向け）
├── 📖 セットアップガイドページ
├── 🔗 Chrome拡張インストールリンク
└── ❓ FAQ・トラブルシューティング
```

**差別化ポイント：**
- 日本の求人サイトに最適化されたプロパティ
- 万円単位の給与管理
- 日本語UIとカテゴリ名
- 面接準備セクション付き

### 2.4 サポート体制

| サポートレベル | 内容 |
|---------------|------|
| セルフサービス | FAQ、動画ガイド、トラブルシューティング |
| コミュニティ | Discord/Slack チャンネル（購入者限定） |
| 直接サポート | メール対応（24-48時間以内） |

---

## 3. 技術実装：購入元による認証分岐

### 3.1 認証フローの設計

```
┌─────────────────────────────────────────────────────────┐
│                Chrome拡張機能 起動時                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  ローカルキャッシュ確認 │
              └───────────────────────┘
                          │
           ┌──────────────┼──────────────┐
           │              │              │
           ▼              ▼              ▼
    ┌────────────┐ ┌────────────┐ ┌────────────┐
    │ Notion購入 │ │ Gumroad購入│ │  未購入    │
    │ メール認証 │ │ ライセンス │ │  無料版    │
    └────────────┘ └────────────┘ └────────────┘
           │              │              │
           ▼              ▼              ▼
    ┌────────────┐ ┌────────────┐ ┌────────────┐
    │ フル機能   │ │ フル機能   │ │ 基本機能   │
    │ アンロック │ │ アンロック │ │ のみ       │
    └────────────┘ └────────────┘ └────────────┘
```

### 3.2 Notion購入者の認証

**方法1: メールアドレス認証（シンプル）**

Notion APIでは購入者情報を直接取得できないため、
購入者にメールアドレスを入力してもらい、自前のバックエンドで照合する。

```typescript
// src/lib/notion-auth.ts

interface NotionPurchaseVerification {
  valid: boolean;
  email?: string;
  purchaseDate?: string;
}

// Notion購入者リストを管理するバックエンド API
const VERIFICATION_API = 'https://your-api.com/api/verify-notion-purchase';

export async function verifyNotionPurchase(email: string): Promise<NotionPurchaseVerification> {
  try {
    const response = await fetch(VERIFICATION_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Notion purchase verification failed:', error);
    return { valid: false };
  }
}
```

**方法2: Notion Webhook + 自動登録（推奨）**

Notion Marketplaceの販売Webhookを受け取り、購入者を自動登録。

```
Notion購入 → Webhook → バックエンド → 購入者DB登録
                                          ↓
Chrome拡張 → メール入力 → バックエンド照合 → 認証完了
```

### 3.3 Gumroad購入者の認証

```typescript
// src/lib/license.ts

interface GumroadLicenseResponse {
  success: boolean;
  uses?: number;
  message?: string;
  purchase?: {
    seller_id: string;
    product_id: string;
    product_name: string;
    email: string;
    license_key: string;
    refunded: boolean;
    created_at: string;
  };
}

interface LicenseStatus {
  valid: boolean;
  tier: 'free' | 'pro';
  source?: 'notion' | 'gumroad';
  email?: string;
}

const GUMROAD_PRODUCT_ID = 'YOUR_PRODUCT_ID';

export async function verifyGumroadLicense(licenseKey: string): Promise<LicenseStatus> {
  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: licenseKey,
        increment_uses_count: 'false'
      })
    });

    const data: GumroadLicenseResponse = await response.json();

    if (data.success && data.purchase && !data.purchase.refunded) {
      return {
        valid: true,
        tier: 'pro',
        source: 'gumroad',
        email: data.purchase.email
      };
    }

    return { valid: false, tier: 'free' };
  } catch (error) {
    console.error('Gumroad license verification failed:', error);
    return { valid: false, tier: 'free' };
  }
}
```

### 3.4 統合認証チェック

```typescript
// src/lib/auth.ts

import { verifyNotionPurchase } from './notion-auth';
import { verifyGumroadLicense } from './license';

interface AuthStatus {
  isPro: boolean;
  source: 'notion' | 'gumroad' | 'free';
  email?: string;
}

export async function checkAuthStatus(): Promise<AuthStatus> {
  const storage = await chrome.storage.local.get([
    'auth_type',
    'auth_email',
    'license_key',
    'auth_cache'
  ]);

  // キャッシュが有効なら使用（24時間）
  if (storage.auth_cache) {
    const cacheTime = new Date(storage.auth_cache.timestamp).getTime();
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000;

    if (now - cacheTime < CACHE_DURATION && storage.auth_cache.isPro) {
      return {
        isPro: true,
        source: storage.auth_cache.source,
        email: storage.auth_cache.email
      };
    }
  }

  // Notion認証を確認
  if (storage.auth_type === 'notion' && storage.auth_email) {
    const notionResult = await verifyNotionPurchase(storage.auth_email);
    if (notionResult.valid) {
      await updateCache({ isPro: true, source: 'notion', email: storage.auth_email });
      return { isPro: true, source: 'notion', email: storage.auth_email };
    }
  }

  // Gumroadライセンスを確認
  if (storage.license_key) {
    const gumroadResult = await verifyGumroadLicense(storage.license_key);
    if (gumroadResult.valid) {
      await updateCache({ isPro: true, source: 'gumroad', email: gumroadResult.email });
      return { isPro: true, source: 'gumroad', email: gumroadResult.email };
    }
  }

  return { isPro: false, source: 'free' };
}

async function updateCache(status: AuthStatus): Promise<void> {
  await chrome.storage.local.set({
    auth_cache: {
      ...status,
      timestamp: new Date().toISOString()
    }
  });
}
```

### 3.5 設定画面UI

```tsx
// src/components/LicenseSection.tsx

import { useState, useEffect } from 'react';
import { checkAuthStatus } from '../lib/auth';
import { verifyNotionPurchase } from '../lib/notion-auth';
import { verifyGumroadLicense } from '../lib/license';

export function LicenseSection() {
  const [authStatus, setAuthStatus] = useState<'checking' | 'free' | 'pro'>('checking');
  const [source, setSource] = useState<'notion' | 'gumroad' | 'free'>('free');
  const [email, setEmail] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [inputMode, setInputMode] = useState<'notion' | 'gumroad'>('notion');
  const [error, setError] = useState('');

  useEffect(() => {
    checkAuthStatus().then((status) => {
      setAuthStatus(status.isPro ? 'pro' : 'free');
      setSource(status.source);
      if (status.email) setEmail(status.email);
    });
  }, []);

  const handleNotionAuth = async () => {
    setError('');
    const result = await verifyNotionPurchase(email);
    if (result.valid) {
      await chrome.storage.local.set({ auth_type: 'notion', auth_email: email });
      setAuthStatus('pro');
      setSource('notion');
    } else {
      setError('この購入メールアドレスが見つかりません。Notion Marketplaceでの購入時のメールアドレスをご確認ください。');
    }
  };

  const handleGumroadAuth = async () => {
    setError('');
    const result = await verifyGumroadLicense(licenseKey);
    if (result.valid) {
      await chrome.storage.local.set({ license_key: licenseKey });
      setAuthStatus('pro');
      setSource('gumroad');
    } else {
      setError('無効なライセンスキーです。');
    }
  };

  if (authStatus === 'checking') {
    return <div className="p-4">確認中...</div>;
  }

  if (authStatus === 'pro') {
    return (
      <div className="p-4 bg-green-50 rounded-lg">
        <h3 className="font-bold text-green-800">✅ Pro版がアクティブです</h3>
        <p className="text-sm text-green-600 mt-1">
          購入元: {source === 'notion' ? 'Notion Marketplace' : 'Gumroad'}
        </p>
        <p className="text-sm text-green-600">登録メール: {email}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <h3 className="font-bold">ライセンス認証</h3>

      <div className="flex gap-2">
        <button
          onClick={() => setInputMode('notion')}
          className={`px-3 py-1 rounded ${inputMode === 'notion' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Notion購入者
        </button>
        <button
          onClick={() => setInputMode('gumroad')}
          className={`px-3 py-1 rounded ${inputMode === 'gumroad' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Gumroad購入者
        </button>
      </div>

      {inputMode === 'notion' ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Notion Marketplaceで購入した際のメールアドレスを入力してください
          </p>
          <input
            type="email"
            placeholder="購入時のメールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleNotionAuth}
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            認証する
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Gumroadで購入した際のライセンスキーを入力してください
          </p>
          <input
            type="text"
            placeholder="XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            className="w-full p-2 border rounded font-mono"
          />
          <button
            onClick={handleGumroadAuth}
            className="w-full bg-pink-500 text-white py-2 rounded"
          >
            認証する
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="border-t pt-4 mt-4">
        <p className="text-sm text-gray-500">まだ購入していませんか？</p>
        <div className="flex gap-2 mt-2">
          <a
            href="https://www.notion.com/templates/YOUR_TEMPLATE_ID"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 text-sm underline"
          >
            Notion Marketplaceで購入
          </a>
          <a
            href="https://YOUR_NAME.gumroad.com/l/jobscope-pro"
            target="_blank"
            rel="noopener noreferrer"
            className="text-pink-500 text-sm underline"
          >
            Gumroadで購入
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

## 4. バックエンド実装（購入者管理）

### 4.1 必要なインフラ

Notion購入者を認証するために、シンプルなバックエンドが必要：

| オプション | コスト | 難易度 |
|-----------|--------|--------|
| Cloudflare Workers + D1 | 無料枠あり | 低 |
| Vercel Functions + Supabase | 無料枠あり | 低 |
| Firebase Functions + Firestore | 無料枠あり | 低 |

### 4.2 Cloudflare Workers 実装例

```typescript
// workers/src/index.ts

interface Env {
  DB: D1Database;
}

interface PurchaseRecord {
  email: string;
  source: 'notion' | 'gumroad';
  purchase_date: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // 購入検証 API
    if (url.pathname === '/api/verify-notion-purchase' && request.method === 'POST') {
      const { email } = await request.json();

      const result = await env.DB.prepare(
        'SELECT * FROM purchases WHERE email = ? AND source = ?'
      ).bind(email.toLowerCase(), 'notion').first();

      return new Response(JSON.stringify({
        valid: !!result,
        email: result?.email,
        purchaseDate: result?.purchase_date
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Notion Webhook 受信（購入時に自動登録）
    if (url.pathname === '/api/webhook/notion' && request.method === 'POST') {
      const payload = await request.json();

      // Notion Marketplace Webhookのペイロードから購入者情報を抽出
      const email = payload.buyer_email;
      const purchaseDate = new Date().toISOString();

      await env.DB.prepare(
        'INSERT OR REPLACE INTO purchases (email, source, purchase_date) VALUES (?, ?, ?)'
      ).bind(email.toLowerCase(), 'notion', purchaseDate).run();

      return new Response(JSON.stringify({ success: true }));
    }

    return new Response('Not Found', { status: 404 });
  },
};
```

### 4.3 D1データベーススキーマ

```sql
-- schema.sql
CREATE TABLE IF NOT EXISTS purchases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL CHECK (source IN ('notion', 'gumroad')),
  purchase_date TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON purchases(email);
```

---

## 5. 料金体系と手数料比較

### 5.1 各プラットフォームの手数料

| プラットフォーム | 手数料 | $5販売時の手取り |
|-----------------|--------|-----------------|
| Notion Marketplace | 不明（要確認） | 要確認 |
| Gumroad | 10% + $0.30 | $4.20 |
| Stripe直接 | 3.6% + ¥40 | 約$4.60 |

### 5.2 推奨価格設定

| チャネル | 販売価格 | 内容 |
|----------|----------|------|
| Notion Marketplace | $5 (¥750) | テンプレート + 拡張機能アクセス |
| Gumroad | $5 (¥750) | テンプレート + 拡張機能 + ライセンスキー |

---

## 6. 機能分割（Free vs Pro）

| 機能 | 無料版 | Pro版 |
|------|--------|-------|
| 基本解析 | ✅ 月5件まで | ✅ 無制限 |
| Notion保存 | ✅ 基本項目のみ | ✅ 全30+項目 |
| テンプレート | ❌ 別途必要 | ✅ フル版付属 |
| スキルマッチ | ❌ | ✅ |
| 面接準備 | ❌ | ✅ |
| サポート | コミュニティ | 優先メール |

---

## 7. 実装優先順位

### Phase 1: MVP

- [ ] Notion Marketplaceで有料テンプレート申請・公開
- [ ] Gumroad商品ページ作成
- [ ] バックエンド構築（Cloudflare Workers）
- [ ] Chrome拡張に認証UI追加
- [ ] セットアップガイド作成

### Phase 2: 最適化

- [ ] Notion Webhook連携（購入者自動登録）
- [ ] オンボーディングメール自動化
- [ ] 使用状況トラッキング
- [ ] フィードバック収集システム

### Phase 3: 成長

- [ ] 機能追加（ユーザーフィードバック基づき）
- [ ] 他言語対応
- [ ] アフィリエイトプログラム

---

## 8. 顧客満足度KPI

| 指標 | 目標 |
|------|------|
| オンボーディング完了率 | 90%以上 |
| 最初の解析までの時間 | 10分以内 |
| 7日後アクティブ率 | 70%以上 |
| 返金率 | 5%以下 |
| NPS | 50以上 |

---

## まとめ

### 戦略の要点

1. **Notion Marketplace を メイン販売チャネルに**
   - 正規の課金でプラットフォームの露出を最大化
   - Notionユーザーにシームレスな購入体験を提供
   - 利用規約に完全準拠

2. **Gumroad を補助チャネルとして維持**
   - Notion以外からの流入に対応
   - ライセンスキー方式で柔軟な認証
   - 自社サイト・SNSからの誘導先

3. **Chrome拡張は無料公開**
   - 基本機能は制限付きで無料提供
   - 購入者は購入元に応じた認証でフル機能アンロック

4. **両方で購入しても同じ体験**
   - どちらで購入しても Chrome拡張 + Notionテンプレート の両方が使える
   - プラットフォームの取り分も確保しつつWin-Win

---

## 参考リンク

- [Chrome Web Store payments deprecation](https://developer.chrome.com/docs/webstore/cws-payments-deprecation)
- [Chrome Web Store - Accepting Payment](https://developer.chrome.com/docs/webstore/program-policies/accepting-payment)
- [Notion Marketplace guidelines & terms](https://www.notion.com/help/template-gallery-guidelines-and-terms)
- [Selling on Notion Marketplace](https://www.notion.com/help/selling-on-marketplace)
- [Gumroad License API](https://app.gumroad.com/api#license-verification)
