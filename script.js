document.addEventListener("DOMContentLoaded", () => {
  const tables = document.querySelectorAll(".archive-table");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // ==========================================
  // FEATURE 1: NATIVE TERMINAL.CSS BUTTON FILTER
  // ==========================================
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // In Terminal.css, if it doesn't have 'btn-ghost', it means it is highlighted/active
      const isAlreadyActive = !button.classList.contains("btn-ghost");

      // 1. RESET ALL BUTTONS: Force them all back to unhighlighted (ghost) states
      filterButtons.forEach((btn) => {
        btn.classList.remove("btn-tertiary");
        btn.classList.add("btn-ghost");
      });

      // 2. Evaluate target layout state
      let activeFilter = null;
      if (!isAlreadyActive) {
        button.classList.remove("btn-ghost");
        button.classList.add("btn-tertiary");
        activeFilter = button.getAttribute("data-filter");
      }

      // 3. Cascade visibility update to rows across all archive tables
      tables.forEach((table) => {
        const rows = table.querySelectorAll("tbody tr");

        rows.forEach((row) => {
          // Region data remains mapped to Column Index 2
          const rowRegion = row.cells[2].textContent.trim();

          if (activeFilter === null || rowRegion === activeFilter) {
            row.style.display = ""; // Render row
          } else {
            row.style.display = "none"; // Hide row
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
      header.addEventListener("click", () => {
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
});
