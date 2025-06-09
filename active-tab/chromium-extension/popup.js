// sharelette/active-tab/chromium-extension/popup.js
document.addEventListener('DOMContentLoaded', () => {
    const loadingDiv = document.getElementById('loading');
    const iframe = document.getElementById('sharelette-frame');
    const iframeOrigin = "https://sharelette.cloudbreak.app";

    // Listen for copy requests from the iframe. This allows the sandboxed
    // iframe to use the popup's permission to write to the clipboard.
    window.addEventListener('message', (event) => {
        if (event.origin !== iframeOrigin) {
            return;
        }

        if (event.data.type === 'sharelette-copy-request' && event.data.text) {
            navigator.clipboard.writeText(event.data.text).then(() => {
                iframe.contentWindow.postMessage({ type: 'sharelette-copy-response', success: true }, iframeOrigin);
            }).catch(err => {
                console.error('Failed to copy text:', err);
                iframe.contentWindow.postMessage({ type: 'sharelette-copy-response', success: false, error: err.message }, iframeOrigin);
            });
        }
    });

    // Use the tabs API to get the current active tab's URL and title.
    // The 'activeTab' permission grants access to this.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError || !tabs || tabs.length === 0 || !tabs[0].url) {
            loadingDiv.textContent = 'Could not get tab information. Please try another page.';
            console.error(chrome.runtime.lastError || 'No active tab found.');
            return;
        }

        const tab = tabs[0];

        // Ensure the URL is a shareable web page.
        if (!tab.url.startsWith('http')) {
            loadingDiv.textContent = 'This page cannot be shared.';
            return;
        }

        // Construct the URL for the Sharelette web app and load it in the iframe.
        const shareletteBaseUrl = 'https://sharelette.cloudbreak.app';
        const shareUrl = new URL(shareletteBaseUrl);
        shareUrl.searchParams.set('url', tab.url);
        if (tab.title) {
            shareUrl.searchParams.set('title', tab.title);
        }

        iframe.src = shareUrl.toString();
        
        iframe.onload = () => {
            loadingDiv.style.display = 'none';
            iframe.style.display = 'block';
        };
    });
});
