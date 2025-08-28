const contentLoadWaitTime = 30000;
const contentLoadDelay = 4000;
const openMoreOptions = "button[aria-label='More actions']";
const sendMsgSelelctor = "div[aria-label^='Message']";
const subjectInputSelector = "input[name='subject']";
const msgInputSelector =
  "div.msg-form__contenteditable[contenteditable='true']";
const submitBtnSelector = "button.msg-form__send-btn[type='submit']";
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "runOnReady") {
    run(
      openMoreOptions,
      sendMsgSelelctor,
      subjectInputSelector,
      msgInputSelector,
      msg
    );
  }
});
async function run(
  openMoreActionSelector,
  opneMsgSelelctor,
  subjectSelector,
  msgSelector,
  data
) {
  let openMoreActionBtn = document.querySelector(openMoreActionSelector);
  let openMsgBtn = document.querySelector(opneMsgSelelctor);
  let subjectInput = document.querySelector(subjectSelector);
  let msgInput = document.querySelector(msgSelector);
  let msg = data.data.message;
  let subjectText = data.data.subject;
  let salesInsights = document.querySelector("h2.pvs-header__title");
  let maxRetries = 0;
  let openMsgFound = false;
  let subjectInputAndmsgInputFound = false;
  let i = 1;
  let j = 0;

  for (j = 1; j < contentLoadWaitTime / contentLoadDelay; j++) {
    openMoreActionBtn = document.querySelector(openMoreActionSelector);
    openMsgBtn = document.querySelector(opneMsgSelelctor);
    salesInsights = document.querySelector("h2.pvs-header__title");

    if (openMoreActionBtn) {
      openMoreActionBtn.click();
      console.log(`Clicked button: ${openMoreActionSelector}`);
      await new Promise((r) => setTimeout(r, 2000));
      if (openMsgBtn) {
        openMsgFound = true;
        openMsgBtn.click();
        console.log("Clicked Open Msg");
        break;
      } else {
        console.log("Open Msg Not found");
      }
    } else {
      console.log(`Button not found: ${openMoreActionSelector}`);
    }
    await new Promise((r) => setTimeout(r, contentLoadDelay));
  }
  if (!openMsgFound) {
    chrome.runtime.sendMessage({
      action: "closeTabStartNew",
      tabId: data.tabId,
      id: data.data.id,
    });
  }
  for (i = 1; i < contentLoadWaitTime / contentLoadDelay; i++) {
    subjectInput = document.querySelector(subjectSelector);
    msgInput = document.querySelector(msgSelector);
    salesInsights = document.querySelector("h2.pvs-header__title");

    if (subjectInput && msgInput) {
      subjectInputAndmsgInputFound = true;
      console.log("Subject and Msg Found!!");
      subjectInput.focus();
      // Use a non-blocking async function for typing
      (async () => {
        for (let char of subjectText) {
          const key = char;
          subjectInput.dispatchEvent(
            new KeyboardEvent("keydown", { key, bubbles: true })
          );
          subjectInput.dispatchEvent(
            new KeyboardEvent("keypress", { key, bubbles: true })
          );
          subjectInput.value += char;
          subjectInput.dispatchEvent(
            new InputEvent("input", { bubbles: true, data: char })
          );
          subjectInput.dispatchEvent(
            new KeyboardEvent("keyup", { key, bubbles: true })
          );
          await new Promise((r) => setTimeout(r, 100));
        }
        subjectInput.dispatchEvent(new Event("change", { bubbles: true }));
      })()
        .then(async () => {
          msgInput.focus();
          for (let char of msg) {
            const key = char;
            msgInput.dispatchEvent(
              new KeyboardEvent("keydown", { key, bubbles: true })
            );
            msgInput.dispatchEvent(
              new KeyboardEvent("keypress", { key, bubbles: true })
            );

            if ("value" in msgInput) {
              // input/textarea
              msgInput.value += char;
            } else if (msgInput.isContentEditable) {
              // contenteditable (better: execCommand)
              document.execCommand("insertText", false, char);
            }

            msgInput.dispatchEvent(
              new InputEvent("input", { bubbles: true, data: char })
            );
            msgInput.dispatchEvent(
              new KeyboardEvent("keyup", { key, bubbles: true })
            );

            await new Promise((r) => setTimeout(r, 100));
          }
          msgInput.dispatchEvent(new Event("change", { bubbles: true }));
        })
        .then(async () => {
          const submitbtn = document.querySelector(submitBtnSelector);
          const msgContainer = document.querySelector(
            "div.msg-form__msg-content-container"
          );
          if (msgContainer) {
            msgContainer.focus();
            await new Promise((r) => setTimeout(r, 2000));
            if (submitbtn) {
              // submitbtn.click();
            } else {
              console.log("Submit Btn not found");
            }
          } else {
            console.log("Msg container not found");
          }
        })
        .then(() => {
          // await new Promise((r) => setTimeout(r, 15000));
          return;
        })
        .then(() => {
          chrome.runtime.sendMessage({
            action: "closeTabStartNew",
            tabId: data.tabId,
            id: data.data.id,
          });
        });
      break;
    } else {
      console.log("Subject and Msg Input not found, retry: #", i);
    }
    // Use setTimeout instead of await to avoid blocking
    await new Promise((r) => setTimeout(r, contentLoadDelay));
  }
  if (!subjectInputAndmsgInputFound) {
    chrome.runtime.sendMessage({
      action: "closeTabStartNew",
      tabId: data.tabId,
      id: data.data.id,
    });
  }
}
