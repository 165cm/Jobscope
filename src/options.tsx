import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Save, Lock, ExternalLink, RefreshCw, Wand2, Database, AlertCircle } from 'lucide-react';
import './index.css';
import { DEFAULT_ROLE, DEFAULT_LOGIC } from './lib/openai';
import { fetchNotionSchema, saveLocalSchema, DEFAULT_PROPERTY_INSTRUCTIONS, type NotionSchema } from './lib/schema';

function Options() {
    const [openAIKey, setOpenAIKey] = useState('');
    const [notionKey, setNotionKey] = useState('');
    const [notionDbId, setNotionDbId] = useState('');

    // Split Prompt States
    const [promptRole, setPromptRole] = useState(DEFAULT_ROLE);
    const [promptLogic, setPromptLogic] = useState(DEFAULT_LOGIC);
    const [localSchema, setLocalSchema] = useState<NotionSchema | null>(null);
    const [propertyInstructions, setPropertyInstructions] = useState<Record<string, string>>({});

    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'api' | 'prompt'>('api');

    useEffect(() => {
        // Load settings
        chrome.storage.local.get(
            ['openai_api_key', 'notion_api_key', 'notion_db_id', 'prompt_role', 'prompt_logic', 'notion_schema', 'prompt_instructions'],
            (result) => {
                if (result.openai_api_key) setOpenAIKey(result.openai_api_key as string);
                if (result.notion_api_key) setNotionKey(result.notion_api_key as string);
                if (result.notion_db_id) setNotionDbId(result.notion_db_id as string);

                if (result.prompt_role) setPromptRole(result.prompt_role as string);
                if (result.prompt_logic) setPromptLogic(result.prompt_logic as string);

                if (result.notion_schema) {
                    setLocalSchema(result.notion_schema as NotionSchema);
                }

                // Initialize instructions combined with defaults
                const storedInstructions = (result.prompt_instructions as Record<string, string>) || {};
                setPropertyInstructions({ ...DEFAULT_PROPERTY_INSTRUCTIONS, ...storedInstructions });
            }
        );
    }, []);

    const saveOptions = () => {
        setLoading(true);
        chrome.storage.local.set(
            {
                openai_api_key: openAIKey,
                notion_api_key: notionKey,
                notion_db_id: notionDbId,
                prompt_role: promptRole,
                prompt_logic: promptLogic,
                prompt_instructions: propertyInstructions,
            },
            () => {
                setLoading(false);
                setStatus('設定を保存しました！');
                setTimeout(() => setStatus(''), 2000);
            }
        );
    };

    const resetPrompt = () => {
        if (confirm('プロンプト設定（役割・ロジック・抽出指示）をすべてデフォルトに戻しますか？')) {
            setPromptRole(DEFAULT_ROLE);
            setPromptLogic(DEFAULT_LOGIC);
            setPropertyInstructions({ ...DEFAULT_PROPERTY_INSTRUCTIONS });
            setStatus('プロンプトをリセットしました');
            setTimeout(() => setStatus(''), 2000);
        }
    };

    const updateInstruction = (propName: string, text: string) => {
        setPropertyInstructions(prev => ({ ...prev, [propName]: text }));
    };

    const syncSchema = async () => {
        if (!notionKey || !notionDbId) {
            setError('Notion API KeyとDatabase IDを設定してください');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const schema = await fetchNotionSchema(notionKey, notionDbId);
            await saveLocalSchema(schema);
            setLocalSchema(schema);
            // Also reset/merge new instructions? simpler to keep current ones
            setStatus('Notionスキーマを同期しました！');
        } catch (err: any) {
            setError(err.message || 'スキーマ同期に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    // Sort logic for display
    const sortedProperties = localSchema ? [...localSchema.properties].sort((a, b) => {
        const priority = ["Name", "company", "Job Title", "title"];
        const ia = priority.indexOf(a.name);
        const ib = priority.indexOf(b.name);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return 0;
    }) : [];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-100">
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

                        <div className="pt-4 border-t border-gray-100">
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

                        {/* Schema Sync Button */}
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                    <Database size={16} /> Notionスキーマ同期
                                </h4>
                                <p className="text-xs text-blue-600 mt-1">
                                    Notionのプロパティ構造を取得して、AIプロンプトを自動更新します。
                                </p>
                                {localSchema && (
                                    <p className="text-[10px] text-blue-400 mt-1">
                                        最終同期: {new Date(localSchema.fetchedAt).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={syncSchema}
                                disabled={loading || !notionKey || !notionDbId}
                                className={`px-3 py-1.5 rounded text-xs font-bold text-white transition-colors flex items-center gap-1 ${loading || !notionKey || !notionDbId ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                                {loading ? '同期中...' : '同期する'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Prompt Tab */}
                {activeTab === 'prompt' && (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Wand2 size={20} /> プロンプト構成
                            </h3>
                            <button
                                onClick={resetPrompt}
                                className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
                            >
                                <RefreshCw size={12} /> 一括リセット
                            </button>
                        </div>

                        {/* 1. Role */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700 flex items-center gap-2">
                                🤖 役割・目的
                            </label>
                            <p className="text-xs text-gray-500">AIのエージェント設定と主な目的を定義します。</p>
                            <textarea
                                value={promptRole}
                                onChange={(e) => setPromptRole(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-blue-200 rounded-md text-xs font-mono text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                            />
                        </div>

                        {/* 2. Schema List (Editable Instructions) */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold text-gray-700 flex items-center gap-1">
                                    📋 出力スキーマ & 抽出ルール
                                </label>
                                {!localSchema && (
                                    <span className="text-xs text-red-500 flex items-center gap-1">
                                        <AlertCircle size={12} /> 未同期 (APIタブで同期してください)
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-gray-500">
                                Notionの各プロパティに対して、AIへの抽出指示をカスタマイズできます。
                            </p>

                            {localSchema ? (
                                <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Property</th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Type</th>
                                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instruction</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {sortedProperties.map((prop) => (
                                                !['created_time', 'last_edited_time', 'created_by', 'last_edited_by'].includes(prop.type) && (
                                                    <tr key={prop.id}>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                                                            {prop.name}
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                {prop.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                                            <input
                                                                type="text"
                                                                value={propertyInstructions[prop.name] || ''}
                                                                onChange={(e) => updateInstruction(prop.name, e.target.value)}
                                                                placeholder="例: 正式名称で抽出"
                                                                className="w-full border-none focus:ring-0 text-xs bg-transparent p-0 placeholder-gray-300"
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-100 rounded-md text-center text-xs text-gray-500">
                                    スキーマが読み込まれていません。API設定画面で「同期」を行ってください。
                                </div>
                            )}
                        </div>

                        {/* 3. Logic */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">
                                🧠 判定ロジック
                            </label>
                            <p className="text-xs text-gray-500">
                                Booleanフラグ（残業、リモートなど）の判定基準を定義します。
                            </p>
                            <textarea
                                value={promptLogic}
                                onChange={(e) => setPromptLogic(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-blue-200 rounded-md text-xs font-mono text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                            />
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-100">
                    <button
                        onClick={saveOptions}
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <Save className="h-5 w-5 text-blue-500 group-hover:text-blue-400" aria-hidden="true" />
                        </span>
                        {loading ? '保存中...' : '設定を保存'}
                    </button>
                </div>

                {(status || error) && (
                    <div className={`text-center text-sm font-medium ${error ? 'text-red-600' : 'text-green-600'} animate-pulse`}>
                        {error || status}
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
