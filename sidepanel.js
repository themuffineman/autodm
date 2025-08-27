function automate() {
  const openMoreOptions = "button[aria-label='More actions']";
  const sendMsgSelelctor =
    "div#ember76.artdeco-dropdown__item.artdeco-dropdown__item--is-dropdown.ember-view.full-width.display-flex.align-items-center[role='button']";
  const subjectInputSelector = "input[name='subject']";
  const msgInputSelector =
    "div.msg-form__contenteditable[contenteditable='true']";
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: run,
      args: [
        openMoreOptions,
        sendMsgSelelctor,
        subjectInputSelector,
        msgInputSelector,
      ], // your selector
    });
  });
  async function run(
    openMoreActionSelector,
    opneMsgSelelctor,
    subjectSelector,
    msgSelector
  ) {
    const openMoreActionBtn = document.querySelector(openMoreActionSelector);
    const openMsgBtn = document.querySelector(opneMsgSelelctor);
    let subjectInput = document.querySelector(subjectSelector);
    let msgInput = document.querySelector(msgSelector);
    const subjectText = "Could this work for you too Frank?";
    const msg = "I built this really effecient system to contact leads";
    if (openMoreActionBtn) {
      openMoreActionBtn.click();
      console.log(`Clicked button: ${openMoreActionSelector}`);
      setTimeout(() => {
        if (openMsgBtn) {
          openMsgBtn.click();
          console.log("Clicked Open Msg");
        } else {
          console.error("Open Msg Not found");
        }
      }, 1500);
    } else {
      console.error(`Button not found: ${openMoreActionSelector}`);
    }
    for (let i = 1; i < 6; i++) {
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
        })().then(async () => {
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
        });
        break;
      } else {
        console.error("Subject and Msg Input not found, retry: #", i);
      }
      // Use setTimeout instead of await to avoid blocking
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
async function delay(time) {
  return new Promise((res, _) => {
    setTimeout(() => {
      res("");
    }, time);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const dragArea = document.getElementById("dragArea");
  const fileInput = document.getElementById("fileInput");
  const filePreview = document.getElementById("filePreview");
  const nextButton = document.getElementById("nextButton");
  const tableContainer = document.querySelector("table");
  const uploaderContent = document.querySelector(".uploader-content");
  const uploaderContainer = document.querySelector(".uploader-container");
  const h2 = document.querySelector("h2");
  let uploadedFile = null; // To store the file object

  // Handle file selection
  const handleFiles = (files) => {
    if (files.length > 0) {
      const file = files[0];
      const fileName = file.name;
      // Check file extension
      const allowedExtensions = [".xls", ".xlsx", ".csv"];
      const fileExtension = "." + fileName.split(".").pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
        alert("Unsupported file format. Please upload XLS or XLSX files.");
        return;
      }

      // Check file size (25MB limit)
      const maxSize = 25 * 1024 * 1024; // 25 MB in bytes
      if (file.size > maxSize) {
        alert("File size exceeds the maximum limit of 25MB.");
        return;
      }

      uploadedFile = file; // Store the file
      displayFile(fileName);
      nextButton.classList.add("active"); // Enable Next button
    }
  };

  // Display the selected file
  const displayFile = (fileName) => {
    dragArea.querySelector(".icon").style.display = "none";
    dragArea.querySelector(".drag-text").style.display = "none";

    filePreview.innerHTML = `
                    <div class="file-details">
                        <div class="file-info">
                            <i class="fas fa-file-excel file-icon"></i>
                            <span class="file-name">${fileName}</span>
                        </div>
                        <button class="remove-file-btn" aria-label="Remove file">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;

    // Add event listener to remove button
    filePreview
      .querySelector(".remove-file-btn")
      .addEventListener("click", () => {
        removeFile();
      });
  };

  // Remove the selected file
  const removeFile = () => {
    uploadedFile = null;
    filePreview.innerHTML = "";
    dragArea.querySelector(".icon").style.display = "block";
    dragArea.querySelector(".drag-text").style.display = "block";
    nextButton.classList.remove("active"); // Disable Next button
  };

  // File input change event
  fileInput.addEventListener("change", (event) => {
    handleFiles(event.target.files);
  });

  const csvFileToTable = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split("\n").filter((row) => row.trim() !== "");
      const table = document.createElement("table");
      const proccedAutomation = document.createElement("button");
      proccedAutomation.classList.add("begin-auto-btn");
      proccedAutomation.innerText = "Begin Automation";
      proccedAutomation.onclick = automate;
      h2.innerText = "Preview your sheet";

      table.style.width = "100%";
      table.style.maxWidth = "100%";
      table.style.height = "300px";
      table.style.maxHeight = "50%";
      table.style.overflow = "auto";
      table.style.display = "block";
      table.style.background = "#fff";
      table.style.border = "1px solid #e5e7eb";
      table.style.borderCollapse = "collapse";
      table.style.marginTop = "24px";
      table.style.fontFamily = '"DM Sans", sans-serif';

      rows.forEach((row, rowIndex) => {
        const tr = document.createElement("tr");
        tr.style.background = rowIndex % 2 === 0 ? "#f3f4f6" : "#fff";

        const cells = row.split(",");
        cells.forEach((cell) => {
          const cellElement =
            rowIndex === 0
              ? document.createElement("th")
              : document.createElement("td");
          cellElement.textContent = cell.trim();
          cellElement.style.border = "1px solid #e5e7eb";
          cellElement.style.padding = "8px 12px";
          if (rowIndex === 0) {
            cellElement.style.fontWeight = "bold";
            cellElement.style.background = "#e0f2fe";
          }
          tr.appendChild(cellElement);
        });

        table.appendChild(tr);
      });

      // Wrap table in a scrollable div
      const tableWrapper = document.createElement("div");
      tableWrapper.style.maxWidth = "100%";
      tableWrapper.style.maxHeight = "50%";
      tableWrapper.style.overflow = "auto";
      tableWrapper.appendChild(table);

      uploaderContainer.appendChild(tableWrapper);
      uploaderContainer.appendChild(proccedAutomation);
      uploaderContent.style.display = "none";
      // alert("Success!");
    };

    reader.readAsText(file);
  };

  // Drag and Drop functionality
  dragArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dragArea.classList.add("hover");
  });

  dragArea.addEventListener("dragleave", () => {
    dragArea.classList.remove("hover");
  });

  dragArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dragArea.classList.remove("hover");
    handleFiles(event.dataTransfer.files);
  });

  // "Next" button functionality (placeholder)
  nextButton.addEventListener("click", () => {
    if (nextButton.classList.contains("active")) {
      if (uploadedFile) {
        csvFileToTable(uploadedFile);
      }
    } else {
      alert("Please upload a file first.");
    }
  });
});
