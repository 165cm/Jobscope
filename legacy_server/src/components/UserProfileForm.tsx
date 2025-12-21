"use client";

import { useState } from 'react';
import { User, FileText, UploadCloud } from 'lucide-react';

// Declare pdfjsLib as global (loaded via CDN in layout.tsx)
declare const pdfjsLib: any;

interface UserProfileFormProps {
    onProfileChange: (profile: string) => void;
    onUploadComplete?: () => void;
}

// Parsed Resume Data Type
interface ResumeData {
    personalInfo?: {
        name?: string;
        nameKana?: string;
        email?: string;
        phone?: string;
        address?: string;
    };
    summary?: string;
    skills?: string;
    experience?: string;
    workHistory?: Array<{
        company?: string;
        position?: string;
        period?: string;
        description?: string;
    }>;
    education?: Array<{
        school?: string;
        degree?: string;
        graduationYear?: string;
    }>;
    certifications?: string[];
    languages?: Array<{
        language?: string;
        level?: string;
    }>;
    conditions?: string;
    strengths?: string;
    interests?: string;
    portfolio?: string;
}

// Helper: Client-side PDF text extraction
async function extractTextFromPDF(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('PDF.jsライブラリが読み込まれていません');
    }
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 50);
    for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
}

export default function UserProfileForm({ onProfileChange, onUploadComplete }: UserProfileFormProps) {
    const [resumeText, setResumeText] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleResumeChange = (val: string) => {
        setResumeText(val);
        onProfileChange(val);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        try {
            const pdfText = await extractTextFromPDF(file);

            if (!pdfText || pdfText.trim().length < 50) {
                throw new Error('PDFからテキストを抽出できませんでした');
            }

            const res = await fetch('/api/analyze-resume-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: pdfText }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || '解析に失敗しました');
            }

            const data: ResumeData = await res.json();

            setResumeText(pdfText);
            onProfileChange(pdfText);

            // ====== AUTO-SAVE TO RESUME MANAGER ======
            const resumeName = data.personalInfo?.name
                ? `${data.personalInfo.name}の履歴書`
                : `履歴書 (${new Date().toLocaleDateString('ja-JP')})`;

            // Create Markdown content for storage
            const resumeMarkdown = `# ${resumeName}

## 個人情報
${data.personalInfo?.name ? `- 氏名: ${data.personalInfo.name}` : ''}
${data.personalInfo?.email ? `- Email: ${data.personalInfo.email}` : ''}
${data.personalInfo?.phone ? `- 電話: ${data.personalInfo.phone}` : ''}
${data.personalInfo?.address ? `- 住所: ${data.personalInfo.address}` : ''}

## 職務要約
${data.summary || data.experience || ''}

## スキル・資格
${data.skills || ''}
${data.certifications ? `\n資格: ${data.certifications.join(', ')}` : ''}

## 職歴
${data.workHistory?.map(w => `### ${w.company || ''} - ${w.position || ''}
- 期間: ${w.period || ''}
- ${w.description || ''}`).join('\n\n') || ''}

## 学歴
${data.education?.map(e => `- ${e.school || ''} ${e.degree || ''} (${e.graduationYear || ''})`).join('\n') || ''}

## 語学
${data.languages?.map(l => `- ${l.language}: ${l.level}`).join('\n') || ''}

## 希望条件
${data.conditions || ''}

## 強み・興味
${data.strengths || ''}
${data.interests || ''}

${data.portfolio ? `## ポートフォリオ\n${data.portfolio}` : ''}
`;

            // Save to Resume Manager
            try {
                await fetch('/api/resumes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: resumeName,
                        content: resumeMarkdown,
                        type: 'main',
                        version: 1,
                        description: data.summary || ''
                    })
                });
                alert(`履歴書を読み込み、「${resumeName}」として履歴書管理に自動登録しました！`);

                // Trigger Reload in Parent
                if (onUploadComplete) onUploadComplete();

            } catch (saveError) {
                console.error('Resume save error:', saveError);
                alert('履歴書を読み込みました！（※履歴書管理への自動登録に失敗しました）');
            }

        } catch (error: any) {
            console.error(error);
            alert(`解析に失敗しました: ${error.message}`);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                あなたの情報
            </h2>

            <div className="space-y-4">
                <div className="animate-in fade-in duration-300">
                    <div className="mb-4 p-4 border-2 border-dashed border-indigo-200 rounded-lg bg-indigo-50 text-center hover:bg-indigo-100 transition-colors cursor-pointer relative group">
                        <label className="cursor-pointer block w-full h-full">
                            <div className="flex flex-col items-center justify-center gap-2 py-2">
                                <UploadCloud className="w-8 h-8 text-indigo-500 mb-1" />
                                <span className="text-indigo-600 font-medium text-sm">
                                    {isUploading ? '解析中...' : '履歴書(PDF)をアップロード'}
                                </span>
                                <span className="text-xs text-gray-400">自動解析して履歴書管理に追加します</span>
                            </div>
                            <input
                                type="file"
                                accept=".pdf"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                        </label>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-xs text-gray-400">またはテキストを貼り付け</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <textarea
                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm text-gray-600"
                        placeholder="ここにテキストを貼り付け..."
                        value={resumeText}
                        onChange={(e) => handleResumeChange(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}


