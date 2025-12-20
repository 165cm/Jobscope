# Job Search DB - Property Reference

## プロパティ一覧（17項目）

| Property      | 日本語名         | Type         | Options / Description                                                              |
| ------------- | ---------------- | ------------ | ---------------------------------------------------------------------------------- |
| Property      | 日本語名         | Type         | Options / Description                                                              |
| ----------    | ---------        | ------       | ----------------------                                                             |
| **Name**      | 企業名           | **Title**    | 会社名 (Primary Title, Internal ID: title)                                         |
| **Job Title** | 求人タイトル     | **Text**     | 職種・ポジション名 (Internal ID: lpWc等)                                           |
| url           | 求人URL          | URL          | 求人ページのリンク                                                                 |
| source        | 掲載サイト       | Select       | doda / levtech / bizreach / massmedian / green / wantedly / middletenshoku / other |
| status        | ステータス       | Select       | searching / applied / passed / interview / offered / rejected / hold               |
| action_date   | 次回アクション日 | Date         | 面接日・連絡予定日など                                                             |
| location      | 勤務地           | Text         | 最寄り駅・エリア                                                                   |
| commute_min   | 通勤時間         | Number       | 片道◯分                                                                            |
| employment    | 雇用形態         | Select       | fulltime / contract / freelance / other                                            |
| salary_min    | 年収下限         | Number       | 万円                                                                               |
| salary_max    | 年収上限         | Number       | 万円                                                                               |
| age_limit     | 年齢上限         | Number       | 歳（空欄=制限なし）                                                                |
| side_job      | 副業             | Select       | ok / ng / negotiable / unknown                                                     |
| remote        | リモート         | Select       | none / hybrid / mostly_remote / full_remote                                        |
| category      | 職種             | Select       | creative / engineer / marketing / director / other                                 |
| skills        | スキル           | Multi-select | video / youtube / seo / ai / analytics / chinese / english                         |
| match         | マッチ度         | Select       | excellent / good / fair / poor                                                     |
| autonomy      | 裁量権           | Checkbox     | 仕事の進め方を自分で決められる                                                     |
| feedback      | FB有             | Checkbox     | フィードバックがもらえる環境                                                       |
| teamwork      | 良好チーム       | Checkbox     | 協力的な同僚がいそう                                                               |
| long_commute  | ⚠️長通勤          | Checkbox     | 片道1時間超                                                                        |
| overwork      | ⚠️残業多          | Checkbox     | 長時間労働の懸念                                                                   |
| memo          | メモ             | Text         | 一言メモ                                                                           |

---

## Select Options（選択肢）

### source（掲載サイト）
```
doda, levtech, bizreach, massmedian, green, wantedly, middletenshoku, rikunabi, mynavi, other
```

### status（ステータス）
```
searching（検討中）, applied（応募済）, passed（書類通過）, interview（面接予定）, offered（内定）, rejected（不採用）, hold（保留）
```

### employment（雇用形態）
```
fulltime（正社員）, contract（契約社員）, freelance（業務委託）, other（その他）
```

### side_job（副業）
```
ok（可）, ng（不可）, negotiable（要相談）, unknown（不明）
```

### remote（リモート）
```
none（なし）, hybrid（週1-2日）, mostly_remote（週3-4日）, full_remote（フルリモート）
```

### category（職種）
```
creative（クリエイティブ）, engineer（IT・エンジニア）, marketing（マーケティング）, director（ディレクター）, planner（企画）, other（その他）
```

### skills（スキル）※複数選択可
```
video, youtube, seo, ai, analytics, github, chinese, english
```

### match（マッチ度）
```
excellent（◎完全一致）, good（○ほぼ一致）, fair（△一部一致）, poor（×不足あり）
```

---

## API連携用サンプルコード (Updated)

> [!IMPORTANT]
> **「Name」列と「Job Title」列の扱いに注意してください。**
> - **Name**: Notionのタイトル（Title）型。会社名などを入れます。
> - **Job Title**: Notionのテキスト（RichText）型。職種名を入れます。
> - 以前「title」という名前だった列は「Job Title」にリネームする必要があります。

### Google Apps Script でスプレッドシートと連携
```javascript
const NOTION_API_KEY = 'your_api_key';
const DATABASE_ID = 'your_database_id';

function addJobToNotion(job) {
  const url = 'https://api.notion.com/v1/pages';
  const payload = {
    parent: { database_id: DATABASE_ID },
    properties: {
      "Name": { title: [{ text: { content: job.companyName } }] }, // Title型 (会社名)
      "Job Title": { rich_text: [{ text: { content: job.jobTitle } }] }, // Text型 (職種名)
      "url": { url: job.url },
      "source": { select: { name: job.source } },
      "status": { select: { name: 'searching' } },
      "salary_min": { number: job.salary_min },
      "salary_max": { number: job.salary_max },
      "age_limit": { number: job.age_limit || null }
    }
  };
  
  UrlFetchApp.fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload)
  });
}
```

### Python で求人情報を取得
```python
import requests

NOTION_API_KEY = 'your_api_key'
DATABASE_ID = 'your_database_id'

headers = {
    'Authorization': f'Bearer {NOTION_API_KEY}',
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json'
}

# 検討中の求人を取得
def get_searching_jobs():
    url = f'https://api.notion.com/v1/databases/{DATABASE_ID}/query'
    payload = {
        'filter': {
            'property': 'status',
            'select': { 'equals': 'searching' }
        }
    }
    response = requests.post(url, headers=headers, json=payload)
    return response.json()['results']
```

---

## Notionインポート手順

1. Notion → 新規ページ → インポート → CSV
2. `job_search_db.csv` をアップロード
3. プロパティの型を上記の表に従って変更
4. サンプルデータ3件を削除
5. 運用開始！
