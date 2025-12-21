import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Save, Lock, ExternalLink, RefreshCw, Wand2 } from 'lucide-react';
import './index.css';

const DEFAULT_PROMPT = `You are a career assistant "Jobscope".
Process the following Job Description and User Profile (if provided).
Extract key information to save into a Notion Database.

Requirements:
1. Extract the following fields for Notion Properties:
   - Company Name (企業名) - company
   - Job Title (職種名) - title (exclude company name)
   - Source - source (detect from URL: Green, Wantedly, etc.)
   - Employment - employment (fulltime/contract/freelance/other)
   - Remote - remote (フルリモート/週一部リモート/リモート可/なし/不明)
   - Salary Min/Max - salary_min, salary_max (in 万円)
   - Location - location
   - Station - station (nearest station)
   - Skills - skills (array of tech/skills mentioned)
   - Category - category (engineering/design/sales/etc)
   - Match - match (excellent/good/fair/poor based on profile)
   - Flags (boolean): autonomy, feedback, teamwork, long_commute, overwork

2. Generate a report markdown summarizing the job.

Output must be JSON format:
{
  "properties": { ... },
  "markdown_content": "..."
}`;

function Options() {
    const [openAIKey, setOpenAIKey] = useState('');
    const [notionKey, setNotionKey] = useState('');
    const [notionDbId, setNotionDbId] = useState('');
    const [customPrompt, setCustomPrompt] = useState('');
    const [status, setStatus] = useState('');
    const [activeTab, setActiveTab] = useState<'api' | 'prompt'>('api');

    useEffect(() => {
        chrome.storage.local.get(['openai_api_key', 'notion_api_key', 'notion_db_id', 'custom_prompt'], (result) => {
            if (result.openai_api_key) setOpenAIKey(result.openai_api_key as string);
            if (result.notion_api_key) setNotionKey(result.notion_api_key as string);
            if (result.notion_db_id) setNotionDbId(result.notion_db_id as string);
            setCustomPrompt((result.custom_prompt as string) || DEFAULT_PROMPT);
        });
    }, []);

    const saveOptions = () => {
        chrome.storage.local.set(
            {
                openai_api_key: openAIKey,
                notion_api_key: notionKey,
                notion_db_id: notionDbId,
                custom_prompt: customPrompt,
            },
            () => {
                setStatus('設定を保存しました！');
                setTimeout(() => setStatus(''), 2000);
            }
        );
    };

    const resetPrompt = () => {
        setCustomPrompt(DEFAULT_PROMPT);
        setStatus('プロンプトをリセットしました');
        setTimeout(() => setStatus(''), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
                        <Lock className="w-8 h-8 text-blue-600" />
                        Jobscope 設定
                    </h2>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('api')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'api' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    >
                        🔑 APIキー
                    </button>
                    <button
                        onClick={() => setActiveTab('prompt')}
                        className={`px-4 py-2 text-sm font-medium ${activeTab === 'prompt' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                    >
                        ✨ プロンプト編集
                    </button>
                </div>

                {/* API Tab */}
                {activeTab === 'api' && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="openai-key" className="block text-sm font-medium text-gray-700">
                                OpenAI API キー
                            </label>
                            <input
                                id="openai-key"
                                type="password"
                                value={openAIKey}
                                onChange={(e) => setOpenAIKey(e.target.value)}
                                placeholder="sk-..."
                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <a
                                href="https://platform.openai.com/api-keys"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1"
                            >
                                APIキーを取得 <ExternalLink size={10} />
                            </a>
                        </div>

                        <div>
                            <label htmlFor="notion-key" className="block text-sm font-medium text-gray-700">
                                Notion インテグレーション
                            </label>
                            <input
                                id="notion-key"
                                type="password"
                                value={notionKey}
                                onChange={(e) => setNotionKey(e.target.value)}
                                placeholder="secret_..."
                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <a
                                href="https://www.notion.so/my-integrations"
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1"
                            >
                                インテグレーション作成 <ExternalLink size={10} />
                            </a>
                        </div>

                        <div>
                            <label htmlFor="notion-db" className="block text-sm font-medium text-gray-700">
                                Notion データベースID
                            </label>
                            <input
                                id="notion-db"
                                type="text"
                                value={notionDbId}
                                onChange={(e) => setNotionDbId(e.target.value)}
                                placeholder="Database ID"
                                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                データベースのURLに含まれています： notion.so/.../<b>database_id</b>?...
                            </p>
                        </div>
                    </div>
                )}

                {/* Prompt Tab */}
                {activeTab === 'prompt' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                                <Wand2 size={16} /> カスタムプロンプト
                            </label>
                            <button
                                onClick={resetPrompt}
                                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                            >
                                <RefreshCw size={12} /> デフォルトに戻す
                            </button>
                        </div>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            rows={18}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-mono text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-y"
                            placeholder="AIへの指示を入力..."
                        />
                        <p className="text-xs text-gray-500">
                            このプロンプトがAI解析時に使用されます。Notionスキーマに合わせてカスタマイズできます。
                        </p>
                    </div>
                )}

                {/* Save Button */}
                <div>
                    <button
                        onClick={saveOptions}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <Save className="h-5 w-5 text-blue-500 group-hover:text-blue-400" aria-hidden="true" />
                        </span>
                        設定を保存
                    </button>
                </div>

                {status && (
                    <div className="text-center text-sm font-medium text-green-600 animate-pulse">
                        {status}
                    </div>
                )}
            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>
);
