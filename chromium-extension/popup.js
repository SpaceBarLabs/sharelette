document.addEventListener('DOMContentLoaded', () => {
    const titleDisplay = document.getElementById('title-display');
    const urlDisplay = document.getElementById('url-display');
    const qrcodeContainer = document.getElementById('qrcode');

    // Retrieve the share data from storage
    chrome.storage.local.get(['shareData'], (result) => {
        if (result.shareData && result.shareData.url) {
            const { url, title } = result.shareData;

            titleDisplay.textContent = title || 'Shared Link';
            urlDisplay.textContent = url;
            
            qrcodeContainer.innerHTML = ''; // Clear previous QR code
            new QRCode(qrcodeContainer, {
                text: url,
                width: 150,
                height: 150,
            });

            // Clear the storage so it's not reused on next manual open
            chrome.storage.local.remove('shareData');
        } else {
            // Handle case where popup is opened manually without share data
            titleDisplay.textContent = 'Sharelette';
            urlDisplay.textContent = 'Use a website’s share button to send content here.';
        }
    });
});
