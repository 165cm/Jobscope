import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { markdownToBlocks } from '@/lib/notion-utils';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { properties, markdown_content, url } = body;

        const apiKey = process.env.NOTION_API_KEY;
        const dbId = process.env.NOTION_DATABASE_ID;

        if (!apiKey || !dbId) {
            throw new Error("Missing NOTION_API_KEY or NOTION_DATABASE_ID");
        }

        const notion = new Client({ auth: apiKey });

        console.log('[Notion] Saving to DB:', dbId);

        // Initialize properties with the required Title field (Name)
        // Use "company" if available, otherwise "title"
        const mainTitle = properties.company || properties.title || 'Unknown Company';

        const notionProperties: any = {
            // "Name" is the Primary Title column (Internal ID: title)
            'Name': {
                title: [
                    {
                        text: {
                            content: mainTitle
                        }
                    }
                ]
            }
        };

        // Helper to add if value exists
        const addProp = (key: string, value: any, type: string) => {
            if (value !== undefined && value !== null) {
                if (type === 'number') {
                    notionProperties[key] = { number: Number(value) };
                } else if (type === 'select') {
                    notionProperties[key] = { select: { name: String(value) } };
                } else if (type === 'rich_text') {
                    notionProperties[key] = { rich_text: [{ text: { content: String(value) } }] };
                } else if (type === 'url') {
                    notionProperties[key] = { url: String(value) };
                } else if (type === 'checkbox') {
                    notionProperties[key] = { checkbox: Boolean(value) };
                }
            }
        };

        // "Job Title"
        if (properties.title) {
            notionProperties['Job Title'] = {
                rich_text: [{ text: { content: properties.title } }]
            };
        }

        // Numbers
        addProp('salary_min', properties.salary_min, 'number');
        addProp('salary_max', properties.salary_max, 'number');

        // Changed from Number to RichText (Text) to handle string values like "100名", "30歳", "渋谷駅"
        addProp('Station', properties.station, 'rich_text');
        addProp('age_limit', properties.age_limit, 'rich_text');
        addProp('Employees', properties.employees, 'rich_text');
        addProp('Avg Age', properties.avg_age, 'rich_text');

        // URL
        // Notion API requires a valid URL or null, explicitly not an empty string
        addProp('url', url || null, 'url');

        // Selects with defaults
        if (properties.status) addProp('status', properties.status, 'select');
        else notionProperties['status'] = { select: { name: 'searching' } };

        if (properties.source) addProp('source', properties.source, 'select');

        if (properties.category) addProp('category', properties.category, 'select');
        if (properties.match) addProp('match', properties.match, 'select');
        if (properties.employment) addProp('employment', properties.employment, 'select');
        if (properties.remote) addProp('remote', properties.remote, 'select');
        if (properties.side_job) addProp('side_job', properties.side_job, 'select');

        // Checkboxes
        addProp('autonomy', properties.autonomy, 'checkbox');
        addProp('long_commute', properties.long_commute, 'checkbox');
        addProp('feedback', properties.feedback, 'checkbox');
        addProp('teamwork', properties.teamwork, 'checkbox');
        addProp('overwork', properties.overwork, 'checkbox');

        // Rich Text
        addProp('location', properties.location, 'rich_text');
        addProp('memo', properties.memo, 'rich_text');

        // Multi-select (Skills)
        if (properties.skills && Array.isArray(properties.skills)) {
            const validSkills = properties.skills
                .map((s: string) => String(s).trim())
                .filter((s: string) => s.length > 0)
                .map((name: string) => ({ name: name.substring(0, 100) })); // Limit length

            if (validSkills.length > 0) {
                notionProperties['skills'] = { multi_select: validSkills };
            }
        }

        // Action Date (Default to today)
        if (properties.action_date) {
            notionProperties['action_date'] = { date: { start: properties.action_date } };
        } else {
            notionProperties['action_date'] = { date: { start: new Date().toISOString().split('T')[0] } };
        }

        console.log('[Notion] Sending properties:', JSON.stringify(notionProperties, null, 2));

        // Generate blocks from markdown
        const children = markdown_content ? markdownToBlocks(markdown_content) : [];

        const response = await notion.pages.create({
            parent: { database_id: dbId },
            properties: notionProperties,
            children: children
        });

        console.log('[Notion] Success! Page ID:', response.id);

        return NextResponse.json({ success: true, pageId: response.id });

    } catch (error: any) {
        console.error('[Notion] Error:', error.message);
        return NextResponse.json({ error: error.message || 'Notion save failed' }, { status: 500 });
    }
}
