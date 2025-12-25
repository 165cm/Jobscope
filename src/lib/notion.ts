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
        return value.map(v => ensureString(v)).join(', ');
    }
    if (typeof value === 'object') {
        if (value.name) return value.name;
        if (value.content) return value.content;
        if (value.text) return ensureString(value.text);
        if (value.title) return ensureString(value.title);
        return JSON.stringify(value);
    }
    return String(value);
}

// Convert markdown string to Notion Blocks
function markdownToBlocks(markdown: string) {
    const blocks = [];
    const lines = markdown.split('\n');

    for (const line of lines) {
        // Skip purely empty lines unless we want spacers, but Notion handles spacing well
        if (line.trim() === '') continue;

        // Truncate overly long lines to avoid API errors (2000 chars limit per text object)
        const safeLine = line.length > 2000 ? line.substring(0, 2000) + '...' : line;

        if (safeLine.startsWith('# ')) {
            blocks.push({
                object: 'block', type: 'heading_1',
                heading_1: { rich_text: [{ type: 'text', text: { content: safeLine.substring(2) } }] }
            });
        } else if (safeLine.startsWith('## ')) {
            blocks.push({
                object: 'block', type: 'heading_2',
                heading_2: { rich_text: [{ type: 'text', text: { content: safeLine.substring(3) } }] }
            });
        } else if (safeLine.startsWith('### ')) {
            blocks.push({
                object: 'block', type: 'heading_3',
                heading_3: { rich_text: [{ type: 'text', text: { content: safeLine.substring(4) } }] }
            });
        } else if (safeLine.startsWith('- ') || safeLine.startsWith('* ')) {
            blocks.push({
                object: 'block', type: 'bulleted_list_item',
                bulleted_list_item: { rich_text: [{ type: 'text', text: { content: safeLine.substring(2) } }] }
            });
        } else if (safeLine.match(/^[0-9]+\. /)) {
            // Numbered list
            const content = safeLine.replace(/^[0-9]+\. /, '');
            blocks.push({
                object: 'block', type: 'numbered_list_item',
                numbered_list_item: { rich_text: [{ type: 'text', text: { content: content } }] }
            });
        } else {
            blocks.push({
                object: 'block', type: 'paragraph',
                paragraph: { rich_text: [{ type: 'text', text: { content: safeLine } }] }
            });
        }
    }
    // Cap blocks to avoid payload limits (API limit is 100 children per request, but let's be safe)
    return blocks.slice(0, 90);
}

// Map AnalyzeResult properties to Notion API payload dynamically based on schema
function mapProperties(data: AnalyzeResult, schema: NotionSchema, jobUrl: string) {
    const notionProperties: any = {};
    const aiProps = data.properties;

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
        "Web": ["site", "web", "website", "hp", "company_url", "会社HP"],
    };

    const getValue = (notionPropName: string) => {
        if (aiProps[notionPropName] !== undefined) return aiProps[notionPropName];
        if (ALIAS_MAP[notionPropName]) {
            for (const alias of ALIAS_MAP[notionPropName]) {
                if (aiProps[alias] !== undefined) return aiProps[alias];
            }
        }
        const lowerName = notionPropName.toLowerCase();
        for (const key of Object.keys(aiProps)) {
            if (key.toLowerCase() === lowerName) return aiProps[key];
        }
        return undefined;
    };

    for (const prop of schema.properties) {
        if (['created_time', 'last_edited_time', 'created_by', 'last_edited_by', 'formula', 'rollup'].includes(prop.type)) {
            continue;
        }

        const lowerName = prop.name.toLowerCase();

        // [Logic 1] Force Job Post URL
        if (prop.type === 'url' && (
            lowerName === 'url' ||
            lowerName === 'job url' ||
            lowerName === 'link' ||
            lowerName === 'source url' ||
            lowerName === 'source'
        )) {
            notionProperties[prop.name] = { url: jobUrl };
            continue;
        }

        // [Logic 2] Company Website
        if (prop.type === 'url' && (
            lowerName === 'web' ||
            lowerName === 'website' ||
            lowerName === 'hp' ||
            lowerName === 'company site' ||
            lowerName === '会社hp'
        )) {
            const siteVal = getValue(prop.name);
            notionProperties[prop.name] = { url: ensureString(siteVal) || null };
            continue;
        }

        let value = getValue(prop.name);

        if ((value === undefined || value === null) && prop.type === 'url' && lowerName === 'url') {
            value = jobUrl;
        }

        if (value === undefined) continue;

        try {
            switch (prop.type) {
                case 'title':
                    notionProperties[prop.name] = { title: [{ text: { content: ensureString(value) } }] };
                    break;
                case 'rich_text':
                    notionProperties[prop.name] = { rich_text: [{ text: { content: ensureString(value) } }] };
                    break;
                case 'number':
                    let num = value;
                    if (typeof num === 'string') num = parseFloat(num.replace(/[^0-9.-]/g, ''));

                    // === フェーズ1 改善: 数値範囲検証 ===
                    if (!isNaN(num) && num !== '') {
                        const lowerName = prop.name.toLowerCase();
                        // 給与の範囲チェック (200-10000万円)
                        if (lowerName.includes('salary') || lowerName.includes('年収')) {
                            if (num < 200 || num > 10000) {
                                console.warn(`[Jobscope] 給与が範囲外: ${prop.name}=${num}万円`);
                                num = NaN; // nullに変換
                            }
                        }
                        // 平均年齢の範囲チェック (18-70歳)
                        if (lowerName.includes('avg_age') || lowerName.includes('平均年齢')) {
                            if (num < 18 || num > 70) {
                                console.warn(`[Jobscope] 平均年齢が範囲外: ${prop.name}=${num}歳`);
                                num = NaN;
                            }
                        }
                    }

                    notionProperties[prop.name] = { number: isNaN(num) || num === '' ? null : Number(num) };
                    break;
                case 'select':
                    const strValSelect = ensureString(value);
                    if (strValSelect) {
                        // === フェーズ2 改善: Select選択肢検証 ===
                        if (prop.options && prop.options.length > 0) {
                            const lowerOptions = prop.options.map(o => o.toLowerCase());
                            if (!lowerOptions.includes(strValSelect.toLowerCase())) {
                                console.warn(`[Jobscope] 選択肢にない値: ${prop.name}="${strValSelect}" (有効: ${prop.options.join(', ')})`);
                            }
                        }
                        notionProperties[prop.name] = { select: { name: strValSelect } };
                    }
                    break;
                case 'multi_select':
                    const vals = Array.isArray(value) ? value : (value ? [value] : []);
                    const options = vals.map((v: any) => ({ name: ensureString(v).replace(/,/g, '') })).filter((o: any) => o.name);
                    notionProperties[prop.name] = { multi_select: options };
                    break;
                case 'checkbox':
                    notionProperties[prop.name] = { checkbox: Boolean(value) };
                    break;
                case 'url':
                    // === フェーズ2 改善: URL形式のバリデーション ===
                    const urlStr = ensureString(value);
                    if (urlStr) {
                        try {
                            new URL(urlStr);
                            notionProperties[prop.name] = { url: urlStr };
                        } catch {
                            console.warn(`[Jobscope] 無効なURL: ${prop.name}=${urlStr}`);
                            notionProperties[prop.name] = { url: null };
                        }
                    } else {
                        notionProperties[prop.name] = { url: null };
                    }
                    break;
                case 'email':
                    // === フェーズ2 改善: Email形式のバリデーション ===
                    const emailStr = ensureString(value);
                    if (emailStr) {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (emailRegex.test(emailStr)) {
                            notionProperties[prop.name] = { email: emailStr };
                        } else {
                            console.warn(`[Jobscope] 無効なEmail: ${prop.name}=${emailStr}`);
                            notionProperties[prop.name] = { email: null };
                        }
                    } else {
                        notionProperties[prop.name] = { email: null };
                    }
                    break;
                case 'phone_number':
                    notionProperties[prop.name] = { phone_number: ensureString(value) || null };
                    break;
                case 'date':
                    const dateStr = ensureString(value);
                    if (dateStr) {
                        const d = new Date(dateStr);
                        if (!isNaN(d.getTime())) notionProperties[prop.name] = { date: { start: d.toISOString().split('T')[0] } };
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

    const titleProp = schema.properties.find(p => p.type === 'title');
    if (titleProp && !properties[titleProp.name]) {
        const fallbackTitle = data.properties.company || data.properties.title || "Untitled Job";
        properties[titleProp.name] = { title: [{ text: { content: ensureString(fallbackTitle) } }] };
    }

    // Include children (content)
    const children = data.markdown_content ? markdownToBlocks(data.markdown_content) : [];

    const payload = {
        parent: { database_id: databaseId },
        properties: properties,
        children: children.length > 0 ? children : undefined
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

    // Update properties
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

    // Optionally append content? For now we don't automatedly append content on update to prevent duplication.
    // User can manually create new page for re-analysis or we can implement explicit 'append' flag later.

    return { url: result.url, id: result.id };
}
