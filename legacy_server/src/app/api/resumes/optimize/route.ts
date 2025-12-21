import { NextRequest, NextResponse } from 'next/server';
import { openai, MODEL_NAME } from '@/lib/openai';

export async function POST(req: NextRequest) {
    try {
        const { resumeContent, jobDescription, instructions } = await req.json();

        const prompt = `
You are an expert Resume Writer.
Your task is to rewrite/optimize the User's Resume to better match a specific Job Description.

User Resume:
${resumeContent}

Target Job Description:
${jobDescription.substring(0, 10000)}

Instructions:
${instructions || 'Highlight relevant skills and experiences. Adjust tone to match company culture. Keep it truthful but persuasive.'}

Output:
Return ONLY the full Markdown content of the new resume.
`;

        const completion = await openai.chat.completions.create({
            model: MODEL_NAME,
            messages: [
                { role: 'system', content: 'You are a professional resume writer.' },
                { role: 'user', content: prompt }
            ],
        });

        const optimizedContent = completion.choices[0].message.content;

        return NextResponse.json({ content: optimizedContent });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
