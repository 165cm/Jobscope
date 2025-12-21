import { useState } from 'react';

export const useJobAnalysis = (userProfile: string) => {
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async (url: string, manualText?: string) => {
        setAnalyzing(true);
        setError(null);
        setAnalysisResult(null);

        try {
            let jobText = manualText || '';
            let targetUrl = url;

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
                        throw new Error(errJson.error || 'Scraping failed');
                    }

                    const scrapeData = await scrapeRes.json();
                    jobText = scrapeData.text;

                } catch (e: any) {
                    console.error('Scrape error:', e);
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

            return resultData;

        } catch (e: any) {
            setError(e.message);
            return null;
        } finally {
            setAnalyzing(false);
        }
    };

    return {
        analyzing,
        analysisResult,
        error,
        setError,
        handleAnalyze,
        setAnalysisResult
    };
};
