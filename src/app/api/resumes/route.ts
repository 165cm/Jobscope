import { NextRequest, NextResponse } from 'next/server';
import { getAllResumes, saveResume, ResumeVersion, deleteResume } from '@/lib/resumes';
import { v4 as uuidv4 } from 'uuid'; // Need to install uuid or just use random string

// Simple UUID generator if no package
function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export async function GET() {
    const resumes = getAllResumes();
    return NextResponse.json(resumes);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Create New
        const newResume: ResumeVersion = {
            id: body.id || generateId(),
            name: body.name || 'Untitled Resume',
            content: body.content || '',
            baseId: body.baseId,
            parentId: body.parentId,
            type: body.type || 'main', // Default to Main
            version: body.version || 1,
            targetCompany: body.targetCompany,
            description: body.description,
            createdAt: new Date().toISOString(),
        };
        saveResume(newResume);
        return NextResponse.json(newResume);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) {
        deleteResume(id);
        return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
}
