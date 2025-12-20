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
1. Extract the following fields for Notion Properties:
   - Company Name (企業名)
   - Site Name (掲載サイト) - Guess from URL or content (e.g., Green, Wantedly, Indeed, Corporate Site)
   - Employment Type (雇用形態) - e.g., 正社員, 契約社員, 業務委託
   - Remote Work (リモートワーク) - e.g., フルリモート, 週3-4日, なし
   - Estimated Annual Salary (Min/Max) (想定年収)
   - Job Category (職種カテゴリ) - e.g., エンジニア, PM, デザイナー
   - Required Skills (活かせるスキル) - List relevant skills found in JD that match user or are general.
   - Skill Match (スキルマッチ度) - Assess match (◎完全一致, ○ほぼ一致, △一部一致, ×不足あり)
   - Comprehensive Rating (総合評価) - Subjective rating 1-5 stars based on quality.
   - Commute Time (通勤時間) - Leave 0 if unknown.
   - Flags (boolean true/false):
     - 裁量権あり (Discretion)
     - 協力的な同僚 (Cooperative colleagues)
     - 通勤1時間超 (Commute > 1h)
     - 長時間労働 (Long hours)
     - 給与不公平感 (Salary unfairness)
     - 雇用不安定 (Unstable employment)

2. Generate Markdown Content based on this template structure:
   # 【Company Name】Job Title
   ## 📋 Job Overview
   (Summary table, Job details, Role)
   ## 🏢 Company Info
   (Establishment, Employees, Capital, Business, Mission, News)
   ## 💰 Benefits & Salary
   (Salary details, Allowances, Welfare, Holidays)
   ## 📊 Selection Process
   (Steps, Interview info)
   ## 🔍 Research
   (Competitors, Growth notes)
   ## ✅ Motivation & Skills
   (Why this company? How skills match? - Generate based on User Profile + JD)
   ## 📝 Interview Prep
   (Predicted Questions & Answers)

Output must be JSON format:
{
  "properties": {
    "title": "...",
    "site": "...",
    "employment_type": "...",
    "remote": "...",
    "salary_min": 123 (number or null),
    "salary_max": 456 (number or null),
    "category": "...",
    "skills": ["..."],
    "skill_match": "...",
    "rating": "⭐⭐⭐",
    "commute_time": 0,
    "flags": {
       "discretion": boolean,
       "cooperative": boolean,
       "long_commute": boolean,
       "overwork": boolean,
       "unfair_salary": boolean,
       "unstable": boolean
    }
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
