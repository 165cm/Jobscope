import { useState } from 'react';
import { Briefcase, Loader2, Sparkles, AlertCircle, Save, ExternalLink, RefreshCw, Settings, Check, X } from 'lucide-react';
import { analyzeJobPost, type AnalyzeResult } from './lib/openai';
import { saveJobToNotion, updateJobInNotion } from './lib/notion';

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

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setLoading(true);
    setError(null);
    setApiKeyMissing(false);
    setSuccessMsg(null);
    setSavedUrl(null);
    setSavedPageId(null);

    try {
      const storage = await chrome.storage.local.get(['openai_api_key', 'user_profile']);
      const apiKey = storage.openai_api_key;
      const userProfile = (storage.user_profile as string) || "";

      if (!apiKey) {
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

      const data = await analyzeJobPost(pageText, pageUrl, apiKey as string, userProfile);
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
      setSuccessMsg(savedPageId ? "Updated Notion page successfully!" : "Saved to Notion successfully!");

    } catch (err: any) {
      setError(err.message || "Failed to save to Notion");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof AnalyzeResult['properties'], value: any) => {
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

  const BooleanFlag = ({ label, value, field }: { label: string, value: boolean, field: keyof AnalyzeResult['properties'] }) => (
    <div
      className={`flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer select-none transition-colors ${value ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}
      onClick={() => updateField(field, !value)}
    >
      {value ? <Check size={12} /> : <X size={12} />}
      {label}
    </div>
  );

  const CompactField = ({ label, value, field, type = "text", options = [] }: any) => (
    <div className="flex flex-col">
      <label className="text-[10px] text-gray-400 font-medium uppercase">{label}</label>
      {type === 'select' ? (
        <select
          className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5 w-full truncate"
          value={value}
          onChange={(e) => updateField(field, e.target.value)}
        >
          {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          className="text-xs border-b border-gray-200 focus:border-blue-500 outline-none bg-transparent py-0.5 w-full overflow-hidden text-ellipsis"
          value={value || ''}
          onChange={(e) => updateField(field, type === 'number' ? Number(e.target.value) : e.target.value)}
        />
      )}
    </div>
  );

  if (apiKeyMissing) {
    return (
      <div className="w-full h-screen bg-gray-50 flex flex-col p-6 items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">API Key Missing</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Please configure your OpenAI API Key in the settings to use Jobscope.
        </p>
        <button onClick={openOptions} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Open Settings
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="w-full min-h-[600px] bg-white text-gray-800 text-sm"> {/* Extended height */}
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

        <div className="p-4 space-y-4 pb-24"> {/* Main Content with padding for fixed footer */}

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

          {/* 2. Key Info Grid (Compact) */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <CompactField label="Employment" field="employment" value={result.properties.employment} type="select" options={["fulltime", "contract", "freelance", "other"]} />
            <CompactField label="Remote" field="remote" value={result.properties.remote} type="select" options={["フルリモート", "週一部リモート", "リモート可", "なし", "不明"]} />

            <div className="col-span-2">
              <label className="text-[10px] text-gray-400 font-medium uppercase">Salary (万円)</label>
              <div className="flex items-center gap-2">
                <input className="text-sm font-medium w-20 border-b border-gray-200 text-right focus:border-blue-500 outline-none" type="number" value={result.properties.salary_min || ''} onChange={(e) => updateField('salary_min', Number(e.target.value))} />
                <span className="text-gray-400">-</span>
                <input className="text-sm font-medium w-20 border-b border-gray-200 text-right focus:border-blue-500 outline-none" type="number" value={result.properties.salary_max || ''} onChange={(e) => updateField('salary_max', Number(e.target.value))} />
              </div>
            </div>

            <CompactField label="Location" field="location" value={result.properties.location} />
            <CompactField label="Station" field="station" value={result.properties.station} />
            <CompactField label="Employees" field="employees" value={result.properties.employees} />
            <CompactField label="Avg Age" field="avg_age" value={result.properties.avg_age} />
            <CompactField label="Source" field="source" value={result.properties.source} />
            <CompactField label="Category" field="category" value={result.properties.category} />
            <CompactField label="Age Limit" field="age_limit" value={result.properties.age_limit} />
            <CompactField label="Side Job" field="side_job" value={result.properties.side_job} />
          </div>

          {/* 3. Flags (Tags) */}
          <div>
            <label className="text-[10px] text-gray-400 font-medium uppercase mb-1 block">Conditions</label>
            <div className="flex flex-wrap gap-2">
              <BooleanFlag label="裁量権" value={result.properties.autonomy} field="autonomy" />
              <BooleanFlag label="FB文化" value={result.properties.feedback} field="feedback" />
              <BooleanFlag label="チーム等" value={result.properties.teamwork} field="teamwork" />
              <BooleanFlag label="長通勤" value={result.properties.long_commute} field="long_commute" />
              <BooleanFlag label="残業多" value={result.properties.overwork} field="overwork" />
            </div>
          </div>

          {/* 4. Skills (Simple Text Area for now, or CSV input) */}
          <div>
            <label className="text-[10px] text-gray-400 font-medium uppercase mb-1 block">Skills</label>
            <textarea
              className="w-full text-xs border rounded p-2 focus:border-blue-500 outline-none text-gray-600 bg-gray-50 h-16 resize-none"
              value={result.properties.skills.join(', ')}
              onChange={(e) => updateField('skills', e.target.value.split(',').map(s => s.trim()))}
            />
          </div>

          {/* Status Messages */}
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-2 bg-green-50 text-green-700 text-xs rounded border border-green-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Check size={14} />
                {successMsg}
              </div>
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
            {loading ? "Saving..." : (savedPageId ? "Update Notion Page" : "Save to Notion")}
          </button>
        </div>
      </div>
    );
  }

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
