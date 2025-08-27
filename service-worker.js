// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

function setupContextMenu() {
  chrome.contextMenus.create({
    id: "define-word",
    title: "Define",
    contexts: ["selection"],
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
  chrome.storage.session.set({ lastWord: data.selectionText });
  chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "init") {
    let jobs = msg.data;
    chrome.storage.local.remove("jobs", () => {
      chrome.storage.local.set({ jobs });
    });
    chrome.tabs.create({ url: jobs[0].url }, (tab) => {
      const tabId = tab.id;
      // 2. Wait for tab to finish loading
      function onUpdated(updatedTabId, changeInfo) {
        if (updatedTabId === tabId && changeInfo.status === "complete") {
          chrome.tabs.onUpdated.removeListener(onUpdated);

          // 3. Inject content script dynamically
          chrome.scripting.executeScript(
            {
              target: { tabId },
              files: ["automate.js"], // make sure this exists
            },
            () => {
              // 4. Send message to content script with arguments
              chrome.tabs.sendMessage(tabId, {
                action: "runOnReady",
                tabId,
                data: {
                  message: jobs[0].message,
                  subject: jobs[0].subject,
                  id: jobs[0].id,
                },
              });
            }
          );
        }
      }

      chrome.tabs.onUpdated.addListener(onUpdated);
    });
  }
  if (msg.action === "closeTabStartNew") {
    chrome.tabs.remove(msg.tabId, () => {
      console.log(`Tab ${tabIdToClose} closed`);
    });
    chrome.storage.local.get("jobs", (result) => {
      const jobList = result.jobs || [];
      const newJobs = jobList.filter((job) => job.id !== msg.id);
      chrome.storage.local.set({ jobs: newJobs });
      chrome.tabs.create({ url: newJobs[0].url }, (tab) => {
        const tabId = tab.id;
        function onUpdated(updatedTabId, changeInfo) {
          if (updatedTabId === tabId && changeInfo.status === "complete") {
            chrome.tabs.onUpdated.removeListener(onUpdated);
            chrome.scripting.executeScript(
              {
                target: { tabId },
                files: ["automate.js"], // make sure this exists
              },
              () => {
                // 4. Send message to content script with arguments
                chrome.tabs.sendMessage(tabId, {
                  action: "runOnReady",
                  tabId,
                  data: {
                    message: newJobs[0].message,
                    subject: newJobs[0].subject,
                    id: newJobs[0].id,
                  },
                });
              }
            );
          }
        }

        chrome.tabs.onUpdated.addListener(onUpdated);
      });
    });
  }
});
