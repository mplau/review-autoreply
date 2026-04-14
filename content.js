console.log("Review Autoreply active");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSelectedText") {
        sendResponse({ text: window.getSelection().toString() });
    }

    if (request.action === "pasteReply") {
        const selectors = [
            'textarea', 
            '[contenteditable="true"]', 
            '.reponse-field', 
            '#review-reply-text'
        ];

        let found = false;
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                element.value = request.text;
                element.innerText = request.text;
                
                element.dispatchEvent(new Event('input', { bubbles: true }));
                found = true;
                break;
            }
        }
        
        if (!found) {
            console.log("Could not find a reply box. Try clicking inside the reply box first.");
        }
    }
});