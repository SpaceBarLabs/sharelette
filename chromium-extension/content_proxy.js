// This script runs in the ISOLATED world and has access to extension APIs.
// It listens for messages from the MAIN world and forwards them to the background script.

window.addEventListener('message', (event) => {
    // Ensure the message is from the current window.
    if (event.source !== window) {
        return;
    }

    const message = event.data;

    // Check if it's the message we're looking for.
    if (typeof message === 'object' && message !== null && message.type === 'SHARELETTE_SHARE_REQUEST') {
        console.log('Sharelette (Proxy): Received share request, forwarding to background.');
        chrome.runtime.sendMessage({
            type: 'share',
            data: message.data
        });
    }
});
