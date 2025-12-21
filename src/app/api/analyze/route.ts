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
   - Company Name (企業名) - Key: "company". Extract company name.
   - Job Title (職種名) - **IMPORTANT**: Exclude company name. Extract ONLY the role/position (e.g., "Web側エンジニア", "営業マネージャー").
   - Site Name (掲載サイト) - Guess from URL or content.
   - Source (媒体) - Key: "source". **Deduce from URL or content**. Rules:
     - URL matches "green-japan.com" -> "Green"
     - URL matches "wantedly.com" -> "Wantedly"
     - URL matches "doda.jp" -> "doda"
     - URL matches "bizreach.jp" -> "BizReach"
     - URL matches "linkedin.com" -> "LinkedIn"
     - URL matches "youtex.org" -> "YOUTRUST"
     - URL matches "findy-code.io" -> "Findy"
     - If no URL, infer from text (e.g., "Greenで掲載中").
     - Default to "Other" or "Direct" if unknown.
   - Employment (雇用形態) - Key: "employment". e.g., 正社員, 契約社員, 業務委託.
   - Remote Work (リモートワーク) - Key: "remote". **MUST be one of the following**:
     - "フルリモート"
     - "週一部リモート"
     - "リモート可"
     - "なし"
     - "不明"
   - Annual Salary (Min/Max) (想定年収) - **IMPORTANT**: Unit is "Ten Thousand Yen (万円)". (e.g., 5,000,000 -> 500). If unknown, use null.
   - Job Category (職種カテゴリ) - Key: "category". e.g., エンジニア, PM, デザイナー, 営業, 事務.
   - Location (勤務地) - Key: "location". Extract main location (e.g., 東京都港区).
   - Side Job (副業) - Key: "side_job". e.g., 可, 不可, 要相談.
   - Employees (従業員数) - Key: "employees". Look for keywords like "従業員数". Return string (e.g., "100名", "約500人").
   - Avg Age (平均年齢) - Key: "avg_age". Look for keywords like "平均年齢". Return string (e.g., "30.5歳", "20代後半").
   - Age Limit (年齢制限) - Key: "age_limit". Look for keywords like "◯歳以下", "年齢制限". Return string (e.g., "35歳以下", "長期キャリア形成のため").
   - Station (最寄り駅) - Key: "station". Look for keywords like "最寄り駅", "アクセス". Return string (e.g., "渋谷駅 徒歩5分").
   - Required Skills (活かせるスキル) - List relevant skills found in JD that match user or are general.
   - Match (スキルマッチ度) - Key: "match". (◎完全一致, ○ほぼ一致, △一部一致, ×不足あり).
   - Comprehensive Rating (総合評価) - Subjective rating 1-5 stars based on quality.
   - Commute Time (通勤時間) - Leave 0 if unknown.
   - Flags (boolean true/false):
     - Autonomy (裁量権あり) - Key: "autonomy"
     - Teamwork (協力的な同僚) - Key: "teamwork"
     - Long Commute (通勤1時間超) - Key: "long_commute"
     - Overwork (長時間労働/ブラック) - Key: "overwork"
     - Feedback (FB文化あり) - Key: "feedback"

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
    "company": "...",
    "title": "...",
    "site": "...",
    "source": "...",
    "employment": "...",
    "remote": "...",
    "salary_min": 123,
    "salary_max": 456,
    "category": "...",
    "location": "...",
    "side_job": "...",
    "employees": "...",
    "avg_age": "...",
    "age_limit": "...",
    "station": "...",
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
