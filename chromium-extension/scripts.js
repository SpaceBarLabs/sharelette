// ================================================================== //
// ===== THIS PART OF THE FILE ACTS AS THE BACKGROUND SCRIPT ======== //
// ================================================================== //

// This check ensures the background script code only runs in the extension's
// background context, where `chrome.runtime.onInstalled` is defined.
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onInstalled) {
    // This function injects the content script into web pages.
    const injectContentScript = async () => {
        try {
            await chrome.scripting.registerContentScripts([{
                id: 'sharelette-interceptor',
                js: ['scripts.js'],
                matches: ['<all_urls>'],
                runAt: 'document_start',
                world: 'MAIN'
            }]);
            console.log("Sharelette content script registered.");
        } catch (err) {
            if (!err.message.includes('Duplicate script ID')) {
                console.error("Failed to register Sharelette content script:", err);
            }
        }
    };

    chrome.runtime.onInstalled.addListener(injectContentScript);
    chrome.runtime.onStartup.addListener(injectContentScript);

    // Listen for share messages from the content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'share') {
            console.log('Sharelette: Background received share data:', message.data);
            
            // Store the data for the popup to access
            chrome.storage.local.set({ shareData: message.data }, () => {
                // Programmatically open the extension's popup
                if (chrome.action.openPopup) {
                    chrome.action.openPopup();
                }
            });
            return true;
        }
    });
}


// ================================================================== //
// ====== THIS PART OF THE FILE ACTS AS THE CONTENT SCRIPT ========== //
// ================================================================== //

if (typeof window !== 'undefined') {
	// if (navigator.share) {
        navigator.canShare = function(data) {
            console.log('Sharelette intercepted a canShare action.');
            return true; 
        };

        navigator.share = async function(data) {
            console.log('Sharelette: Intercepted share, sending to background.');
            
            if (!data) return Promise.resolve();
            
            // Send share data to the background script
            chrome.runtime.sendMessage({
                type: 'share',
                data: {
                    url: data.url || window.location.href,
                    title: data.title || document.title,
                    text: data.text || ''
                }
            });

            return Promise.resolve();
        };

        console.log('Sharelette: navigator.share and navigator.canShare have been replaced.');
    // }
}
