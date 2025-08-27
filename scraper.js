export function automate() {
  const openMsgSelector = "#ember216";
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: clickButton,
      args: [openMsgSelector], // your selector
    });
  });
  function clickButton(selector) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.click();
      console.log(`Clicked button: ${selector}`);
    } else {
      console.log(`Button not found: ${selector}`);
    }
  }
}
