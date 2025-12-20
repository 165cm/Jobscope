"use client";

import { useState } from 'react';
import { Search, AlertCircle, FileText } from 'lucide-react';

interface JobFormProps {
    onAnalyze: (url: string, manualText?: string) => void;
    isLoading: boolean;
}

export default function JobForm({ onAnalyze, isLoading }: JobFormProps) {
    const [url, setUrl] = useState('');
    const [scrapeFailed, setScrapeFailed] = useState(false);
    const [manualText, setManualText] = useState('');

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;
        setScrapeFailed(false);

        // Attempt scrape check (optional, or just pass to parent)
        // Here we let the parent handle the API call.
        // If parent detects failure, it should call setScrapeFailed(true) via some prop?
        // Actually, let's do the scrape fetch here to enable the "Fallback" UI logic locally?
        // No, better to keep logic in page.tsx or helper.
        // But for the "If URL fails, show text box" requirement:
        // Let's pass both to the parent handler.
        onAnalyze(url);
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAnalyze('', manualText);
    };

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

            {/* Manual Input Toggle or Fallback */}
            <div className="mt-6 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={() => setScrapeFailed(!scrapeFailed)}
                    className="text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1"
                >
                    <AlertCircle className="w-4 h-4" />
                    URLから取得できない場合はこちら
                </button>

                {scrapeFailed && (
                    <form onSubmit={handleManualSubmit} className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-medium text-gray-700 mb-1">求人記事全文を貼り付け</label>
                        <textarea
                            rows={8}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="求人情報をここにコピペしてください..."
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !manualText}
                            className="mt-2 text-sm bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900"
                        >
                            テキストから解析
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
