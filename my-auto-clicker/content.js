chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "executeClick") {
        const selector = request.selector;
        const element = document.querySelector(selector);
        
        if (element) {
            console.log(`[Auto Clicker] Found and clicking: ${selector}`);
            element.click();
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false });
        }
        return true;
    }
});