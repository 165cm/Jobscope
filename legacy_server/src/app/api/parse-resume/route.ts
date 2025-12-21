import { NextRequest, NextResponse } from 'next/server';
import { openai, MODEL_NAME } from '@/lib/openai';
// @ts-ignore
const pdf = require('pdf-parse');

// Force Node.js runtime
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    console.log('[API] Parse Resume Started');

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            console.error('[API] No file found');
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }
        console.log(`[API] File received: ${file.name}, size: ${file.size}`);

        // Convert file to Buffer for pdf-parse
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Extract text using pdf-parse
        console.log('[API] Parsing PDF with pdf-parse...');
        const data = await pdf(buffer);
        const resumeText = data.text;

        console.log(`[API] PDF Parsed. Text length: ${resumeText.length}`);

        if (!resumeText || resumeText.trim().length === 0) {
            return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
        }

        // Analyze with OpenAI to structure data
        const prompt = `
You are a Resume Parser.
Extract key information from the following Resume Text to fill a user profile.

Resume Text:
${resumeText.substring(0, 30000)}

---
Output JSON with these fields:
- skills: (String) Comma separated list of top skills/qualifications.
- experience: (String) Summary of key experience and strengths (max 300 chars).
- conditions: (String) Inferred desired conditions if any (e.g. location, roles) or leaving empty if not found.

Example JSON:
{
  "skills": "React, TypeScript, Node.js, TOEIC 800",
  "experience": "5 years as Frontend Engineer at Tech Corp. Led a team of 3. Strong in UI/UX.",
  "conditions": "Tokyo, Remote preferred"
}
`;

        console.log(`[API] Calling OpenAI with model: ${MODEL_NAME}`);
        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                { role: 'system', content: 'You are a helpful assistant that outputs JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
        });

        const content = completion.choices[0].message.content;
        console.log('[API] OpenAI Response received:', content ? 'Success' : 'Empty');
        if (!content) throw new Error('No content from OpenAI');

        const result = JSON.parse(content);

        return NextResponse.json({ ...result, fullText: resumeText });

    } catch (error: any) {
        console.error('[API] Resume parse error:', error);
        return NextResponse.json({ error: error.message || 'Parse failed' }, { status: 500 });
    }
}
