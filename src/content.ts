
// Listen for messages from the sidepanel or background script
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
    if (request.action === "READ_PAGE_CONTENT") {
        // Extract text content from the body
        const text = document.body.innerText;
        // We can also extract title or other metadata if needed
        // const title = document.title;

        sendResponse({
            success: true,
            text: text,
            url: window.location.href
        });
    }
    return true; // Indicates we wish to respond asynchronously if needed (though we responded synchronously above)
});
