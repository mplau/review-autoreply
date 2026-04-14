const mainView = document.getElementById('mainView');
const settingsView = document.getElementById('settingsView');
const apiKeyInput = document.getElementById('apiKeyInput');
const statusDisplay = document.getElementById('status');

chrome.storage.local.get(['gemini_api_key'], (result) => {
    if (result.gemini_api_key) {
      showMainView();
    } else {
      showSettingsView();
    }
});

function showMainView() {
  mainView.classList.remove('hidden');
  settingsView.classList.add('hidden');
}

function showSettingsView() {
  mainView.classList.add('hidden');
  settingsView.classList.remove('hidden');
}

document.getElementById('toggleSettings').addEventListener('click', () => {
  const settingsView =
document.getElementById('settingsView');
  if (settingsView.classList.contains('hidden')) {
    settingsView.classList.remove('hidden');
  } else {
    settingsView.classList.add('hidden');
  }
});

document.getElementById('saveKeyBtn').addEventListener('click', () => {
  const key = apiKeyInput.value.trim();
  if (key) {
    chrome.storage.local.set({ gemini_api_key: key }, () => {
      alert("API key saved.")
      showMainView();
    });
  } 
});


document.getElementById('generateBtn').addEventListener('click', async () => {
    const statusDisplay = document.getElementById('status'); 
    statusDisplay.innerText = "Reading review...";

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.tabs.sendMessage(tab.id, { action: "getSelectedText" }, (selectionResponse) => {
        if (chrome.runtime.lastError || !selectionResponse) {
            statusDisplay.innerText = "Error: Refresh the page first!";
            return;
        }

        const reviewText = selectionResponse.text;
        if (!reviewText || reviewText.trim() === "") {
            statusDisplay.innerText = "Error: Highlight a review first!";
            return;
        }

        statusDisplay.innerText = "Thinking...";

        chrome.runtime.sendMessage({
            action: "generateReply",
            reviewText: reviewText
        }, (aiResponse) => {

            if (chrome.runtime.lastError) {
                statusDisplay.innerText = "Error: " + chrome.runtime.lastError.message;
                return;
            }

            if (!aiResponse) {
                statusDisplay.innerText = "Error: Background script is not responding.";
                return;
            }


            if (aiResponse.original) {
              statusDisplay.innerText = "Done! Pasting...";
              chrome.tabs.sendMessage(tab.id, { 
                    action: "pasteReply", 
                    text: aiResponse.original 
                });            
            
            let resultDiv = document.getElementById('result');
            if (!resultDiv) {
                resultDiv = document.createElement('p');
                resultDiv.id = 'result';
                resultDiv.style.fontSize = "13px";
                resultDiv.style.backgroundColor = "#f1f3f4";
                resultDiv.style.padding = "10px";
                resultDiv.style.borderRadius = "4px";
                resultDiv.style.borderLeft = "4px solid #1a73e8";
                document.body.appendChild(resultDiv);
            }
            resultDiv.innerHTML = `<strong>English Translation:</strong><br>${aiResponse.english}`;
            } else {
            statusDisplay.innerText = "Error: " + (aiResponse.error || "AI failed");
          }
        });
    });
});