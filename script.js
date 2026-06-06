if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initArchiveEngine);
} else {
  initArchiveEngine();
}

function initArchiveEngine() {
  const tables = document.querySelectorAll(".archive-table");
  const filterButtons = document.querySelectorAll(".filter-btn");

  filterButtons.forEach((btn) => btn.setAttribute("data-active", "false"));

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

  // ==========================================
  // FEATURE 1: NATIVE TERMINAL.CSS BUTTON FILTER
  // ==========================================
  filterButtons.forEach((button) => {
    bindSmartClick(button, () => {
      const isAlreadyActive = button.getAttribute("data-active") === "true";

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

      tables.forEach((table) => {
        const rows = table.querySelectorAll("tbody tr");
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
  });

  // ==========================================
  // FEATURE 2: STABLE COLUMN SORT ENGINE
  // ==========================================
  tables.forEach((table) => {
    const headers = table.querySelectorAll("thead th");
    const tbody = table.querySelector("tbody");
    const originalTextContents = Array.from(headers).map((h) =>
      h.textContent.trim(),
    );

    headers.forEach((header, index) => {
      bindSmartClick(header, () => {
        const rows = Array.from(tbody.querySelectorAll("tr"));
        const isDate = header.getAttribute("data-type") === "date";
        const setAsDescending = header.textContent.endsWith(" ▲");

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
