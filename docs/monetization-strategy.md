# Jobscope 収益化戦略ドキュメント

## 概要

Chrome拡張機能 + Notionテンプレートを$5で販売し、顧客満足度を最大化するための戦略

**販売プラットフォーム: Gumroad**

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

## 2. Gumroadでのクロスプラットフォーム課金統合

### 2.1 課題

```
Chrome Web Store で購入 → 拡張機能のみ？
Notion マーケットプレイス で購入 → テンプレートのみ？

→ どちらで買っても両方使えるようにしたい
```

### 2.2 解決策: Gumroad統一ライセンスキー方式

**アーキテクチャ：**

```
┌─────────────────────────────────────────────────────────┐
│                      Gumroad                            │
│              (ライセンスキー自動発行)                     │
│                                                         │
│  商品: Jobscope Pro ($5)                               │
│  ├─ ライセンスキー自動生成                              │
│  ├─ Notionテンプレートリンク配布                        │
│  └─ セットアップガイドPDF                               │
│                                                         │
│  License API: POST /v2/licenses/verify                  │
└─────────────────────────────────────────────────────────┘
           ▲                           ▲
           │                           │
    ┌──────┴──────┐             ┌──────┴──────┐
    │   Chrome    │             │   Notion    │
    │  Extension  │             │  Template   │
    │   (無料)    │             │   (無料)    │
    │             │             │             │
    │ ライセンス  │             │ 購入リンク  │
    │ キー入力    │             │ 埋め込み    │
    │ → Gumroad   │             │             │
    │   API検証   │             │             │
    └─────────────┘             └─────────────┘
```

### 2.3 Gumroadの利点

| 機能 | 詳細 |
|------|------|
| ライセンスキー自動発行 | 購入時に一意のキーを自動生成 |
| License API | 無料でライセンス検証API提供 |
| 手数料 | 10% + $0.30（他サービスより低め） |
| 日本円対応 | 自動通貨変換 |
| 即座配信 | デジタル商品を購入直後に配布 |
| Webhook | 購入イベントを自動通知 |

### 2.4 Gumroad商品設定

**商品作成時の設定：**

```
商品名: Jobscope Pro - 求人解析ツール
価格: $5 (または ¥750)
種類: デジタル商品

✅ ライセンスキーを生成する (Generate a unique license key)

配布コンテンツ:
├── setup-guide.pdf (セットアップガイド)
├── notion-template-link.txt (テンプレート複製URL)
└── chrome-extension-link.txt (拡張機能インストールURL)

購入後メッセージ:
「ご購入ありがとうございます！
ライセンスキーをChrome拡張機能の設定画面に入力してください。
セットアップ動画: [YouTube URL]」
```

---

## 3. プラットフォーム別の対応

### 3.1 Chrome Web Store

| 制約 | 対応策 |
|------|--------|
| 課金は拡張内課金APIのみ | Gumroadへ外部誘導（許可されている） |
| 30%手数料 | Gumroad経由で回避 |
| 審査に時間がかかる | 先に無料版を公開しておく |

**推奨アプローチ：**
- 拡張機能は**無料で公開**
- 拡張内に「Pro版購入」ボタンを設置
- Gumroad商品ページへリンク

### 3.2 Notion Marketplace (Notion Template Gallery)

| 制約 | 対応策 |
|------|--------|
| 無料テンプレートのみ | 基本版を無料公開し、Pro版はGumroad販売 |
| 直接課金不可 | テンプレート内にGumroad購入リンク埋め込み |
| 外部リンク制限あり | 説明文ではなくテンプレート内ページに記載 |

**推奨アプローチ：**
- 基本テンプレートを無料公開（機能制限）
- テンプレート内に「フル版を購入」ページを含める
- Gumroad購入者には別のフルテンプレートを配布

---

## 4. 推奨する最終戦略

### 4.1 販売チャネル構成

```
┌─────────────────────────────────────────────────────────┐
│                      Gumroad                            │
│               （メイン販売プラットフォーム）               │
│                                                         │
│  商品: Jobscope Pro ($5)                               │
│  含まれるもの:                                          │
│  ├─ Chrome拡張機能（Pro版ライセンスキー）                │
│  ├─ Notionテンプレート（フル版複製リンク）               │
│  ├─ セットアップ動画                                    │
│  └─ 購入者限定Discordアクセス                           │
│                                                         │
│  ライセンスキー: 自動発行・Gumroad API検証              │
└─────────────────────────────────────────────────────────┘
         ▲                              ▲
         │                              │
┌────────┴────────┐           ┌────────┴────────┐
│  Chrome Store   │           │ Notion Template │
│    (無料)       │           │  Gallery (無料) │
│                 │           │                 │
│ 基本機能のみ    │           │ 基本構造のみ    │
│ 「Pro版購入」   │           │ 「Pro版購入」   │
│  → Gumroadへ    │           │  → Gumroadへ    │
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

### Phase 1: MVP

- [ ] Gumroadアカウント作成
- [ ] Gumroad商品ページ作成（$5、ライセンスキー有効化）
- [ ] ライセンス検証コードを拡張機能に追加
- [ ] Notionフルテンプレート作成
- [ ] セットアップガイド作成

### Phase 2: 最適化

- [ ] オンボーディングメール自動化（Gumroad Workflow）
- [ ] 使用状況トラッキング
- [ ] フィードバック収集システム

### Phase 3: 成長

- [ ] 機能追加（ユーザーフィードバック基づき）
- [ ] 他言語対応
- [ ] アフィリエイトプログラム（Gumroad Affiliates）

---

## 6. 技術実装詳細

### 6.1 Gumroad License API

**エンドポイント：**
```
POST https://api.gumroad.com/v2/licenses/verify
```

**パラメータ：**
| パラメータ | 必須 | 説明 |
|-----------|------|------|
| product_id | ✅ | Gumroad商品ID（商品ページURLの末尾） |
| license_key | ✅ | ユーザーが入力したライセンスキー |
| increment_uses_count | ❌ | true: 使用回数をカウント（デバイス制限用） |

**レスポンス例（成功）：**
```json
{
  "success": true,
  "uses": 1,
  "purchase": {
    "seller_id": "xxxxx",
    "product_id": "xxxxx",
    "product_name": "Jobscope Pro",
    "permalink": "jobscope-pro",
    "email": "buyer@example.com",
    "price": 500,
    "currency": "usd",
    "quantity": 1,
    "license_key": "XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX",
    "refunded": false,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**レスポンス例（失敗）：**
```json
{
  "success": false,
  "message": "That license does not exist for the provided product."
}
```

### 6.2 ライセンス検証コード実装

**新規ファイル: `src/lib/license.ts`**

```typescript
// Gumroad License Verification

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
  email?: string;
  activatedAt?: string;
}

// Gumroad商品ID（商品ページURLから取得）
const GUMROAD_PRODUCT_ID = 'YOUR_PRODUCT_ID'; // 例: 'jobscope-pro'

export async function verifyLicense(licenseKey: string): Promise<LicenseStatus> {
  try {
    const response = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: licenseKey,
        increment_uses_count: 'false' // 検証のみ、カウントしない
      })
    });

    const data: GumroadLicenseResponse = await response.json();

    if (data.success && data.purchase && !data.purchase.refunded) {
      return {
        valid: true,
        tier: 'pro',
        email: data.purchase.email,
        activatedAt: data.purchase.created_at
      };
    }

    return { valid: false, tier: 'free' };
  } catch (error) {
    console.error('License verification failed:', error);
    return { valid: false, tier: 'free' };
  }
}

export async function checkStoredLicense(): Promise<LicenseStatus> {
  const { license_key, license_cache } = await chrome.storage.local.get([
    'license_key',
    'license_cache'
  ]);

  if (!license_key) {
    return { valid: false, tier: 'free' };
  }

  // キャッシュが24時間以内なら再検証しない
  if (license_cache) {
    const cacheTime = new Date(license_cache.timestamp).getTime();
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24時間

    if (now - cacheTime < CACHE_DURATION && license_cache.valid) {
      return {
        valid: true,
        tier: 'pro',
        email: license_cache.email
      };
    }
  }

  // Gumroad APIで検証
  const status = await verifyLicense(license_key);

  // キャッシュを更新
  await chrome.storage.local.set({
    license_cache: {
      valid: status.valid,
      email: status.email,
      timestamp: new Date().toISOString()
    }
  });

  return status;
}

export async function activateLicense(licenseKey: string): Promise<LicenseStatus> {
  const status = await verifyLicense(licenseKey);

  if (status.valid) {
    await chrome.storage.local.set({
      license_key: licenseKey,
      license_cache: {
        valid: true,
        email: status.email,
        timestamp: new Date().toISOString()
      }
    });
  }

  return status;
}

export async function deactivateLicense(): Promise<void> {
  await chrome.storage.local.remove(['license_key', 'license_cache']);
}
```

### 6.3 設定画面にライセンス入力を追加

**`src/options.tsx` への追加：**

```tsx
import { useState, useEffect } from 'react';
import { activateLicense, checkStoredLicense, deactivateLicense } from './lib/license';

function LicenseSection() {
  const [licenseKey, setLicenseKey] = useState('');
  const [status, setStatus] = useState<'free' | 'pro' | 'checking'>('checking');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkStoredLicense().then((result) => {
      setStatus(result.tier);
      if (result.email) setEmail(result.email);
    });
  }, []);

  const handleActivate = async () => {
    setError('');
    const result = await activateLicense(licenseKey);

    if (result.valid) {
      setStatus('pro');
      setEmail(result.email || '');
      setLicenseKey('');
    } else {
      setError('無効なライセンスキーです。再度ご確認ください。');
    }
  };

  const handleDeactivate = async () => {
    await deactivateLicense();
    setStatus('free');
    setEmail('');
  };

  if (status === 'checking') {
    return <div>確認中...</div>;
  }

  return (
    <div className="license-section">
      <h3>ライセンス</h3>

      {status === 'pro' ? (
        <div className="pro-status">
          <p>✅ Pro版がアクティブです</p>
          <p className="email">登録メール: {email}</p>
          <button onClick={handleDeactivate}>ライセンスを解除</button>
        </div>
      ) : (
        <div className="free-status">
          <p>現在: 無料版（月5件まで）</p>
          <div className="activate-form">
            <input
              type="text"
              placeholder="ライセンスキーを入力"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
            />
            <button onClick={handleActivate}>アクティベート</button>
          </div>
          {error && <p className="error">{error}</p>}
          <a
            href="https://YOUR_GUMROAD_LINK.gumroad.com/l/jobscope-pro"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pro版を購入する ($5)
          </a>
        </div>
      )}
    </div>
  );
}
```

### 6.4 使用量制限の実装

**`src/App.tsx` への追加：**

```tsx
import { checkStoredLicense } from './lib/license';

const FREE_MONTHLY_LIMIT = 5;

function App() {
  const [isPro, setIsPro] = useState(false);
  const [usageCount, setUsageCount] = useState(0);

  useEffect(() => {
    // ライセンス確認
    checkStoredLicense().then((status) => {
      setIsPro(status.tier === 'pro');
    });

    // 月間使用量を取得
    chrome.storage.local.get(['usage_count', 'usage_month']).then((data) => {
      const currentMonth = new Date().toISOString().slice(0, 7); // "2024-01"

      if (data.usage_month === currentMonth) {
        setUsageCount(data.usage_count || 0);
      } else {
        // 新しい月なのでリセット
        chrome.storage.local.set({ usage_count: 0, usage_month: currentMonth });
        setUsageCount(0);
      }
    });
  }, []);

  const handleAnalyze = async () => {
    // Pro版でなく、制限に達している場合
    if (!isPro && usageCount >= FREE_MONTHLY_LIMIT) {
      alert(`無料版の月間制限（${FREE_MONTHLY_LIMIT}件）に達しました。\nPro版にアップグレードすると無制限でご利用いただけます。`);
      return;
    }

    // 解析実行...
    await performAnalysis();

    // 使用量をインクリメント（Pro版でない場合）
    if (!isPro) {
      const newCount = usageCount + 1;
      setUsageCount(newCount);
      await chrome.storage.local.set({
        usage_count: newCount,
        usage_month: new Date().toISOString().slice(0, 7)
      });
    }
  };

  return (
    <div>
      {!isPro && (
        <div className="usage-indicator">
          残り: {FREE_MONTHLY_LIMIT - usageCount} / {FREE_MONTHLY_LIMIT} 件
        </div>
      )}
      {/* ... */}
    </div>
  );
}
```

---

## 7. Gumroad設定手順

### 7.1 アカウント作成

1. https://gumroad.com にアクセス
2. 「Start selling」からアカウント作成
3. PayPalまたはStripeで支払い受取設定

### 7.2 商品作成

1. Dashboard → 「New product」
2. 設定：
   - Name: `Jobscope Pro - 求人解析ツール`
   - Price: `$5` または `¥750`
   - Type: `Digital product`

3. **重要設定：**
   - ✅ `Generate a license key for each sale`（ライセンスキー自動発行）
   - Content: セットアップガイドPDF、テンプレートリンクを添付

4. 「Publish」で公開

### 7.3 商品IDの確認

商品ページURL: `https://yourname.gumroad.com/l/jobscope-pro`

→ `jobscope-pro` が商品ID（`GUMROAD_PRODUCT_ID`に設定）

---

## まとめ

**質問への回答：**

1. **顧客満足度最大化** → オンボーディング最適化 + 充実したテンプレート + サポート体制

2. **クロスプラットフォーム課金** → **Gumroad** を中間レイヤーとして使用
   - 両プラットフォーム（Chrome Store / Notion Gallery）から Gumroad商品ページへ誘導
   - 1つのライセンスキーで両方（拡張機能Pro + フルテンプレート）をアンロック
   - Gumroad License API で検証（無料、バックエンド不要）

**この方式なら、どこで購入しても同じライセンスキーが発行され、Chrome拡張もNotionテンプレートも両方使えます。**
