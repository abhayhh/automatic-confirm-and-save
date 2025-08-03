let automationState = {
    isEnabled: false,
    steps: [],
    currentStep: 0,
    activeTabId: null,
    checkInterval: null
};

function processStep() {
    if (!automationState.isEnabled || automationState.steps.length === 0 || !automationState.activeTabId) {
        if (automationState.checkInterval) clearInterval(automationState.checkInterval);
        automationState.checkInterval = null;
        return;
    }

    if (automationState.currentStep >= automationState.steps.length) {
        automationState.currentStep = 0;
        chrome.storage.sync.set({ currentStep: 0 });
    }

    const selector = automationState.steps[automationState.currentStep];
    console.log(`[Auto Clicker] Attempting Step ${automationState.currentStep + 1}: Find "${selector}"`);

    chrome.tabs.sendMessage(automationState.activeTabId, { action: "executeClick", selector: selector }, (response) => {
        if (chrome.runtime.lastError) {
            console.warn(`[Auto Clicker] Error communicating with tab. Pausing. Error: ${chrome.runtime.lastError.message}`);
            if (automationState.checkInterval) clearInterval(automationState.checkInterval);
            automationState.checkInterval = null;
            return;
        }

        if (response && response.success) {
            automationState.currentStep++;
            chrome.storage.sync.set({ currentStep: automationState.currentStep });
        }
    });
}

function toggleAutomation() {
    if (automationState.isEnabled && automationState.steps.length > 0 && !automationState.checkInterval) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                automationState.activeTabId = tabs[0].id;
                automationState.checkInterval = setInterval(processStep, 2000);
            }
        });
    } else if (!automationState.isEnabled && automationState.checkInterval) {
        clearInterval(automationState.checkInterval);
        automationState.checkInterval = null;
    }
}

function loadState() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['steps', 'enabled', 'currentStep'], (data) => {
            automationState.steps = data.steps || [];
            automationState.isEnabled = !!data.enabled;
            automationState.currentStep = data.currentStep || 0;
            resolve();
        });
    });
}

chrome.runtime.onInstalled.addListener(() => { loadState().then(toggleAutomation); });
chrome.runtime.onStartup.addListener(() => { loadState().then(toggleAutomation); });
chrome.storage.onChanged.addListener(() => { loadState().then(toggleAutomation); });
chrome.tabs.onActivated.addListener((activeInfo) => {
    automationState.activeTabId = activeInfo.tabId;
    if (automationState.checkInterval) clearInterval(automationState.checkInterval);
    automationState.checkInterval = null;
    toggleAutomation();
});