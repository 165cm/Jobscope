import type { AnalyzeResult } from './openai';

export interface NotionResponse {
    url: string;
    id: string;
}

// Helper to ensure value is a string for Notion API
function ensureString(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) {
        // Join array elements into a single string
        return value.map(v => ensureString(v)).join(', ');
    }
    if (typeof value === 'object') {
        // Try common string-like properties
        if (value.name) return value.name;
        if (value.content) return value.content;
        if (value.text) return ensureString(value.text);
        if (value.title) return ensureString(value.title);
        return JSON.stringify(value);
    }
    return String(value);
}

// Map AnalyzeResult properties to Notion API payload
function mapProperties(data: AnalyzeResult, jobUrl: string) {
    const p = data.properties;
    return {
        "Name": { title: [{ text: { content: ensureString(p.company) || "Unknown Company" } }] },
        "Job Title": { rich_text: [{ text: { content: ensureString(p.title) || "Unknown Title" } }] },
        "url": { url: jobUrl || null },

        "source": { select: { name: ensureString(p.source) || "Other" } },
        "status": { select: { name: "searching" } },
        "employment": { select: { name: ensureString(p.employment) || "other" } },
        "remote": { select: { name: ensureString(p.remote) || "不明" } },
        "category": { select: { name: ensureString(p.category) || "other" } },
        "match": { select: { name: ensureString(p.match) || "poor" } },

        "salary_min": { number: p.salary_min || null },
        "salary_max": { number: p.salary_max || null },

        "location": { rich_text: [{ text: { content: ensureString(p.location) } }] },
        "Station": { rich_text: [{ text: { content: ensureString(p.station) } }] },
        "Employees": { rich_text: [{ text: { content: ensureString(p.employees) } }] },
        "Avg Age": { rich_text: [{ text: { content: ensureString(p.avg_age) } }] },
        "age_limit": { rich_text: [{ text: { content: ensureString(p.age_limit) } }] },

        // Checkboxes
        "autonomy": { checkbox: p.autonomy || false },
        "feedback": { checkbox: p.feedback || false },
        "teamwork": { checkbox: p.teamwork || false },
        "long_commute": { checkbox: p.long_commute || false },
        "overwork": { checkbox: p.overwork || false },

        // Multi-select for skills
        "skills": {
            multi_select: (Array.isArray(p.skills) ? p.skills : []).map(skill => ({ name: ensureString(skill).replace(/,/g, '') })).slice(0, 10)
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
