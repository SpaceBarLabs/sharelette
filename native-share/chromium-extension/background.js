// This function registers the content scripts that will be injected into pages.
const injectContentScripts = async () => {
    try {
        // In case of extension updates, unregister old scripts first.
        await chrome.scripting.unregisterContentScripts();

        await chrome.scripting.registerContentScripts([
            {
                // The proxy script runs in the isolated world with API access.
                id: 'sharelette-proxy',
                js: ['content_proxy.js'],
                matches: ['<all_urls>'],
                runAt: 'document_start'
            },
            {
                // The main script runs in the page's world to override navigator.share.
                id: 'sharelette-main',
                js: ['content_main.js'],
                matches: ['<all_urls>'],
                runAt: 'document_start',
                world: 'MAIN'
            }
        ]);
        console.log("Sharelette content scripts registered.");
    } catch (err) {
        console.error("Failed to register Sharelette content scripts:", err);
    }
};

chrome.runtime.onInstalled.addListener(injectContentScripts);
chrome.runtime.onStartup.addListener(injectContentScripts);

// Listen for the 'share' message from our proxy content script.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'share') {
        // Store the share data and open the extension's popover.
        chrome.storage.local.set({ shareData: message.data }, () => {
            if (chrome.action.openPopup) {
                chrome.action.openPopup();
            }
        });
        return true;
    }
});
