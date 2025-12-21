import type { AnalyzeResult } from './openai';
import type { NotionSchema } from './schema';

export interface NotionResponse {
    url: string;
    id: string;
}

// Helper to ensure value is a string for Notion API
function ensureString(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    if (typeof value === 'boolean') return String(value);

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

// Map AnalyzeResult properties to Notion API payload dynamically based on schema
function mapProperties(data: AnalyzeResult, schema: NotionSchema, jobUrl: string) {
    const notionProperties: any = {};
    const aiProps = data.properties;

    // Mapping for default AI keys to potential Notion property names
    // Accessing aiProps with these keys if direct match fails
    const ALIAS_MAP: Record<string, string[]> = {
        "Name": ["company", "Company", "会社名", "企業名"],
        "Job Title": ["title", "Title", "role", "Role", "役職", "職種"],
        "URL": ["url", "link", "Job URL"],
        "Employment": ["employment", "type", "雇用形態"],
        "Status": ["status"],
        "Source": ["source", "via", "媒体"],
        "Remote": ["remote", "リモート"],
        "Salary Min": ["salary_min"],
        "Salary Max": ["salary_max"],
        "Location": ["location", "place", "勤務地"],
        "Skills": ["skills", "tech", "技術スタック", "スキル"],
    };

    // Helper to find value in aiProps
    const getValue = (notionPropName: string) => {
        // 1. Try direct match
        if (aiProps[notionPropName] !== undefined) return aiProps[notionPropName];

        // 2. Try aliases
        if (ALIAS_MAP[notionPropName]) {
            for (const alias of ALIAS_MAP[notionPropName]) {
                if (aiProps[alias] !== undefined) return aiProps[alias];
            }
        }

        // 3. Try standard defaults if name is generic (case insensitive match?)
        const lowerName = notionPropName.toLowerCase();
        for (const key of Object.keys(aiProps)) {
            if (key.toLowerCase() === lowerName) return aiProps[key];
        }

        return undefined;
    };

    for (const prop of schema.properties) {
        // Skip read-only properties
        if (['created_time', 'last_edited_time', 'created_by', 'last_edited_by', 'formula', 'rollup'].includes(prop.type)) {
            continue;
        }

        let value = getValue(prop.name);

        // Special Case: URL property should default to jobUrl if not extracted by AI
        if ((value === undefined || value === null) && (prop.type === 'url' || prop.name.toLowerCase() === 'url')) {
            value = jobUrl;
        }

        // If still undefined/null and not a checkbox/number/multi-select (which can handle nulls/defaults), skip?
        // Checkbox must be boolean, others can be null usually.

        // If value is undefined, we generally preserve existing value (for update) or default (for create).
        // Since this is constructing a payload, passing 'undefined' usually creates nothing.
        if (value === undefined) continue;

        try {
            switch (prop.type) {
                case 'title':
                    notionProperties[prop.name] = {
                        title: [{ text: { content: ensureString(value) } }]
                    };
                    break;
                case 'rich_text':
                    notionProperties[prop.name] = {
                        rich_text: [{ text: { content: ensureString(value) } }]
                    };
                    break;
                case 'number':
                    // Parse number if string
                    let num = value;
                    if (typeof num === 'string') {
                        num = parseFloat(num.replace(/[^0-9.-]/g, '')); // remove commas/currency
                    }
                    notionProperties[prop.name] = {
                        number: isNaN(num) || num === '' ? null : Number(num)
                    };
                    break;
                case 'select':
                    // Notion validation: Option must match schema or be created if API allows (API allows creating if not exists? Select options usually auto-create?)
                    // Actually, select options are auto-created by API if they don't exist, provided the name is valid.
                    const strVal = ensureString(value);
                    if (strVal) {
                        notionProperties[prop.name] = { select: { name: strVal } };
                    }
                    break;
                case 'multi_select':
                    const vals = Array.isArray(value) ? value : (value ? [value] : []);
                    const options = vals.map((v: any) => ({ name: ensureString(v).replace(/,/g, '') })).filter((o: any) => o.name);
                    // Limit to some reasonable number if needed?
                    notionProperties[prop.name] = { multi_select: options };
                    break;
                case 'checkbox':
                    notionProperties[prop.name] = { checkbox: Boolean(value) };
                    break;
                case 'url':
                    notionProperties[prop.name] = { url: ensureString(value) || null };
                    break;
                case 'email':
                    notionProperties[prop.name] = { email: ensureString(value) || null };
                    break;
                case 'phone_number':
                    notionProperties[prop.name] = { phone_number: ensureString(value) || null };
                    break;
                case 'date':
                    // Very simple date handling. AI usually returns string.
                    const dateStr = ensureString(value);
                    if (dateStr) {
                        // Validate format or try to construct ISO? Notion needs ISO 8601.
                        // If AI returns "Invalid Date", skip.
                        const d = new Date(dateStr);
                        if (!isNaN(d.getTime())) {
                            notionProperties[prop.name] = { date: { start: d.toISOString().split('T')[0] } }; // Date only
                        }
                    }
                    break;
            }
        } catch (e) {
            console.warn(`Failed to map property ${prop.name}`, e);
        }
    }

    return notionProperties;
}

export async function saveJobToNotion(
    data: AnalyzeResult,
    apiKey: string,
    databaseId: string,
    schema: NotionSchema,
    jobUrl: string
): Promise<NotionResponse> {
    const url = 'https://api.notion.com/v1/pages';
    const properties = mapProperties(data, schema, jobUrl);

    // Safety check: ensure at least one property (Name/title) is set, otherwise Notion might error if required fields missing?
    // Notion API requires 'parent', but properties can be empty (creates empty page).
    // However, usually we want at least the title.

    // If Title property is missing in mapping, force correct usage of Name/company
    const titleProp = schema.properties.find(p => p.type === 'title');
    if (titleProp && !properties[titleProp.name]) {
        // Fallback: use company or generic name
        const fallbackTitle = data.properties.company || data.properties.title || "Untitled Job";
        properties[titleProp.name] = { title: [{ text: { content: ensureString(fallbackTitle) } }] };
    }

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
    schema: NotionSchema,
    jobUrl: string
): Promise<NotionResponse> {
    const url = `https://api.notion.com/v1/pages/${pageId}`;
    const properties = mapProperties(data, schema, jobUrl);

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
