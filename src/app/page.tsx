"use client";

import { useState, useEffect } from 'react';
import JobForm from '@/components/JobForm';
import UserProfileForm from '@/components/UserProfileForm';
import ResumeManager from '@/components/ResumeManager';
import Preview from '@/components/Preview';
import { LayoutDashboard } from 'lucide-react';

export default function Home() {
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Load default resume on mount
  useEffect(() => {
    // Check if we already have a profile set, if so, skip (or maybe we specifically want to load default if empty)
    if (userProfile) return;

    const fetchDefaultResume = async () => {
      try {
        const res = await fetch('/api/resumes');
        if (!res.ok) return;
        const resumes: any[] = await res.json();

        // Find Main resume
        const mainResume = resumes.find((r: any) => r.type === 'main');
        // Fallback to first if no main, or just empty
        const defaultResume = mainResume || resumes[0];

        if (defaultResume && defaultResume.content) {
          setUserProfile(defaultResume.content);
          setResumeName(defaultResume.name || 'Main Resume');
        }
      } catch (e) {
        console.error('Failed to load default resume', e);
      }
    };

    fetchDefaultResume();
  }, [userProfile]);

  const handleAnalyze = async (url: string, manualText?: string) => {
    setAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      let jobText = manualText || '';

      let targetUrl = url;
      // User requested to keep parameters, so we skip cleaning.
      // try {
      //   if(url) {
      //       const u = new URL(url);
      //       targetUrl = `${u.origin}${u.pathname}`; 
      //   }
      // } catch (e) { ... }

      // 1. Scrape if no manual text
      if (!jobText && url) {
        try {
          const scrapeRes = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });

          if (!scrapeRes.ok) {
            const errJson = await scrapeRes.json();
            // If scrape fails, we don't throw immediately if we want to encourage manual input,
            // but here we are in the "Automatic" flow.
            // We throw to show error.
            throw new Error(errJson.error || 'Scraping failed');
          }

          const scrapeData = await scrapeRes.json();
          jobText = scrapeData.text;

        } catch (e: any) {
          console.error('Scrape error:', e);
          // Show error but allow user to continue if they provide manual text next time?
          // For now just error out.
          throw new Error(`求人票の取得に失敗しました: ${e.message}。手動入力機能を使用してください。`);
        }
      }

      // 2. Analyze
      const analyzeRes = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobDescription: jobText,
          userProfile: userProfile,
          url: targetUrl
        }),
      });

      if (!analyzeRes.ok) {
        const errJson = await analyzeRes.json();
        throw new Error(errJson.error || 'Analysis failed');
      }

      const info = await analyzeRes.json();
      const resultData = { ...info, url: targetUrl };
      setAnalysisResult(resultData);

      // Auto-save
      await handleSave(resultData);

    } catch (e: any) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async (dataToSave?: any) => {
    const targetData = dataToSave || analysisResult;
    if (!targetData) return;

    setSaving(true);
    try {
      const saveRes = await fetch('/api/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetData),
      });

      if (!saveRes.ok) {
        const errJson = await saveRes.json();
        throw new Error(errJson.error || 'Save failed');
      }

      // Success notification (Toast/Alert) - Keeping it simple or maybe just subtle
      // alert('Notionへの保存が完了しました！🎉'); 
      // Auto-save shouldn't interrupt with alert ideally, but user asked for functionality.
      // Let's use a console log or local UI state to show compatibility.
      // For now, removing alert to make it smooth, maybe just set a "Saved" flag if needed.
      console.log('Auto-saved to Notion');

    } catch (e: any) {
      setError(`保存エラー: ${e.message}`); // Show save error in the main error box
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Jobscope</h1>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-sm underline hover:text-red-800">閉じる</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Input Area */}
          <div className="lg:col-span-2 space-y-8">
            <JobForm
              onAnalyze={handleAnalyze}
              isLoading={analyzing}
              resumeContent={userProfile}
            />

            {/* Result Preview */}
            {analysisResult && (
              <Preview data={analysisResult} onSave={handleSave} isSaving={saving} />
            )}
          </div>

          {/* Sidebar (Profile & Resumes) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* 1. Resume Manager (Version Control) */}
              <ResumeManager
                onSelect={(content: string, name: string) => {
                  setUserProfile(content);
                }}
                jobDescription={analysisResult?.markdown_content || analysisResult?.jobDescription}
                reloadTrigger={reloadTrigger}
              />

              {/* 2. Manual Edit/View (UserProfileForm) */}
              <UserProfileForm
                onProfileChange={setUserProfile}
                onUploadComplete={() => setReloadTrigger(prev => prev + 1)}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
