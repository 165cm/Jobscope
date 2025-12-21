import { useState, useEffect } from 'react';
import { Briefcase, Loader2, Sparkles, AlertCircle, Save, ExternalLink, RefreshCw, Settings, AlertTriangle, X } from 'lucide-react';
import { analyzeJobPost, type AnalyzeResult } from './lib/openai';
import { saveJobToNotion, updateJobInNotion } from './lib/notion';
import { fetchNotionSchema, loadLocalSchema, saveLocalSchema, compareSchemas, hasSchemaDiff, generatePromptFromSchema, type NotionSchema, type SchemaDiff } from './lib/schema';
import { DynamicFields } from './components/DynamicFields';

function App() {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [url, setUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [savedPageId, setSavedPageId] = useState<string | null>(null);

  // Schema sync state
  const [schema, setSchema] = useState<NotionSchema | null>(null);
  const [schemaDiff, setSchemaDiff] = useState<SchemaDiff | null>(null);
  const [showDiffAlert, setShowDiffAlert] = useState(false);

  // Check schema on mount
  useEffect(() => {
    checkSchema();
  }, []);

  const checkSchema = async () => {
    try {
      const storage = await chrome.storage.local.get(['notion_api_key', 'notion_db_id']);
      if (!storage.notion_api_key || !storage.notion_db_id) return;

      const localSchema = await loadLocalSchema();
      const remoteSchema = await fetchNotionSchema(
        storage.notion_api_key as string,
        storage.notion_db_id as string
      );

      if (localSchema) {
        const diff = compareSchemas(localSchema, remoteSchema);
        if (hasSchemaDiff(diff)) {
          setSchemaDiff(diff);
          setShowDiffAlert(true);
        }
      }

      setSchema(remoteSchema);
    } catch (e) {
      console.error("Schema check failed:", e);
    }
  };

  const acceptSchemaChanges = async () => {
    if (schema) {
      await saveLocalSchema(schema);
      setShowDiffAlert(false);
      setSchemaDiff(null);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setLoading(true);
    setError(null);
    setApiKeyMissing(false);
    setSuccessMsg(null);
    setSavedUrl(null);
    setSavedPageId(null);

    try {
      const storage = await chrome.storage.local.get(['openai_api_key', 'user_profile', 'custom_prompt', 'prompt_role', 'prompt_logic', 'prompt_instructions']);
      const apiKey = storage.openai_api_key;
      const userProfile = (storage.user_profile as string) || "";

      // Prompt Assembly Logic
      // 1. Backward compatibility: If specific prompts are missing but custom_prompt exists, use it.
      // 2. Otherwise assemble: Role + Schema(generated) + Logic

      let finalPrompt = storage.custom_prompt as string; // Default fallback

      // If we have specific components, prioritize them (or if custom_prompt is empty)
      if (storage.prompt_role || storage.prompt_logic || !finalPrompt) {
        const role = storage.prompt_role || (await import('./lib/openai')).DEFAULT_ROLE;
        const logic = storage.prompt_logic || (await import('./lib/openai')).DEFAULT_LOGIC;
        const instructions = (storage.prompt_instructions as Record<string, string>) || {};

        let schemaPrompt = "";
        if (schema) {
          schemaPrompt = generatePromptFromSchema(schema, instructions);
        } else {
          // Fallback if no schema synced yet? 
          // Using generatePromptFromSchema with empty/dummy might be bad.
          // We should probably rely on DEFAULT_PROMPT structure if no schema is found, 
          // BUT we want to enforce the component structure.
          // Let's assume if no schema, we skip the middle part or use a warning?
          // Ideally user MUST sync schema.
          console.warn("No Notion Schema found. Prompt might be incomplete.");
        }

        finalPrompt = `${role}\n\n${schemaPrompt}\n\n${logic}`;
      }

      const apiKeyStr = apiKey as string;
      if (!apiKeyStr) {
        setApiKeyMissing(true);
        setLoading(false);
        setAnalyzing(false);
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("No active tab found");

      let pageText = "";
      let pageUrl = "";

      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: "READ_PAGE_CONTENT" });
        if (response && response.text) {
          pageText = response.text;
          pageUrl = response.url;
          setUrl(response.url);
        } else {
          throw new Error("No response from content script");
        }
      } catch (e) {
        throw new Error("Could not read page content. Try reloading the page.");
      }

      const data = await analyzeJobPost(pageText, pageUrl, apiKeyStr, userProfile, finalPrompt);
      setResult(data);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const handleSaveNotion = async () => {
    if (!result) return;
    setLoading(true);
    setError(null);

    try {
      const storage = await chrome.storage.local.get(['notion_api_key', 'notion_db_id']);
      const apiKey = storage.notion_api_key;
      const dbId = storage.notion_db_id;

      if (!apiKey || !dbId) {
        throw new Error("Please configure Notion API Key and Database ID in Settings.");
      }

      let notionRes;
      if (savedPageId) {
        notionRes = await updateJobInNotion(savedPageId, result, apiKey as string, (url || "") as string);
      } else {
        notionRes = await saveJobToNotion(result, apiKey as string, dbId as string, (url || "") as string);
        setSavedPageId(notionRes.id);
      }

      setSavedUrl(notionRes.url);
      setSuccessMsg(savedPageId ? "Updated!" : "Saved!");

    } catch (err: any) {
      setError(err.message || "Failed to save to Notion");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (!result) return;
    setResult({
      ...result,
      properties: {
        ...result.properties,
        [field]: value
      }
    });
  };

  const openOptions = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  };

  // API Key Missing
  if (apiKeyMissing) {
    return (
      <div className="w-full h-screen bg-gray-50 flex flex-col p-6 items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">API Key Missing</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Please configure your API keys in settings.
        </p>
        <button onClick={openOptions} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Open Settings
        </button>
      </div>
    );
  }

  // Result View
  if (result) {
    return (
      <div className="w-full min-h-[600px] bg-white text-gray-800 text-sm">
        {/* Schema Diff Alert */}
        {showDiffAlert && schemaDiff && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-3 flex items-center gap-2 text-xs text-yellow-800">
            <AlertTriangle size={16} />
            <span className="flex-1">Notionスキーマが変更されました</span>
            <button onClick={acceptSchemaChanges} className="px-2 py-1 bg-yellow-200 rounded hover:bg-yellow-300 text-yellow-900">
              更新
            </button>
            <button onClick={() => setShowDiffAlert(false)} className="p-1 hover:bg-yellow-200 rounded">
              <X size={14} />
            </button>
          </div>
        )}

        <header className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-100 shadow-sm flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <input
              className="font-bold text-base w-full border-none focus:ring-0 p-0 text-gray-900 bg-transparent placeholder-gray-300 truncate"
              value={result.properties.company}
              onChange={(e) => updateField('company', e.target.value)}
              placeholder="Company Name"
            />
            <input
              className="text-xs text-gray-500 w-full border-none focus:ring-0 p-0 bg-transparent placeholder-gray-300 truncate"
              value={result.properties.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Job Title"
            />
          </div>
          <button onClick={() => setResult(null)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
            <X size={18} />
          </button>
        </header>

        <div className="p-4 space-y-4 pb-24">
          {/* Match Score */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Match</span>
            <select
              className="block w-full text-sm font-bold text-blue-700 bg-transparent border-none focus:ring-0 p-0 cursor-pointer"
              value={result.properties.match}
              onChange={(e) => updateField('match', e.target.value)}
            >
              <option value="excellent">◎ 完全一致</option>
              <option value="good">○ ほぼ一致</option>
              <option value="fair">△ 一部一致</option>
              <option value="poor">× 不足あり</option>
            </select>
          </div>

          {/* Fields Section */}
          {schema ? (
            <DynamicFields
              schema={schema}
              values={result.properties}
              onChange={updateField}
            />
          ) : (
            /* Fallback static fields when schema not available */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {/* Source & Employment */}
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-medium uppercase">Source</label>
                  <input className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5" value={result.properties.source || ''} onChange={(e) => updateField('source', e.target.value)} />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-medium uppercase">Employment</label>
                  <input className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5" value={result.properties.employment || ''} onChange={(e) => updateField('employment', e.target.value)} />
                </div>
                {/* Remote & Category */}
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-medium uppercase">Remote</label>
                  <input className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5" value={result.properties.remote || ''} onChange={(e) => updateField('remote', e.target.value)} />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-medium uppercase">Category</label>
                  <input className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5" value={result.properties.category || ''} onChange={(e) => updateField('category', e.target.value)} />
                </div>
                {/* Salary */}
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-medium uppercase">Salary Min (万円)</label>
                  <input type="number" className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5 text-right" value={result.properties.salary_min ?? ''} onChange={(e) => updateField('salary_min', e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-medium uppercase">Salary Max (万円)</label>
                  <input type="number" className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5 text-right" value={result.properties.salary_max ?? ''} onChange={(e) => updateField('salary_max', e.target.value ? Number(e.target.value) : null)} />
                </div>
                {/* Location & Station */}
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-medium uppercase">Location</label>
                  <input className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5" value={result.properties.location || ''} onChange={(e) => updateField('location', e.target.value)} />
                </div>
                <div className="flex flex-col">
                  <label className="text-[10px] text-gray-400 font-medium uppercase">Station</label>
                  <input className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5" value={result.properties.station || ''} onChange={(e) => updateField('station', e.target.value)} />
                </div>
                {/* Skills */}
                <div className="flex flex-col col-span-2">
                  <label className="text-[10px] text-gray-400 font-medium uppercase">Skills</label>
                  <input className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5" value={Array.isArray(result.properties.skills) ? result.properties.skills.join(', ') : ''} onChange={(e) => updateField('skills', e.target.value.split(',').map(s => s.trim()))} placeholder="Comma separated" />
                </div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-2 bg-green-50 text-green-700 text-xs rounded border border-green-200 flex items-center justify-between">
              <span>{successMsg}</span>
              {savedUrl && (
                <a href={savedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 underline hover:text-green-900">
                  Open <ExternalLink size={10} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
          <button
            onClick={handleSaveNotion}
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 disabled:opacity-50 shadow-lg font-medium text-sm transition-transform active:scale-[0.99]"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : (savedPageId ? <RefreshCw size={16} /> : <Save size={16} />)}
            {loading ? "Saving..." : (savedPageId ? "Update Notion" : "Save to Notion")}
          </button>
        </div>
      </div>
    );
  }

  // Home View
  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col p-4">
      <header className="flex items-center justify-between gap-2 mb-6 border-b pb-4 border-gray-200">
        <div className="flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Jobscope</h1>
        </div>
        <button onClick={openOptions} className="p-2 hover:bg-gray-100 rounded-full text-gray-500" title="Settings">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Schema Diff Alert on Home */}
      {showDiffAlert && schemaDiff && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-xs text-yellow-800">
          <AlertTriangle size={16} />
          <span className="flex-1">Notionスキーマ変更あり</span>
          <button onClick={acceptSchemaChanges} className="px-2 py-1 bg-yellow-200 rounded hover:bg-yellow-300">更新</button>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
        <Sparkles className="w-12 h-12 text-blue-100 mb-4" />
        <p className="mb-6 max-w-[200px]">
          Open a job post and click analyze to extract insights.
        </p>

        {analyzing ? (
          <button disabled className="px-6 py-2 bg-blue-400 text-white rounded-lg flex items-center gap-2 cursor-not-allowed">
            <Loader2 className="animate-spin" size={20} />
            Analyzing...
          </button>
        ) : (
          <button
            onClick={handleAnalyze}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm font-medium"
          >
            Analyze This Page
          </button>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded border border-red-100 max-w-full break-words">
            {error}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
