import { NextRequest, NextResponse } from 'next/server';
import { openai, MODEL_NAME } from '@/lib/openai';
import { z } from 'zod';

const AnalyzeSchema = z.object({
    jobDescription: z.string(),
    userProfile: z.string().optional(),
    url: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { jobDescription, userProfile, url } = AnalyzeSchema.parse(body);

        const prompt = `
You are a career assistant "Jobscope".
Process the following Job Description and User Profile (if provided).
Extract key information to save into a Notion Database.
Also generate a structured Markdown report for the page content.

Input Data:
Job URL: ${url}
Job Description:
${jobDescription.substring(0, 50000)}

User Profile:
${userProfile || 'No specific user profile provided.'}

---
Requirements:
32: 1. Extract the following fields for Notion Properties:
33:    - Company Name (企業名) - Key: "company". Extract company name.
34:    - Job Title (職種名) - **IMPORTANT**: Exclude company name. Extract ONLY the role/position (e.g., "Web側エンジニア", "営業マネージャー").
35:    - Site Name (掲載サイト) - Guess from URL or content.
36:    - Employment (雇用形態) - Key: "employment". e.g., 正社員, 契約社員, 業務委託.
37:    - Remote Work (リモートワーク) - Key: "remote". e.g., フルリモート, 週3-4日, なし.
38:    - Annual Salary (Min/Max) (想定年収) - **IMPORTANT**: Unit is "Ten Thousand Yen (万円)". (e.g., 5,000,000 -> 500). If unknown, use null.
39:    - Job Category (職種カテゴリ) - Key: "category". e.g., エンジニア, PM, デザイナー, 営業, 事務.
40:    - Location (勤務地) - Key: "location". Extract main location (e.g., 東京都港区).
41:    - Side Job (副業) - Key: "side_job". e.g., 可, 不可, 要相談.
42:    - Required Skills (活かせるスキル) - List relevant skills found in JD that match user or are general.
43:    - Match (スキルマッチ度) - Key: "match". (◎完全一致, ○ほぼ一致, △一部一致, ×不足あり).
44:    - Comprehensive Rating (総合評価) - Subjective rating 1-5 stars based on quality.
45:    - Commute Time (通勤時間) - Leave 0 if unknown.
46:    - Flags (boolean true/false):
47:      - Autonomy (裁量権あり) - Key: "autonomy"
48:      - Teamwork (協力的な同僚) - Key: "teamwork"
49:      - Long Commute (通勤1時間超) - Key: "long_commute"
50:      - Overwork (長時間労働/ブラック) - Key: "overwork"
51:      - Feedback (FB文化あり) - Key: "feedback"
52: 
53: 2. Generate Markdown Content based on this template structure:
54:    # 【Company Name】Job Title
55:    ## 📋 Job Overview
56:    (Summary table, Job details, Role)
57:    ## 🏢 Company Info
58:    (Establishment, Employees, Capital, Business, Mission, News)
59:    ## 💰 Benefits & Salary
60:    (Salary details, Allowances, Welfare, Holidays)
61:    ## 📊 Selection Process
62:    (Steps, Interview info)
63:    ## 🔍 Research
64:    (Competitors, Growth notes)
65:    ## ✅ Motivation & Skills
66:    (Why this company? How skills match? - Generate based on User Profile + JD)
67:    ## 📝 Interview Prep
68:    (Predicted Questions & Answers)
69:
70: Output must be JSON format:
71: {
72:   "properties": {
73:     "company": "...",
74:     "title": "...",
    "site": "...",
    "employment": "...",
    "remote": "...",
    "salary_min": 123,
    "salary_max": 456,
    "category": "...",
    "location": "...",
    "side_job": "...",
    "skills": ["..."],
    "match": "...",
    "rating": "⭐⭐⭐",
    "commute_time": 0,
    "autonomy": boolean,
    "teamwork": boolean,
    "long_commute": boolean,
    "overwork": boolean,
    "feedback": boolean
  },
  "markdown_content": "..."
}
`;

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error('No content from OpenAI');
        }

        const result = JSON.parse(content);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Analyze error:', error);
        return NextResponse.json({ error: error.message || 'Analysis failed' }, { status: 500 });
    }
}
