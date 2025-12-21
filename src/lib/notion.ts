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

export interface JobscopeConfig {
    prompt_role?: string;
    prompt_logic?: string;
    prompt_instructions?: Record<string, string>;
    last_updated?: string;
}

export async function saveConfigToPage(pageId: string, apiKey: string, config: JobscopeConfig): Promise<void> {
    const url = `https://api.notion.com/v1/blocks/${pageId}/children`;

    // Create a new code block with the config JSON
    const payload = {
        children: [
            {
                object: 'block',
                type: 'heading_2', // Marker
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: 'Jobscope Config Backup' } }]
                }
            },
            {
                object: 'block',
                type: 'code',
                code: {
                    language: 'json',
                    rich_text: [{ type: 'text', text: { content: JSON.stringify(config, null, 2) } }]
                }
            },
            {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [
                        { type: 'text', text: { content: `Updated at: ${new Date().toLocaleString()}`, annotations: { italic: true, color: 'gray' } } }
                    ]
                }
            },
            {
                object: 'block',
                type: 'divider',
                divider: {}
            }
        ]
    };

    const response = await fetch(url, {
        method: 'PATCH', // append children
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to save config: ${error.message}`);
    }
}

export async function loadConfigFromPage(pageId: string, apiKey: string): Promise<JobscopeConfig> {
    const url = `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100`;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Notion-Version': '2022-06-28',
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Failed to load config: ${error.message}`);
    }

    const data = await response.json();
    const blocks = data.results;

    // Find the last code block
    let config: JobscopeConfig | null = null;

    for (const block of blocks) {
        if (block.type === 'code' && block.code) {
            try {
                const text = block.code.rich_text.map((t: any) => t.plain_text).join('');
                const parsed = JSON.parse(text);
                // Simple validation check
                if (parsed.prompt_role || parsed.prompt_logic || parsed.prompt_instructions) {
                    config = parsed;
                }
            } catch (e) {
                // ignore non-json blocks
            }
        }
    }

    if (!config) {
        throw new Error("No valid configuration found on this page.");
    }

    return config;
}
