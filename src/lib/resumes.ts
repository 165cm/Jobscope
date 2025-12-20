import fs from 'fs';
import path from 'path';

const RESUME_DIR = path.join(process.cwd(), 'docs', 'resumes');

export interface ResumeVersion {
    id: string;
    name: string; // "Base Resume", "For Google", etc.
    content: string; // Markdown content
    baseId?: string; // If it's a branch, this points to Main
    parentId?: string; // Points to previous version in same branch/line
    type: 'main' | 'branch'; // Fact-base or Tailored
    version: number;
    targetCompany?: string;
    createdAt: string;
    description?: string;
}

// Ensure dir exists
if (!fs.existsSync(RESUME_DIR)) {
    fs.mkdirSync(RESUME_DIR, { recursive: true });
}

export function getAllResumes(): ResumeVersion[] {
    const files = fs.readdirSync(RESUME_DIR).filter(f => f.endsWith('.json'));
    const resumes = files.map(file => {
        const data = fs.readFileSync(path.join(RESUME_DIR, file), 'utf-8');
        return JSON.parse(data) as ResumeVersion;
    });
    return resumes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getResume(id: string): ResumeVersion | null {
    const filePath = path.join(RESUME_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) return null;
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as ResumeVersion;
}

export function saveResume(resume: ResumeVersion): void {
    const filePath = path.join(RESUME_DIR, `${resume.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(resume, null, 2));
}

export function deleteResume(id: string): void {
    const filePath = path.join(RESUME_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}
