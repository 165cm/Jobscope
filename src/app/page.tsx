"use client";

import { useState, useEffect } from 'react';
import JobForm from '@/components/JobForm';
import UserProfileForm from '@/components/UserProfileForm';
import ResumeManager from '@/components/ResumeManager';
import Preview from '@/components/Preview';
import { LayoutDashboard } from 'lucide-react';
import { useJobAnalysis } from '@/hooks/useJobAnalysis';

export default function Home() {
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState('');
  const [resumeName, setResumeName] = useState('');
  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Custom Hook for Analysis Logic
  const {
    analyzing,
    analysisResult,
    error,
    setError,
    handleAnalyze: analyzeJob,
    setAnalysisResult
  } = useJobAnalysis(userProfile);

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
    const result = await analyzeJob(url, manualText);

    if (result) {
      // Auto-save if analysis was successful
      await handleSave(result);
    }
  };

  const handleSave = async (dataToSave?: any) => {
    // Safety check: ensure dataToSave is not a DOM event
    const isEvent = dataToSave && (dataToSave.nativeEvent || dataToSave.preventDefault);
    const targetData = (dataToSave && !isEvent) ? dataToSave : analysisResult;
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

      console.log('Auto-saved to Notion');

    } catch (e: any) {
      setError(`保存エラー: ${e.message}`);
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
              <Preview
                data={analysisResult}
                onSave={handleSave}
                isSaving={saving}
                onUpdate={setAnalysisResult}
              />
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
