import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Save, Lock, ExternalLink, RefreshCw, Wand2, Database, AlertCircle, Eye, ChevronDown, ChevronRight, Zap, Plus, X } from 'lucide-react';
import './index.css';
import { DEFAULT_ROLE, DEFAULT_LOGIC, DEFAULT_CONTENT_PROMPT } from './lib/openai';
import { fetchNotionSchema, saveLocalSchema, generatePromptFromSchema, DEFAULT_PROPERTY_INSTRUCTIONS, type NotionSchema } from './lib/schema';

// Model Definition
interface ModelDef {
    id: string;
    name: string;
    inputPrice: number; // USD per 1M tokens
    outputPrice: number; // USD per 1M tokens
}

const DEFAULT_MODELS: ModelDef[] = [
    { id: 'gpt-4o-mini', name: 'GPT-4o mini (推奨: 安価＆高速)', inputPrice: 0.15, outputPrice: 0.60 },
    { id: 'gpt-5-nano', name: 'GPT-5 Nano (最新・最安)', inputPrice: 0.08, outputPrice: 0.32 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', inputPrice: 0.50, outputPrice: 1.50 },
];

function Options() {
    const [openAIKey, setOpenAIKey] = useState('');
    const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
    const [customModels, setCustomModels] = useState<ModelDef[]>([]);

    // Add Model State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newModel, setNewModel] = useState<Partial<ModelDef>>({});

    const [notionKey, setNotionKey] = useState('');
    const [notionDbId, setNotionDbId] = useState('');

    const [promptRole, setPromptRole] = useState(DEFAULT_ROLE);
    const [promptLogic, setPromptLogic] = useState(DEFAULT_LOGIC);
    const [promptContent, setPromptContent] = useState(DEFAULT_CONTENT_PROMPT);
    const [localSchema, setLocalSchema] = useState<NotionSchema | null>(null);
    const [propertyInstructions, setPropertyInstructions] = useState<Record<string, string>>({});
    const [showPreview, setShowPreview] = useState(false);

    const [status, setStatus] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'api' | 'prompt'>('api');

    useEffect(() => {
        // Load settings
        chrome.storage.local.get(
            ['openai_api_key', 'openai_model', 'custom_models', 'notion_api_key', 'notion_db_id', 'prompt_role', 'prompt_logic', 'prompt_content', 'notion_schema', 'prompt_instructions'],
            (result) => {
                if (result.openai_api_key) setOpenAIKey(result.openai_api_key as string);
                if (result.openai_model) setOpenaiModel(result.openai_model as string);
                if (result.custom_models) setCustomModels(result.custom_models as ModelDef[]);

                if (result.notion_api_key) setNotionKey(result.notion_api_key as string);
                if (result.notion_db_id) setNotionDbId(result.notion_db_id as string);

                if (result.prompt_role) setPromptRole(result.prompt_role as string);
                if (result.prompt_logic) setPromptLogic(result.prompt_logic as string);
                if (result.prompt_content) setPromptContent(result.prompt_content as string);

                if (result.notion_schema) {
                    setLocalSchema(result.notion_schema as NotionSchema);
                }

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
                openai_model: openaiModel,
                custom_models: customModels,
                notion_api_key: notionKey,
                notion_db_id: notionDbId,
                prompt_role: promptRole,
                prompt_logic: promptLogic,
                prompt_content: promptContent,
                prompt_instructions: propertyInstructions,
            },
            () => {
                setLoading(false);
                setStatus('設定を保存しました！');
                setTimeout(() => setStatus(''), 2000);
            }
        );
    };

    const handleAddModel = () => {
        if (!newModel.id || !newModel.name || !newModel.inputPrice || !newModel.outputPrice) {
            setError("全ての項目を入力してください");
            return;
        }
        const model: ModelDef = {
            id: newModel.id,
            name: newModel.name,
            inputPrice: Number(newModel.inputPrice),
            outputPrice: Number(newModel.outputPrice),
        };
        setCustomModels([...customModels, model]);
        setOpenaiModel(model.id); // Switch to new model
        setNewModel({});
        setShowAddForm(false);
        setError('');
    };

    const resetPrompt = () => {
        if (confirm('プロンプト設定をデフォルトに戻しますか？')) {
            setPromptRole(DEFAULT_ROLE);
            setPromptLogic(DEFAULT_LOGIC);
            setPromptContent(DEFAULT_CONTENT_PROMPT);
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
            setStatus('Notionスキーマを同期しました！');
        } catch (err: any) {
            setError(err.message || 'スキーマ同期に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    // Derived Data
    const allModels = [...DEFAULT_MODELS, ...customModels];
    const currentModelDef = allModels.find(m => m.id === openaiModel) || DEFAULT_MODELS[0];

    // Cost Calc: (Input * 3000 + Output * 500) / 1M * 150JPY
    const costUsd = (currentModelDef.inputPrice * 3000 + currentModelDef.outputPrice * 500) / 1000000;
    const costJpy = costUsd * 150;

    // Helper for sorting properties
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
                        🔑 APIキー & モデル
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
                    <div className="space-y-6">
                        {/* OpenAI Section */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">OpenAI API キー</label>
                                <input
                                    type="password"
                                    value={openAIKey}
                                    onChange={(e) => setOpenAIKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline mt-1 inline-block">
                                    APIキーを取得
                                </a>
                            </div>

                            {/* Compact Model Selector */}
                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                        <Zap size={16} className="text-yellow-500" /> 使用モデル
                                    </label>
                                    <a href="https://platform.openai.com/docs/pricing" target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                        価格表 <ExternalLink size={10} />
                                    </a>
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={openaiModel}
                                        onChange={(e) => setOpenaiModel(e.target.value)}
                                        className="flex-1 block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                    >
                                        {allModels.map(model => (
                                            <option key={model.id} value={model.id}>{model.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => setShowAddForm(!showAddForm)}
                                        className={`px-3 py-2 rounded-md border text-gray-600 hover:bg-gray-200 transition-colors ${showAddForm ? 'bg-gray-200' : 'bg-white'}`}
                                        title="モデルを追加"
                                    >
                                        {showAddForm ? <X size={16} /> : <Plus size={16} />}
                                    </button>
                                </div>

                                <div className="mt-1 text-right">
                                    <p className="text-xs text-gray-500">
                                        推定コスト: <span className="font-bold text-gray-800">{costJpy.toFixed(2)}円</span> / 1求人
                                        <span className="text-[10px] text-gray-400 ml-1">(Input 3k + Output 0.5k tokens)</span>
                                    </p>
                                </div>

                                {/* Add Model Form */}
                                {showAddForm && (
                                    <div className="mt-3 p-3 bg-white rounded border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                                        <h4 className="text-xs font-bold text-gray-700 mb-2">新規モデル追加</h4>
                                        <div className="space-y-2">
                                            <input
                                                placeholder="Model ID (例: gpt-5-turbo)"
                                                value={newModel.id || ''}
                                                onChange={e => setNewModel({ ...newModel, id: e.target.value })}
                                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                            />
                                            <input
                                                placeholder="表示名 (例: GPT-5 Turbo)"
                                                value={newModel.name || ''}
                                                onChange={e => setNewModel({ ...newModel, name: e.target.value })}
                                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                            />
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-gray-500 block">Input ($/1M tokens)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="0.15"
                                                        value={newModel.inputPrice || ''}
                                                        onChange={e => setNewModel({ ...newModel, inputPrice: Number(e.target.value) })}
                                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[10px] text-gray-500 block">Output ($/1M tokens)</label>
                                                    <input
                                                        type="number"
                                                        placeholder="0.60"
                                                        value={newModel.outputPrice || ''}
                                                        onChange={e => setNewModel({ ...newModel, outputPrice: Number(e.target.value) })}
                                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleAddModel}
                                                className="w-full mt-2 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700"
                                            >
                                                リストに追加
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notion Section */}
                        <div className="pt-6 border-t border-gray-100 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Notion インテグレーション</label>
                                <input
                                    type="password"
                                    value={notionKey}
                                    onChange={(e) => setNotionKey(e.target.value)}
                                    placeholder="secret_..."
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Notion データベースID</label>
                                <input
                                    type="text"
                                    value={notionDbId}
                                    onChange={(e) => setNotionDbId(e.target.value)}
                                    placeholder="Database ID"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>

                            {/* Schema Sync */}
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-200">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <Database size={16} /> Notionスキーマ同期
                                    </h4>
                                    {localSchema ? (
                                        <p className="text-[10px] text-gray-500 mt-1">最終同期: {new Date(localSchema.fetchedAt).toLocaleString()}</p>
                                    ) : (
                                        <p className="text-[10px] text-red-400 mt-1">未同期</p>
                                    )}
                                </div>
                                <button
                                    onClick={syncSchema}
                                    disabled={loading || !notionKey || !notionDbId}
                                    className={`px-3 py-1.5 rounded text-xs font-bold text-white transition-colors flex items-center gap-1 ${loading || !notionKey || !notionDbId ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-800'
                                        }`}
                                >
                                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                                    {loading ? '同期' : '同期'}
                                </button>
                            </div>
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
                            <textarea
                                value={promptRole}
                                onChange={(e) => setPromptRole(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-blue-200 rounded-md text-xs font-mono text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                            />
                        </div>

                        {/* 2. Schema List */}
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
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">{prop.name}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{prop.type}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">
                                                            <input
                                                                type="text"
                                                                value={propertyInstructions[prop.name] || ''}
                                                                onChange={(e) => updateInstruction(prop.name, e.target.value)}
                                                                className="w-full border-none focus:ring-0 text-xs bg-transparent p-0 placeholder-gray-300"
                                                                placeholder="抽出指示..."
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            ))}
                                        </tbody>
                                    </table>

                                    {/* Preview Section */}
                                    <div className="bg-gray-50 border-t border-gray-200 p-2">
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="w-full flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium py-1"
                                        >
                                            {showPreview ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            <Eye size={14} />
                                            AIに送信されるスキーマ指示を確認する
                                        </button>

                                        {showPreview && (
                                            <div className="mt-2 p-2">
                                                <p className="text-[10px] text-gray-500 mb-1">
                                                    ※ 以下のテキストが、プロパティの定義としてAIに送信されます。
                                                </p>
                                                <div className="text-[10px] font-mono text-gray-700 whitespace-pre-wrap h-40 overflow-y-auto border border-gray-200 bg-white p-2 rounded shadow-inner">
                                                    {generatePromptFromSchema(localSchema, propertyInstructions)}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-100 rounded text-center text-xs text-gray-500">スキーマ未同期</div>
                            )}
                        </div>

                        {/* 3. Logic */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">🧠 判定ロジック</label>
                            <textarea
                                value={promptLogic}
                                onChange={(e) => setPromptLogic(e.target.value)}
                                rows={6}
                                className="w-full px-3 py-2 border border-blue-200 rounded-md text-xs font-mono text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
                            />
                        </div>

                        {/* 4. Content */}
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-gray-700">📝 コンテンツ生成ルール</label>
                            <textarea
                                value={promptContent}
                                onChange={(e) => setPromptContent(e.target.value)}
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
