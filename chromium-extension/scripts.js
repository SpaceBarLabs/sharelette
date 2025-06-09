// 1. Log to the console to confirm that the script is running.
console.log('Sharelette: Content script running.');

// 2. Replace the 'share' function on the page with our custom version.
navigator.share = async function(data) {
    console.log('Sharelette intercepted a share action with data:', data);

    const width = 400;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    // Construct the Sharelette URL with the page's data.
    const shareletteBaseUrl = 'https://sharelette.cloudbreak.app';
    const shareUrl = new URL(shareletteBaseUrl);
    
    if (data.url) shareUrl.searchParams.set('url', data.url);
    if (data.title) shareUrl.searchParams.set('title', data.title);
    if (data.text) shareUrl.searchParams.set('text', data.text);

    // Open Sharelette in a new popup window.
    window.open(shareUrl, 'Sharelette', `width=${width},height=${height},top=${top},left=${left}`);
};
navigator.shareProvidedBySharelette = true; // Add the flag

console.log('Sharelette: navigator.share has been successfully replaced.');
