"use client";

import { useState, useEffect } from 'react';
import { FileText, Plus, GitBranch, Wand2, Trash2, ChevronRight, ChevronDown, History } from 'lucide-react';

interface Resume {
    id: string;
    name: string;
    content: string;
    targetCompany?: string;
    createdAt: string;
    type?: 'main' | 'branch';
    baseId?: string;
    parentId?: string;
    version?: number;
}

interface ResumeManagerProps {
    onSelect: (content: string, name: string) => void;
    jobDescription?: string;
}

export default function ResumeManager({ onSelect, jobDescription, reloadTrigger }: { onSelect: (content: string, name: string) => void; jobDescription?: string; reloadTrigger?: number }) {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [expandedMains, setExpandedMains] = useState<Record<string, boolean>>({});

    // Preview Modal State
    const [previewResume, setPreviewResume] = useState<Resume | null>(null);

    // New Resume State
    const [newName, setNewName] = useState('');
    const [newContent, setNewContent] = useState('');

    useEffect(() => {
        fetchResumes();
    }, [reloadTrigger]);

    const fetchResumes = async () => {
        const res = await fetch('/api/resumes');
        if (res.ok) {
            setResumes(await res.json());
        }
    };

    const handleCreate = async () => {
        if (!newName) return;
        await saveResume({
            name: newName,
            content: newContent,
            type: 'main',
            version: 1,
            description: '手動作成'
        });
        setIsCreating(false);
        setNewName('');
        setNewContent('');
    };

    const saveResume = async (data: any) => {
        const res = await fetch('/api/resumes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (res.ok) fetchResumes();
        return res.ok;
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('本当に削除しますか？')) return;
        await fetch(`/api/resumes?id=${id}`, { method: 'DELETE' });
        fetchResumes();
        if (selectedId === id) setSelectedId(null);
    };

    const handleOptimize = async (baseResume: Resume, mode: 'new_branch' | 'refine') => {
        if (!jobDescription) {
            alert('求人情報が入力されていません。');
            return;
        }
        setIsOptimizing(true);
        try {
            const prompt = mode === 'new_branch'
                ? 'この企業の求人に合わせて、私の経歴から最適な要素を抜き出し、新しい履歴書を作成してください。'
                : '現在の履歴書をベースに、さらに求人にマッチするようにブラッシュアップしてください。';

            const res = await fetch('/api/resumes/optimize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resumeContent: baseResume.content,
                    jobDescription: jobDescription,
                    instructions: prompt
                })
            });
            const data = await res.json();
            if (data.content) {
                const cleanJobName = jobDescription.split('\n')[0].substring(0, 20).replace(/[#:【】]/g, '').trim();

                const newResumeData = mode === 'new_branch' ? {
                    name: `For ${cleanJobName}`,
                    content: data.content,
                    baseId: baseResume.type === 'main' ? baseResume.id : baseResume.baseId,
                    type: 'branch',
                    version: 1,
                    targetCompany: cleanJobName,
                    parentId: baseResume.id
                } : {
                    name: baseResume.name,
                    content: data.content,
                    baseId: baseResume.baseId,
                    parentId: baseResume.id,
                    type: baseResume.type,
                    version: (baseResume.version || 1) + 1,
                    targetCompany: baseResume.targetCompany
                };

                await saveResume(newResumeData);
                alert('履歴書を最適化しました！');
                if (newResumeData.baseId) {
                    setExpandedMains(prev => ({ ...prev, [newResumeData.baseId!]: true }));
                }
            }
        } catch (e) {
            alert('最適化に失敗しました');
        } finally {
            setIsOptimizing(false);
        }
    };

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedMains(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const openPreview = (resume: Resume, e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewResume(resume);
    };

    // Grouping logic
    const mainResumes = resumes.filter(r => r.type === 'main' || !r.baseId);
    const getBranches = (mainId: string) => resumes.filter(r => r.baseId === mainId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-indigo-600" />
                    履歴書管理
                </h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="履歴書を手動登録"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Create Manual Resume Form */}
            {isCreating && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in slide-in-from-top-2 shadow-sm">
                    <input
                        className="w-full mb-2 p-2 border rounded text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="履歴書名 (例: 基本履歴書 2025)"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                    />
                    <textarea
                        className="w-full mb-2 p-2 border rounded h-32 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Markdown形式で入力..."
                        value={newContent}
                        onChange={e => setNewContent(e.target.value)}
                    />
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setIsCreating(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">キャンセル</button>
                        <button onClick={handleCreate} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded transition-colors">保存</button>
                    </div>
                </div>
            )}

            {/* Resume List */}
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[600px] pr-1">
                {mainResumes.length === 0 && !isCreating && (
                    <div className="text-center py-8 text-gray-400 text-sm">
                        履歴書がありません。<br />PDFをアップロードするか、<br />手動で作成してください。
                    </div>
                )}

                {mainResumes.map(main => {
                    const branches = getBranches(main.id);
                    const isExpanded = expandedMains[main.id];
                    const isSelected = selectedId === main.id;

                    return (
                        <div key={main.id} className="space-y-1 group">
                            {/* MAIN Resume Card */}
                            <div
                                onClick={() => { setSelectedId(main.id); onSelect(main.content, main.name); }}
                                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md flex items-center gap-3 relative ${isSelected ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' : 'border-gray-200 bg-white'
                                    }`}
                            >
                                {/* Expand Toggle or Icon */}
                                <button
                                    onClick={(e) => toggleExpand(main.id, e)}
                                    className={`p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ${branches.length === 0 && 'cursor-default hover:bg-transparent'}`}
                                >
                                    {branches.length > 0 ? (
                                        isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                                    ) : (
                                        <FileText className="w-4 h-4" />
                                    )}
                                </button>

                                {/* Content Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="font-bold text-gray-800 text-sm truncate">{main.name}</span>
                                        <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium border border-indigo-200">原本</span>
                                        {isSelected && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">選択中</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>v{main.version || 1}</span>
                                        <span>•</span>
                                        <span>{new Date(main.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => openPreview(main, e)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="内容をプレビュー">
                                        <FileText className="w-4 h-4" />
                                    </button>
                                    {jobDescription && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleOptimize(main, 'new_branch'); }}
                                            disabled={isOptimizing}
                                            className="p-1.5 text-purple-600 hover:bg-purple-100 rounded"
                                            title="この求人用に最適化(ブランチ作成)"
                                        >
                                            <GitBranch className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={(e) => handleDelete(main.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded" title="削除">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* BRANCHES List */}
                            {isExpanded && branches.length > 0 && (
                                <div className="ml-5 pl-4 border-l-2 border-dashed border-gray-200 space-y-2 py-1">
                                    {branches.map(branch => {
                                        const isBranchSelected = selectedId === branch.id;
                                        return (
                                            <div
                                                key={branch.id}
                                                onClick={() => { setSelectedId(branch.id); onSelect(branch.content, branch.name); }}
                                                className={`p-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-sm relative group/branch ${isBranchSelected ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-400' : 'border-gray-200 bg-gray-50/50'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <GitBranch className="w-3.5 h-3.5 text-purple-400 transform rotate-180" />
                                                            <span className="font-medium text-gray-700 text-sm truncate">{branch.name}</span>
                                                        </div>
                                                        <div className="flex gap-2 text-xs text-gray-500">
                                                            {branch.targetCompany && <span className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded text-[10px] font-medium">{branch.targetCompany}</span>}
                                                            <span>v{branch.version}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-1 opacity-0 group-hover/branch:opacity-100 transition-opacity">
                                                        <button onClick={(e) => openPreview(branch, e)} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="プレビュー">
                                                            <FileText className="w-3.5 h-3.5" />
                                                        </button>
                                                        {jobDescription && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleOptimize(branch, 'refine'); }}
                                                                disabled={isOptimizing}
                                                                className="p-1 text-orange-600 hover:bg-orange-100 rounded"
                                                                title="さらにブラッシュアップ(vUp)"
                                                            >
                                                                <Wand2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button onClick={(e) => handleDelete(branch.id, e)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Preview Modal */}
            {previewResume && (
                <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm rounded-xl p-4 flex flex-col border border-gray-200 shadow-xl" style={{ margin: '-1px' }}>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                        <div>
                            <h3 className="font-bold text-gray-800">{previewResume.name}</h3>
                            <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                <span className={`px-1.5 py-0.5 rounded ${previewResume.type === 'main' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {previewResume.type === 'main' ? '原本(MAIN)' : '派生(BRANCH)'}
                                </span>
                                <span>v{previewResume.version}</span>
                                <span>{new Date(previewResume.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                        <button onClick={() => setPreviewResume(null)} className="p-1 hover:bg-gray-100 rounded-full">
                            ✕
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded border text-sm font-mono whitespace-pre-wrap">
                        {previewResume.content}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => { setSelectedId(previewResume.id); onSelect(previewResume.content, previewResume.name); setPreviewResume(null); }}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
                        >
                            この履歴書を選択して使用
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
