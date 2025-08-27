const contentLoadWaitTime = 120000;
const contentLoadDelay = 4000;
const openMoreOptions = "button[aria-label='More actions']";
const sendMsgSelelctor = "div[aria-label^='Message']";
const subjectInputSelector = "input[name='subject']";
const msgInputSelector =
  "div.msg-form__contenteditable[contenteditable='true']";
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
  let maxRetries = 0;

  for (let j = 1; j < contentLoadWaitTime / contentLoadDelay; j++) {
    openMoreActionBtn = document.querySelector(openMoreActionSelector);
    openMsgBtn = document.querySelector(opneMsgSelelctor);

    if (openMoreActionBtn) {
      openMoreActionBtn.click();
      console.log(`Clicked button: ${openMoreActionSelector}`);
      await new Promise((r) => setTimeout(r, 2000));
      if (openMsgBtn) {
        openMsgBtn.click();
        console.log("Clicked Open Msg");
        break;
      } else {
        console.error("Open Msg Not found");
      }
    } else {
      console.error(`Button not found: ${openMoreActionSelector}`);
    }
    await new Promise((r) => setTimeout(r, contentLoadDelay));
  }
  for (let i = 1; i < contentLoadWaitTime / contentLoadDelay; i++) {
    subjectInput = document.querySelector(subjectSelector);
    msgInput = document.querySelector(msgSelector);

    if (subjectInput && msgInput) {
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
        .then(() => {
          chrome.runtime.sendMessage({
            action: "closeTabStartNew",
            tabId: data.tabId,
            id: data.data.id,
          });
        });
      break;
    } else {
      console.error("Subject and Msg Input not found, retry: #", i);
    }
    // Use setTimeout instead of await to avoid blocking
    await new Promise((r) => setTimeout(r, contentLoadDelay));
  }
  if (
    i === contentLoadWaitTime / contentLoadDelay ||
    j === contentLoadWaitTime / contentLoadDelay
  ) {
    chrome.runtime.sendMessage({
      action: "closeTabStartNew",
      tabId: data.tabId,
      id: data.data.id,
    });
  }
}
