// This script runs in the MAIN world, so it has access to the page's `window` object.
console.log('Sharelette (Main World): Content script loaded.');

// Check if navigator.share exists. If not, we'll create it.
const shareIsSupported = 'share' in window.navigator;
console.log(`Sharelette (Main World): Native navigator.share ${shareIsSupported ? 'is' : 'is not'} supported.`);

// Override navigator.canShare.
window.navigator.canShare = function(data) {
    return true; // Our custom share is always available.
};

// Override navigator.share.
window.navigator.share = async function(data) {
    console.log('Sharelette (Main World): Intercepted share action.');
    
    if (!data) return Promise.resolve();

    // Post a message to the window. The proxy script will pick this up.
    window.postMessage({
        type: 'SHARELETTE_SHARE_REQUEST',
        data: {
            url: data.url || window.location.href,
            title: data.title || document.title,
            text: data.text || ''
        }
    }, window.location.origin);

    return Promise.resolve();
};
window.navigator.shareProvidedBySharelette = true; // Add the flag

console.log('Sharelette (Main World): navigator.share has been replaced.');
