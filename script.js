if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArchiveEngine);
} else {
  initArchiveEngine();
}

function initArchiveEngine() {
  // Find all individual console sections (e.g., id="playstation-1", id="playstation-2")
  const sections = document.querySelectorAll("section[id^='playstation-']");

  // ==========================================
  // GESTURE-AWARE SMART CLICK HANDLER
  // ==========================================
  function bindSmartClick(element, callback) {
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    // 1. Record initial touch/pointer coordinates
    element.addEventListener("pointerdown", (e) => {
      startX = e.clientX;
      startY = e.clientY;
      isDragging = false;
    });

    // 2. Track thumb movement to distinguish a click from a swipe drag
    element.addEventListener("pointermove", (e) => {
      // If the movement exceeds a 5px threshold, flag it as a page scroll
      if (
        Math.abs(e.clientX - startX) > 5 ||
        Math.abs(e.clientY - startY) > 5
      ) {
        isDragging = true;
      }
    });

    // 3. Only execute actions if a clean tap occurred
    element.addEventListener("pointerup", (e) => {
      if (!isDragging) {
        e.preventDefault(); // Stop mobile ghost click delays
        callback(e);
      }
    });

    // Desktop fallback for keyboard accessibility (Space/Enter)
    element.addEventListener("click", (e) => {
      if (e.clientX === 0 && e.clientY === 0) {
        callback(e);
      }
    });
  }

  // Loop through each section independently to sandbox their states
  sections.forEach((section) => {
    // Scope filters and tables STRICTLY to this single system block
    const filterButtons = section.querySelectorAll(".filter-btn");
    const table = section.querySelector(".archive-table");

    // If a section is missing a table components setup, skip to avoid crashes
    if (!table) return;

    const headers = table.querySelectorAll("thead th");
    const tbody = table.querySelector("tbody");
    const originalTextContents = Array.from(headers).map((h) =>
      h.textContent.trim(),
    );

    filterButtons.forEach((btn) => btn.setAttribute("data-active", "false"));

    // ==========================================
    // FEATURE 1: SANDBOXED REGION BUTTON FILTER
    // ==========================================
    filterButtons.forEach((button) => {
      bindSmartClick(button, () => {
        const isAlreadyActive = button.getAttribute("data-active") === "true";

        // Reset ONLY the buttons inside this specific system group
        filterButtons.forEach((btn) => {
          btn.setAttribute("data-active", "false");
          btn.classList.remove("btn-tertiary");
          btn.classList.add("btn-ghost");
        });

        let activeFilter = null;
        if (!isAlreadyActive) {
          button.setAttribute("data-active", "true");
          button.classList.remove("btn-ghost");
          button.classList.add("btn-tertiary");
          activeFilter = button.getAttribute("data-filter");
        }

        // Apply row updates ONLY to this specific system table's rows
        const rows = tbody.querySelectorAll("tr");
        rows.forEach((row) => {
          const rowRegion = row.cells[2].textContent.trim();
          if (activeFilter === null || rowRegion === activeFilter) {
            row.style.display = "";
          } else {
            row.style.display = "none";
          }
        });
      });
    });

    // ==========================================
    // FEATURE 2: SANDBOXED COLUMN SORT ENGINE
    // ==========================================
    headers.forEach((header, index) => {
      bindSmartClick(header, () => {
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const isDate = header.getAttribute("data-type") === "date";
        const setAsDescending = header.textContent.endsWith(" ▲");

        // Clear arrows ONLY on this specific system's column headers
        headers.forEach((h, i) => {
          h.textContent = originalTextContents[i];
        });

        rows.sort((rowA, rowB) => {
          let cellA = rowA.cells[index].textContent.trim();
          let cellB = rowB.cells[index].textContent.trim();

          if (setAsDescending) {
            [cellA, cellB] = [cellB, cellA];
          }

          let comparison = 0;
          if (isDate) {
            comparison =
              new Date(cellA.replace(/\./g, "-")) -
              new Date(cellB.replace(/\./g, "-"));
          } else {
            comparison = cellA.localeCompare(cellB, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          }

          if (comparison === 0) {
            const titleA = rowA.cells[1].textContent.trim();
            const titleB = rowB.cells[1].textContent.trim();
            return titleA.localeCompare(titleB, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          }

          return comparison;
        });

        if (setAsDescending) {
          header.textContent = originalTextContents[index] + " ▼";
        } else {
          header.textContent = originalTextContents[index] + " ▲";
        }

        rows.forEach((row) => tbody.appendChild(row));
      });
    });
  });
}
