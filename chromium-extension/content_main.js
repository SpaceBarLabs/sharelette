// This script runs in the MAIN world, so it has access to the page's `window` object.
console.log('Sharelette (Main World): Content script loaded.');

// Check if navigator.share exists. If not, we'll create it.
const shareIsSupported = 'share' in window.navigator;
console.log(`Sharelette (Main World): Native navigator.share ${shareIsSupported ? 'is' : 'is not'} supported.`);

// Override navigator.share.
window.navigator.share = async function(data) {
    console.log('Sharelette (Main World): Intercepted share action.');
    
    // We need to pass the share data to the isolated world script (content_proxy.js),
    // which can then communicate with the background script.
    // We'll use a custom event for this.
    const event = new CustomEvent('ShareletteAction', { detail: data });
    window.dispatchEvent(event);
};
window.navigator.shareProvidedBySharelette = true; // Add the flag

console.log('Sharelette (Main World): navigator.share has been replaced.');
