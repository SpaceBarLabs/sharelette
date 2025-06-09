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
                js: ['scripts.js'], // It injects itself, but only the 'content' part runs.
                matches: ['<all_urls>'],
                runAt: 'document_start', // Run as early as possible.
                world: 'MAIN' // Inject into the main page's context to access navigator.
            }]);
            console.log("Sharelette content script registered.");
        } catch (err) {
            // This error is expected if the script is already registered, so we can ignore it.
            if (!err.message.includes('Duplicate script ID')) {
                console.error("Failed to register Sharelette content script:", err);
            }
        }
    };

    // Run the injection function when the extension is first installed.
    chrome.runtime.onInstalled.addListener(() => {
        injectContentScript();
    });

    // Also run when the browser starts, in case the extension was disabled and re-enabled.
    chrome.runtime.onStartup.addListener(() => {
        injectContentScript();
    });
}


// ================================================================== //
// ====== THIS PART OF THE FILE ACTS AS THE CONTENT SCRIPT ========== //
// ====== (It only runs when injected into a web page) ============== //
// ================================================================== //

// This check ensures the content script code only runs when it's in a page
// context (has a `window` object) and not in the background service worker.
if (typeof window !== 'undefined') {

        // 2. Define and replace navigator.canShare
        // Our version always returns true because we can always open a popup.
        navigator.canShare = function(data) {
            console.log('Sharelette intercepted a canShare action. Data:', data);
            // We return true to indicate that our custom share implementation can be called.
            return true; 
        };

        // 3. Replace the 'share' function with our custom version.
        navigator.share = async function(data) {
            console.log('Sharelette intercepted a share action. Data:', data);

            if (!data) {
                // If there's no data, we don't need to do anything.
                return Promise.resolve();
            }

            // Open the Sharelette UI in a new popup window.
            const shareletteBaseUrl = 'https://sharelette.cloudbreak.app';
            const shareUrl = new URL(shareletteBaseUrl);
            
            shareUrl.searchParams.set('url', data.url || window.location.href);
            shareUrl.searchParams.set('title', data.title || document.title);
            if (data.text) {
                shareUrl.searchParams.set('text', data.text);
            }
            
            const width = 550;
            const height = 750;
            const left = (screen.width / 2) - (width / 2);
            const top = (screen.height / 2) - (height / 2);

            window.open(
                shareUrl, 
                'Sharelette', 
                `width=${width},height=${height},top=${top},left=${left}`
            );

            return Promise.resolve();
        };

        console.log('Sharelette: navigator.share and navigator.canShare have been successfully replaced.');
}
