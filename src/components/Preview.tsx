"use client";

import { CheckCircle, ExternalLink } from 'lucide-react';

interface PreviewProps {
    data: any;
    onSave: () => void;
    isSaving: boolean;
}

export default function Preview({ data, onSave, isSaving }: PreviewProps) {
    if (!data) return null;

    const { properties } = data;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{properties.title}</h2>
                    <div className="flex gap-2 mt-2">
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full border border-indigo-100">
                            {properties.site}
                        </span>
                        <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-100">
                            {properties.employment_type}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-sm text-gray-500">スキルマッチ</span>
                    <span className="text-xl font-bold text-indigo-600">{properties.skill_match}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">想定年収</h3>
                    <p className="font-medium">
                        {properties.salary_min ? `${properties.salary_min}万` : '?'} 〜 {properties.salary_max ? `${properties.salary_max}万` : '?'}
                    </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-xs font-semibold text-gray-500 mb-2 uppercase">勤務形態</h3>
                    <p className="font-medium">{properties.remote || '不明'} / 通勤 {properties.commute_time}分</p>
                </div>
            </div>

            <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">抽出・生成されたMarkdownプレビュー</h3>
                <div className="h-40 overflow-y-auto p-3 bg-gray-50 border border-gray-200 rounded text-xs font-mono text-gray-600">
                    {data.markdown_content}
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 shadow-sm shadow-green-200 disabled:opacity-70 transition-all hover:-translate-y-0.5"
                >
                    {isSaving ? '保存中...' : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            Notionに保存
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
