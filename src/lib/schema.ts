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

// Generate default prompt from schema
export function generatePromptFromSchema(schema: NotionSchema): string {
    let prompt = `Extract the following fields for Notion Properties:\n`;

    for (const prop of schema.properties) {
        const typeHint = getTypeHint(prop);
        prompt += `- ${prop.name} (${prop.type})${typeHint}\n`;
    }

    return prompt;
}

function getTypeHint(prop: NotionProperty): string {
    if (prop.options && prop.options.length > 0) {
        return `: Options=[${prop.options.join(", ")}]`;
    }
    switch (prop.type) {
        case "title":
        case "rich_text":
            return ": string";
        case "number":
            return ": number";
        case "checkbox":
            return ": boolean";
        case "url":
            return ": URL string";
        case "date":
            return ": YYYY-MM-DD";
        default:
            return "";
    }
}
