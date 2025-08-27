const jobList = [];

/**
 * Data should be in form of
 * {id, subject, message, url}
 */
function automate(data) {
  chrome.runtime.sendMessage({
    action: "init",
    data,
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const dragArea = document.getElementById("dragArea");
  const fileInput = document.getElementById("fileInput");
  const filePreview = document.getElementById("filePreview");
  const nextButton = document.getElementById("nextButton");
  const uploaderContent = document.querySelector(".uploader-content");
  const uploaderContainer = document.querySelector(".uploader-container");
  const h2 = document.querySelector("h2");
  const proccedAutomation = document.createElement("button");
  proccedAutomation.classList.add("begin-auto-btn");
  proccedAutomation.innerText = "Begin Automation";
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

      const tableWrapper = document.createElement("div");
      tableWrapper.style.maxWidth = "100%";
      tableWrapper.style.maxHeight = "50%";
      tableWrapper.style.overflow = "auto";
      tableWrapper.appendChild(table);

      uploaderContainer.appendChild(tableWrapper);

      uploaderContent.style.display = "none";
      // alert("Success!");
    };

    reader.readAsText(file);
  };
  const csvFileToJSONArray = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const rows = text.split("\n").filter((row) => row.trim() !== "");
        if (rows.length === 0) {
          resolve([]);
          return;
        }
        const headers = rows[0].split(",").map((h) => h.trim());
        const data = rows.slice(1).map((row) => {
          const values = row.split(",").map((v) => v.trim());
          const obj = {};
          headers.forEach((header, i) => {
            obj[header] = values[i] || "";
          });
          return obj;
        });
        resolve(data);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  proccedAutomation.addEventListener("click", async () => {
    if (uploadedFile) {
      const data = await csvFileToJSONArray(uploadedFile);
      console.log("Data is", data);
      automate(data);
    }
  });

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

  nextButton.addEventListener("click", async () => {
    if (nextButton.classList.contains("active")) {
      if (uploadedFile) {
        csvFileToTable(uploadedFile);
        uploaderContainer.appendChild(proccedAutomation);
        h2.innerText = "Preview your sheet";
        const json2 = await csvFileToJSONArray(uploadedFile);
        console.log("CSV is", json2);
      }
    } else {
      alert("Please upload a file first.");
    }
  });
});
