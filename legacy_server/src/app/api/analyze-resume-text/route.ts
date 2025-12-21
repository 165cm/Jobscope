import { NextRequest, NextResponse } from 'next/server';
import { openai, MODEL_NAME } from '@/lib/openai';

// This API receives TEXT (not PDF file) and analyzes it with AI
export async function POST(req: NextRequest) {
    console.log('[API] Analyze Resume Text Started');

    try {
        const { text } = await req.json();

        if (!text || text.trim().length < 50) {
            return NextResponse.json({ error: 'テキストが不足しています' }, { status: 400 });
        }

        console.log(`[API] Text received, length: ${text.length}`);

        // Analyze with OpenAI - comprehensive extraction with Japanese output
        const prompt = `
あなたは履歴書・職務経歴書のパーサーです。
以下の履歴書テキストから、可能な限り多くの情報を抽出してください。

## 履歴書テキスト:
${text.substring(0, 50000)}

---

## 出力指示:
以下のJSON形式で出力してください。
- **入力が日本語の場合は、必ず日本語で出力してください。**
- 情報が見つからない項目は空文字 "" を設定してください。
- できるだけ多くの情報を抽出してください。

{
  "personalInfo": {
    "name": "氏名",
    "nameKana": "氏名（ふりがな）",
    "email": "メールアドレス",
    "phone": "電話番号",
    "address": "住所",
    "birthDate": "生年月日",
    "age": "年齢",
    "gender": "性別"
  },
  "summary": "職務要約・自己PR（200文字程度）",
  "skills": "保有スキル・資格（カンマ区切り）",
  "experience": "主な経歴・強み（300文字程度）",
  "workHistory": [
    {
      "company": "会社名",
      "position": "役職・ポジション",
      "period": "在籍期間",
      "description": "職務内容の要約"
    }
  ],
  "education": [
    {
      "school": "学校名",
      "degree": "学位・専攻",
      "graduationYear": "卒業年"
    }
  ],
  "certifications": ["資格1", "資格2"],
  "languages": [
    {
      "language": "言語名",
      "level": "レベル"
    }
  ],
  "conditions": "希望条件（年収、勤務地、働き方など）",
  "strengths": "強み・アピールポイント",
  "interests": "興味・関心のある分野",
  "portfolio": "ポートフォリオURL・GitHubなど"
}
`;

        console.log(`[API] Calling OpenAI with model: ${MODEL_NAME}`);
        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                { role: 'system', content: 'あなたは日本語の履歴書解析の専門家です。JSON形式で出力してください。入力テキストと同じ言語（日本語なら日本語、英語なら英語）で出力してください。' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0].message.content;
        console.log('[API] OpenAI Response received:', content ? 'Success' : 'Empty');
        if (!content) throw new Error('AIから応答がありませんでした');

        const result = JSON.parse(content);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[API] Resume text analysis error:', error);
        return NextResponse.json({ error: error.message || '解析に失敗しました' }, { status: 500 });
    }
}
