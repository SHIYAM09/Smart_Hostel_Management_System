/**
 * Enterprise Data Export & Reporting Utility
 * Supports CSV, JSON, and Print/PDF export operations without third-party dependencies.
 */

export function exportToCSV(filename, rows, columns) {
  if (!rows || !rows.length) {
    alert("No data available to export.");
    return;
  }

  const headers = columns ? columns.map(c => c.label || c.key) : Object.keys(rows[0]);
  const keys = columns ? columns.map(c => c.key) : Object.keys(rows[0]);

  const csvRows = [];
  csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(","));

  for (const row of rows) {
    const values = keys.map(k => {
      let val = row[k];
      if (val === null || val === undefined) val = "";
      if (typeof val === "object") val = JSON.stringify(val);

      const keyLower = k.toLowerCase();
      if (keyLower.includes("date") || keyLower.includes("reading_date") || keyLower.includes("submitted")) {
        let dStr = String(val).trim();
        if (dStr.includes("T")) dStr = dStr.slice(0, 10);
        if (dStr.length > 10) dStr = dStr.slice(0, 10);
        val = `\t${dStr}`;
      } else if (keyLower.includes("phone") || keyLower.includes("contact") || keyLower.includes("mobile")) {
        const digits = String(val).replace(/[^0-9]/g, "");
        if (digits.length >= 7) {
          val = `\t${digits}`;
        }
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(csvRows.join("\n"));
  const link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(filename, data) {
  if (!data) return;
  const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", jsonContent);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printReport(title, tableDataHtml) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Pop-up blocked! Please allow pop-ups to print reports.");
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - Report</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; }
          h1 { color: #0f172a; font-size: 24px; margin-bottom: 8px; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
          .meta { font-size: 12px; color: #64748b; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 14px; font-size: 13px; text-align: left; }
          th { background-color: #f8fafc; font-weight: 600; color: #334155; }
          tr:nth-child(even) { background-color: #f1f5f9; }
          .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="meta">Generated on: ${new Date().toLocaleString()} | Enterprise Smart Hostel System</div>
        ${tableDataHtml}
        <div class="footer">Confidential · Smart Hostel Management System Report</div>
        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
