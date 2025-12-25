// Notion Schema Types
export interface NotionProperty {
    id: string;
    name: string;
    type: string;
    options?: string[]; // For select/multi_select
}

export interface NotionSchema {
    databaseId: string;
    properties: NotionProperty[];
    fetchedAt: number; // timestamp
}

export interface SchemaDiff {
    added: NotionProperty[];
    removed: NotionProperty[];
    changed: { property: string; oldType: string; newType: string }[];
}

// Fetch schema from Notion API
export async function fetchNotionSchema(
    apiKey: string,
    databaseId: string
): Promise<NotionSchema> {
    const url = `https://api.notion.com/v1/databases/${databaseId}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Notion-Version": "2022-06-28",
        },
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(`Notion API Error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    const properties: NotionProperty[] = [];

    for (const [name, prop] of Object.entries(data.properties) as [string, any][]) {
        const property: NotionProperty = {
            id: prop.id,
            name: name,
            type: prop.type,
        };

        // Extract options for select/multi_select
        if (prop.type === "select" && prop.select?.options) {
            property.options = prop.select.options.map((o: any) => o.name);
        } else if (prop.type === "multi_select" && prop.multi_select?.options) {
            property.options = prop.multi_select.options.map((o: any) => o.name);
        }

        properties.push(property);
    }

    return {
        databaseId,
        properties,
        fetchedAt: Date.now(),
    };
}

// Save schema to local storage
export async function saveLocalSchema(schema: NotionSchema): Promise<void> {
    await chrome.storage.local.set({ notion_schema: schema });
}

// Load schema from local storage
export async function loadLocalSchema(): Promise<NotionSchema | null> {
    const result = await chrome.storage.local.get(["notion_schema"]);
    return (result.notion_schema as NotionSchema) || null;
}

// Compare two schemas and find differences
export function compareSchemas(
    oldSchema: NotionSchema | null,
    newSchema: NotionSchema
): SchemaDiff {
    const diff: SchemaDiff = {
        added: [],
        removed: [],
        changed: [],
    };

    if (!oldSchema) {
        // All properties are new if no old schema
        diff.added = newSchema.properties;
        return diff;
    }

    const oldProps = new Map(oldSchema.properties.map((p) => [p.name, p]));
    const newProps = new Map(newSchema.properties.map((p) => [p.name, p]));

    // Find added and changed
    for (const [name, prop] of newProps) {
        const oldProp = oldProps.get(name);
        if (!oldProp) {
            diff.added.push(prop);
        } else if (oldProp.type !== prop.type) {
            diff.changed.push({
                property: name,
                oldType: oldProp.type,
                newType: prop.type,
            });
        }
    }

    // Find removed
    for (const [name, prop] of oldProps) {
        if (!newProps.has(name)) {
            diff.removed.push(prop);
        }
    }

    return diff;
}

// Check if there are any differences
export function hasSchemaDiff(diff: SchemaDiff): boolean {
    return diff.added.length > 0 || diff.removed.length > 0 || diff.changed.length > 0;
}

// Map known property names to specific extraction instructions
export const DEFAULT_PROPERTY_INSTRUCTIONS: Record<string, string> = {
    "company": "Company name. Abbreviate 株式会社 to ㈱ (e.g., 株式会社ABC → ㈱ABC)",
    "Name": "Company name. Abbreviate 株式会社 to ㈱ (e.g., 株式会社ABC → ㈱ABC)",
    "title": "Job title (exclude company name)",
    "Job Title": "Job title (exclude company name)",

    // User requested clarifications:
    "source": "求人媒体の名前 (Media Name e.g. Green, Wantedly).",
    "Source": "求人媒体の名前 (Media Name e.g. Green, Wantedly).",
    "媒体": "求人媒体の名前 (Media Name e.g. Green, Wantedly).",

    "web": "企業の公式HPのURL (Company Website). NOT the job post URL.",
    "Web": "企業の公式HPのURL (Company Website).",
    "website": "企業の公式HPのURL (Company Website).",
    "Website": "企業の公式HPのURL (Company Website).",
    "会社HP": "企業の公式HPのURL (Company Website).",

    "url": "求人ページのURL (Job Post URL). System will autofill this, so leave empty unless specific.",
    "URL": "求人ページのURL (Job Post URL). System will autofill this, so leave empty unless specific.",
    "Link": "求人ページのURL (Job Post URL).",

    "employment": "Employment type",
    "salary_min": "Annual salary minimum in 万円 (e.g., 5,000,000円 → 500)",
    "salary_max": "Annual salary maximum in 万円",
    "location": "Work location (e.g., 東京都...)",
    "station": "Nearest station",
    "employees": "Employee count",
    "avg_age": "Average age",
    "age_limit": "Age limit if any",
    "skills": "Technical skills (max 10, comma separated strings)",
    "match": "Match level based on user profile",
    "autonomy": "Boolean flag",
    "feedback": "Boolean flag",
    "teamwork": "Boolean flag",
    "long_commute": "Boolean flag",
    "overwork": "Boolean flag",

    // Phase 1: 企業リサーチリンク
    "company_website": "企業の公式ホームページURL (Company Official Website URL)",
    "openwork_url": "OpenWork検索URL (auto-generated from company name)",
    "lighthouse_url": "Lighthouse検索URL (auto-generated from company name)",
    "careerconnection_url": "キャリコネ検索URL (auto-generated from company name)",
    "search_x": "X(Twitter)検索URL (auto-generated from company name)",
    "search_note": "note検索URL (auto-generated from company name)",
    "search_linkedin": "LinkedIn検索URL (auto-generated from company name)"
};

// Generate default prompt from schema
export function generatePromptFromSchema(
    schema: NotionSchema,
    customInstructions: Record<string, string> = {}
): string {
    let prompt = `Extract the following fields for Notion Properties:\n`;

    // specific sort order? For now, alphabetical or schema order is fine.
    // Maybe move "Name" and "Job Title" to top?
    const properties = [...schema.properties].sort((a, b) => {
        const priority = ["Name", "company", "Job Title", "title"];
        const ia = priority.indexOf(a.name);
        const ib = priority.indexOf(b.name);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return 0;
    });

    // 1. Extraction Rules
    for (const prop of properties) {
        // Skip read-only/system fields provided by Notion automatically
        if (['created_time', 'last_edited_time', 'created_by', 'last_edited_by'].includes(prop.type)) continue;

        const typeHint = getTypeHint(prop);

        // Use custom instruction if available, otherwise default fallback
        const instruction = customInstructions[prop.name] ??
            (DEFAULT_PROPERTY_INSTRUCTIONS[prop.name] || DEFAULT_PROPERTY_INSTRUCTIONS[prop.name.toLowerCase()] || "");

        let line = `- ${prop.name}: ${typeHint}`;
        if (instruction) {
            line += `. ${instruction}`;
        }
        if (prop.options && prop.options.length > 0) {
            line += `. Options: [${prop.options.join(", ")}]`;
        }

        prompt += `${line}\n`;
    }

    // 2. JSON Structure Example
    prompt += `\nOutput EXACTLY this JSON format (fill values based on extraction):\n{\n  "properties": {\n`;

    const jsonLines: string[] = [];
    for (const prop of properties) {
        if (['created_time', 'last_edited_time', 'created_by', 'last_edited_by'].includes(prop.type)) continue;

        const exampleValue = getExampleValue(prop);
        jsonLines.push(`    "${prop.name}": ${JSON.stringify(exampleValue)}`);
    }

    prompt += jsonLines.join(",\n");
    prompt += `\n  },\n  "markdown_content": "# Job Summary..."\n}`;

    return prompt;
}

function getExampleValue(prop: NotionProperty): any {
    switch (prop.type) {
        case "title": return "Title Example";
        case "rich_text": return "Text Example";
        case "number": return 100;
        case "checkbox": return false;
        case "url": return "https://example.com";
        case "email": return "example@mail.com";
        case "phone_number": return "090-1234-5678";
        case "date": return "2024-01-01";
        case "select": return prop.options && prop.options.length > 0 ? prop.options[0] : "SelectOption";
        case "multi_select": return prop.options && prop.options.length > 0 ? [prop.options[0]] : ["Tags"];
        default: return "Value";
    }
}

function getTypeHint(prop: NotionProperty): string {
    switch (prop.type) {
        case "title":
        case "rich_text":
            return "String";
        case "number":
            return "Number or null";
        case "checkbox":
            return "Boolean";
        case "url":
            return "URL String";
        case "email":
            return "Email String";
        case "phone_number":
            return "Phone Number String";
        case "date":
            return "Date (YYYY-MM-DD)";
        case "select":
            return "String (Exact match)";
        case "multi_select":
            return "Array of Strings";
        default:
            return "String";
    }
}
