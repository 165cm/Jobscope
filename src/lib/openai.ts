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
Process the Job Description and User Profile to extract key information.

Requirements:
1. Extract fields for Notion Properties:
   - company: Company name
   - title: Job title (exclude company name)
   - source: Deduce from URL (Green, Wantedly, doda, etc.)
   - employment: 正社員/契約社員/業務委託/other
   - remote: フルリモート/週一部リモート/リモート可/なし/不明
   - salary_min, salary_max: In 万円 (null if unknown)
   - category: エンジニア/PM/デザイナー/営業/事務/other
   - location: Main work location
   - station: Nearest station
   - skills: Array of relevant skills
   - match: excellent/good/fair/poor (based on profile match)
   - Boolean flags: autonomy, feedback, teamwork, long_commute, overwork

2. Generate markdown_content summarizing the job.

Output JSON format:
{
  "properties": { ... },
  "markdown_content": "..."
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

    return JSON.parse(content) as AnalyzeResult;
}
