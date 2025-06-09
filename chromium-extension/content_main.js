// This script runs in the MAIN world and has access to navigator.share,
// but it does not have access to extension APIs.

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

console.log('Sharelette (Main World): Replaced navigator.share() and navigator.canShare().');
