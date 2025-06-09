document.addEventListener('DOMContentLoaded', () => {
    const loadingDiv = document.getElementById('loading');
    const iframe = document.getElementById('sharelette-frame');

    // Retrieve the share data from storage that the background script saved.
    chrome.storage.local.get(['shareData'], (result) => {
        if (chrome.runtime.lastError) {
            loadingDiv.textContent = 'Error loading share data.';
            console.error(chrome.runtime.lastError);
            return;
        }

        if (result.shareData && result.shareData.url) {
            const { url, title, text } = result.shareData;

            // Construct the Sharelette URL with the page's data.
            const shareletteBaseUrl = 'https://sharelette.cloudbreak.app';
            const shareUrl = new URL(shareletteBaseUrl);
            shareUrl.searchParams.set('url', url);
            if (title) {
                shareUrl.searchParams.set('title', title);
            }
            if (text) {
                shareUrl.searchParams.set('text', text);
            }


            // Set the iframe's source and make it visible.
            iframe.src = shareUrl.toString();
            iframe.style.display = 'block';
            loadingDiv.style.display = 'none';

            // Clear the storage so it's not reused on the next manual open.
            chrome.storage.local.remove('shareData');
        } else {
            // This case handles when the user clicks the extension icon manually
            // without having triggered a share action first.
            // We'll try to get the current tab's info as a fallback.
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length === 0 || !tabs[0].url || !tabs[0].url.startsWith('http')) {
                    loadingDiv.textContent = 'This page cannot be shared. Please try sharing from a different page.';
                    return;
                }

                const tab = tabs[0];
                const shareletteBaseUrl = 'https://sharelette.cloudbreak.app';
                const shareUrl = new URL(shareletteBaseUrl);
                shareUrl.searchParams.set('url', tab.url);
                shareUrl.searchParams.set('title', tab.title);

                iframe.src = shareUrl.toString();
                iframe.style.display = 'block';
                loadingDiv.style.display = 'none';
            });
        }
    });
});
