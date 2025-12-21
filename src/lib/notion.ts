import type { AnalyzeResult } from './openai';

export interface NotionResponse {
    url: string;
    id: string;
}

// Map AnalyzeResult properties to Notion API payload
function mapProperties(data: AnalyzeResult, jobUrl: string) {
    return {
        "Name": { title: [{ text: { content: data.properties.company || "Unknown Company" } }] },
        "Job Title": { rich_text: [{ text: { content: data.properties.title || "Unknown Title" } }] },
        "url": { url: jobUrl || null },

        "source": { select: { name: data.properties.source || "Other" } },
        "status": { select: { name: "searching" } },
        "employment": { select: { name: data.properties.employment || "other" } },
        "remote": { select: { name: data.properties.remote || "不明" } },
        "category": { select: { name: data.properties.category || "other" } },
        "match": { select: { name: data.properties.match || "poor" } },

        "salary_min": { number: data.properties.salary_min || null },
        "salary_max": { number: data.properties.salary_max || null },

        "location": { rich_text: [{ text: { content: data.properties.location || "" } }] },
        "Station": { rich_text: [{ text: { content: data.properties.station || "" } }] },
        "Employees": { rich_text: [{ text: { content: data.properties.employees || "" } }] },
        "Avg Age": { rich_text: [{ text: { content: data.properties.avg_age || "" } }] },
        "age_limit": { rich_text: [{ text: { content: data.properties.age_limit || "" } }] },

        // Checkboxes
        "autonomy": { checkbox: data.properties.autonomy || false },
        "feedback": { checkbox: data.properties.feedback || false },
        "teamwork": { checkbox: data.properties.teamwork || false },
        "long_commute": { checkbox: data.properties.long_commute || false },
        "overwork": { checkbox: data.properties.overwork || false },

        // Multi-select for skills
        "skills": {
            multi_select: (data.properties.skills || []).map(skill => ({ name: skill.replace(/,/g, '') })).slice(0, 10)
        },
    };
}

export async function saveJobToNotion(
    data: AnalyzeResult,
    apiKey: string,
    databaseId: string,
    jobUrl: string
): Promise<NotionResponse> {
    const url = 'https://api.notion.com/v1/pages';
    const properties = mapProperties(data, jobUrl);

    const payload = {
        parent: { database_id: databaseId },
        properties: properties,
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Notion API Error: ${errorBody.message || response.statusText}`);
    }

    const result = await response.json();
    return { url: result.url, id: result.id };
}

export async function updateJobInNotion(
    pageId: string,
    data: AnalyzeResult,
    apiKey: string,
    jobUrl: string
): Promise<NotionResponse> {
    const url = `https://api.notion.com/v1/pages/${pageId}`;
    const properties = mapProperties(data, jobUrl);

    const payload = {
        properties: properties,
    };

    const response = await fetch(url, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(`Notion API Error: ${errorBody.message || response.statusText}`);
    }

    const result = await response.json();
    return { url: result.url, id: result.id };
}
