document.addEventListener('DOMContentLoaded', () => {
    // Query for the currently active tab in the browser.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const loadingDiv = document.getElementById('loading');
        const iframe = document.getElementById('sharelette-frame');

        // Ensure we got a tab back.
        if (tabs.length === 0) {
            loadingDiv.textContent = 'Could not find an active tab.';
            return;
        }

        const tab = tabs[0];
        const url = tab.url;
        const title = tab.title;

        // Check if the URL is a shareable web page.
        if (!url || !url.startsWith('http')) {
            loadingDiv.textContent = 'This page cannot be shared.';
            return;
        }

        // Construct the Sharelette URL with the page's data.
        const shareletteBaseUrl = 'https://sharelette.cloudbreak.app';
        const shareUrl = new URL(shareletteBaseUrl);
        shareUrl.searchParams.set('url', url);
        shareUrl.searchParams.set('text', title);

        // Set the iframe's source and make it visible.
        iframe.src = shareUrl.toString();
        iframe.style.display = 'block';
        loadingDiv.style.display = 'none';
    });
});
