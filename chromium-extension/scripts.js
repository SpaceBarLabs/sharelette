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

    // Check if the native share function exists before we try to override it.
    if (navigator.share) {
        
        // 1. Save the original browser 'share' function.
        const originalNavigatorShare = navigator.share.bind(navigator);

        // 2. Replace the 'share' function on the page with our custom version.
        navigator.share = async function(data) {
            console.log('Sharelette intercepted a share action with data:', data);

            if (!data) {
                return;
            }

            // 3. Open the Sharelette UI in a new popup window, passing the
            //    page's URL and title as parameters.
            const shareletteBaseUrl = 'https://sharelette.cloudbreak.app';
            const shareUrl = new URL(shareletteBaseUrl);
            
            shareUrl.searchParams.set('url', data.url || window.location.href);
            shareUrl.searchParams.set('title', data.title || document.title);
            if (data.text) {
                shareUrl.searchParams.set('text', data.text);
            }
            
            // Define the dimensions and position for the popup window.
            const width = 550;
            const height = 750;
            const left = (screen.width / 2) - (width / 2);
            const top = (screen.height / 2) - (height / 2);

            // Open the centered popup window.
            window.open(
                shareUrl, 
                'Sharelette', 
                `width=${width},height=${height},top=${top},left=${left}`
            );

            // We return a resolved promise because the share API is async.
            return Promise.resolve();
        };

        console.log('Sharelette: navigator.share has been successfully replaced.');
    }
}
