"use client";

import { useState } from 'react';
import { Search, AlertCircle, FileText } from 'lucide-react';

interface JobFormProps {
    onAnalyze: (url: string, manualText?: string) => void;
    isLoading: boolean;
    resumeContent?: string;
    resumeName?: string;
}

export default function JobForm({ onAnalyze, isLoading, resumeContent, resumeName }: JobFormProps) {
    const [url, setUrl] = useState('');
    const [scrapeFailed, setScrapeFailed] = useState(false);
    const [manualText, setManualText] = useState('');
    const [manualUrl, setManualUrl] = useState('');

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        setScrapeFailed(false);
        onAnalyze(url);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAnalyze(manualUrl, manualText);
    };

    // Helper to extract sections
    const getSection = (content: string, keyword: string) => {
        if (!content) return null;
        const regex = new RegExp(`## .*${keyword}.*[\\s\\S]*?(?=## |$)`, 'i');
        const match = content.match(regex);
        return match ? match[0].replace(/## .*?\n/, '').trim() : null;
    };

    const summary = resumeContent ? getSection(resumeContent, '要約') || getSection(resumeContent, 'Summary') : null;
    const skills = resumeContent ? getSection(resumeContent, 'スキル') || getSection(resumeContent, 'Skills') : null;
    const strengths = resumeContent ? getSection(resumeContent, '強み') || getSection(resumeContent, 'Strengths') : null;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                求人情報を入力
            </h2>

            <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">求人記事URL</label>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            required
                            placeholder="https://..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? '解析中...' : 'URLから解析'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Loading State */}
            {isLoading && (
                <div className="mt-6 p-6 bg-indigo-50 rounded-lg border border-indigo-100 flex flex-col items-center justify-center text-center space-y-3 animate-pulse">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-indigo-700 font-medium">AIが求人情報を分析中です...</p>
                    <p className="text-xs text-indigo-500">これには30秒ほどかかる場合があります</p>
                </div>
            )}
            {/* Manual Input Toggle or Fallback */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => setScrapeFailed(!scrapeFailed)}
                    className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                >
                    <AlertCircle className="w-4 h-4" />
                    URLから取得できない場合はこちら
                </button>

                {scrapeFailed && (
                    <form onSubmit={handleManualSubmit} className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300 space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">求人記事URL (任意)</label>
                            <input
                                type="url"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-gray-400"
                                placeholder="https://..."
                                value={manualUrl}
                                onChange={(e) => setManualUrl(e.target.value)}
                            />
                            <p className="text-xs text-gray-500 mt-1">Notion保存用に記録したい場合は入力してください</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">求人記事全文を貼り付け</label>
                            <textarea
                                rows={8}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="求人情報をここにコピペしてください..."
                                value={manualText}
                                onChange={(e) => setManualText(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !manualText}
                            className="text-sm bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
                        >
                            テキストから解析
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
