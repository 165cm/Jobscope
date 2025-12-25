
// Listen for messages from the sidepanel or background script
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.action === "READ_PAGE_CONTENT") {
        // Extract text content from the body
        const text = document.body.innerText;

        // === フェーズ3 改善: メタデータ抽出強化 ===
        const metadata = {
            title: document.title,
            // Open Graph タグから追加情報を取得
            ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || null,
            ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute('content') || null,
            ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content') || null,
            // JSON-LD構造化データを取得（求人情報など）
            jsonLd: (() => {
                try {
                    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
                    return Array.from(scripts).map(script => {
                        try { return JSON.parse(script.textContent || ''); }
                        catch { return null; }
                    }).filter(Boolean);
                } catch { return []; }
            })()
        };

        sendResponse({
            success: true,
            text: text,
            url: window.location.href,
            metadata: metadata
        });
    }
    return true; // Indicates we wish to respond asynchronously if needed
});
