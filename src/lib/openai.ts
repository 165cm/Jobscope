export const MODEL_NAME = "gpt-4o-mini";

export interface AnalyzeResult {
    properties: {
        company: string;
        title: string;
        site: string;
        source: string;
        employment: string;
        remote: string;
        salary_min: number | null;
        salary_max: number | null;
        category: string;
        location: string;
        side_job: string;
        employees: string;
        avg_age: string;
        age_limit: string;
        station: string;
        skills: string[];
        match: string;
        rating: string;
        commute_time: number;
        autonomy: boolean;
        teamwork: boolean;
        long_commute: boolean;
        overwork: boolean;
        feedback: boolean;
    };
    markdown_content: string;
}

export const DEFAULT_PROMPT = `You are a career assistant "Jobscope".
Analyze the Job Description and extract key information.

IMPORTANT: All values must be PLAIN STRINGS or NUMBERS. Do NOT use nested objects.

Extract these fields:
- company: String. Company name. Abbreviate 株式会社 to ㈱ (e.g., 株式会社ABC → ㈱ABC)
- title: String. Job title (exclude company name)
- source: String. One of: Green, Wantedly, doda, BizReach, LinkedIn, YOUTRUST, Findy, Other
- employment: String. One of: 正社員, 契約社員, 業務委託, other
- remote: String. One of: フルリモート, 週一部リモート, リモート可, なし, 不明
- salary_min: Number or null. Annual salary minimum in 万円 (e.g., 5,000,000円 → 500)
- salary_max: Number or null. Annual salary maximum in 万円
- category: String. One of: エンジニア, PM, デザイナー, 営業, 事務, other
- location: String. Work location (e.g., 東京都港区)
- station: String. Nearest station (e.g., 渋谷駅 徒歩5分)
- employees: String. Employee count (e.g., 100名)
- avg_age: String. Average age (e.g., 30.5歳)
- age_limit: String. Age limit if any
- skills: Array of strings. Technical skills (max 10)
- match: String. One of: excellent, good, fair, poor
- autonomy: Boolean (true/false)
- feedback: Boolean (true/false)
- teamwork: Boolean (true/false)
- long_commute: Boolean (true/false)
- overwork: Boolean (true/false)

Output EXACTLY this JSON format:
{
  "properties": {
    "company": "㈱Example",
    "title": "Webエンジニア",
    "source": "Green",
    "employment": "正社員",
    "remote": "フルリモート",
    "salary_min": 500,
    "salary_max": 800,
    "category": "エンジニア",
    "location": "東京都港区",
    "station": "渋谷駅 徒歩5分",
    "employees": "100名",
    "avg_age": "30歳",
    "age_limit": "",
    "skills": ["JavaScript", "React"],
    "match": "good",
    "autonomy": true,
    "feedback": true,
    "teamwork": true,
    "long_commute": false,
    "overwork": false
  },
  "markdown_content": "# Job Summary..."
}`;


export async function analyzeJobPost(
    text: string,
    url: string,
    apiKey: string,
    userProfile: string = "",
    customPrompt?: string
): Promise<AnalyzeResult> {
    const basePrompt = customPrompt || DEFAULT_PROMPT;

    const prompt = `${basePrompt}

Input Data:
Job URL: ${url}
Job Description:
${text.substring(0, 50000)}

User Profile:
${userProfile || 'No specific user profile provided.'}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL_NAME,
            messages: [
                { role: "system", content: "You are a helpful assistant that outputs JSON." },
                { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to call OpenAI API");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    if (!content) {
        throw new Error("No content from OpenAI");
    }

    const result = JSON.parse(content) as AnalyzeResult;
    return sanitizeAnalyzeResult(result);
}

// Ensure all properties are flat strings/numbers/booleans
function sanitizeAnalyzeResult(result: AnalyzeResult): AnalyzeResult {
    const sanitizedProps: any = {};
    const props: any = result.properties || {};

    for (const [key, value] of Object.entries(props)) {
        sanitizedProps[key] = flattenValue(value);
    }

    return {
        ...result,
        properties: sanitizedProps
    };
}

// Helper to extract primitive value from potential Notion object structure
function flattenValue(value: any): any {
    if (value === null || value === undefined) return null;
    if (typeof value !== 'object') return value;
    if (Array.isArray(value)) {
        // If array of strings, keep it (e.g. skills)
        if (value.length > 0 && typeof value[0] === 'string') return value;
        // If array of objects (multi_select), map to names
        if (value.length > 0 && value[0].name) return value.map((v: any) => v.name);
        return value;
    }

    // Handle common Notion property types
    if (value.rich_text && Array.isArray(value.rich_text)) {
        return value.rich_text.map((t: any) => t.plain_text || t.text?.content || '').join('');
    }
    if (value.title && Array.isArray(value.title)) {
        return value.title.map((t: any) => t.plain_text || t.text?.content || '').join('');
    }
    if (value.select) return value.select.name || '';
    if (value.multi_select) return value.multi_select.map((o: any) => o.name);
    if (value.files) return ''; // ignore files
    if (value.number !== undefined) return value.number;
    if (value.checkbox !== undefined) return value.checkbox;
    if (value.url !== undefined) return value.url;
    if (value.email !== undefined) return value.email;
    if (value.phone_number !== undefined) return value.phone_number;
    if (value.date) return value.date.start || '';

    // If it's just a random object, try specific keys or stringify
    if (value.name) return value.name;
    if (value.content) return value.content;

    return JSON.stringify(value); // Last resort
}
