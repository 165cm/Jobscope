export function markdownToBlocks(markdown: string): any[] {
    const blocks: any[] = [];
    const lines = markdown.split('\n');

    for (const line of lines) {
        // H1: # Header
        if (line.startsWith('# ')) {
            blocks.push({
                object: 'block',
                type: 'heading_1',
                heading_1: {
                    rich_text: [{ type: 'text', text: { content: line.replace('# ', '').replace(/\*\*/g, '').trim().substring(0, 2000) } }]
                }
            });
        }
        // H2: ## Header
        else if (line.startsWith('## ')) {
            blocks.push({
                object: 'block',
                type: 'heading_2',
                heading_2: {
                    rich_text: [{ type: 'text', text: { content: line.replace('## ', '').replace(/\*\*/g, '').trim().substring(0, 2000) } }]
                }
            });
        }
        // H3: ### Header
        else if (line.startsWith('### ')) {
            blocks.push({
                object: 'block',
                type: 'heading_3',
                heading_3: {
                    rich_text: [{ type: 'text', text: { content: line.replace('### ', '').replace(/\*\*/g, '').trim().substring(0, 2000) } }]
                }
            });
        }
        // Bullet: - Item or * Item
        else if (line.startsWith('- ') || line.startsWith('* ')) {
            blocks.push({
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                    rich_text: [{ type: 'text', text: { content: line.replace(/^[-*] /, '').replace(/\*\*/g, '').trim().substring(0, 2000) } }]
                }
            });
        }
        // Empty line -> Paragraph (spacer)
        else if (line.trim() === '') {
            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [] // Empty paragraph
                }
            });
        }
        // Paragraph
        else {
            blocks.push({
                object: 'block',
                type: 'paragraph',
                paragraph: {
                    rich_text: [{ type: 'text', text: { content: line.replace(/\*\*/g, '').trim().substring(0, 2000) } }]
                }
            });
        }
    }

    // Limit block count to avoid timeouts/limits (Notion block append limit is 100, create page limit is unknown but good to be safe)
    // Actually page create allows many blocks.
    return blocks;
}
