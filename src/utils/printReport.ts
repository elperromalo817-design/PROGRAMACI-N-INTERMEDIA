/**
 * Robust Print & Document Export Utility for Lean Construction Reports
 * Handles iframe restrictions by opening a clean printable window and offering HTML download.
 */

export function printReportDocument(title: string, reportHtml: string): void {
  // Try opening a popup print window
  const printWindow = window.open('', '_blank', 'width=950,height=800,menubar=no,toolbar=no,location=no,status=no');

  const fullHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 24px;
      font-size: 12px;
      line-height: 1.5;
    }

    @page {
      size: A4 portrait;
      margin: 15mm;
    }

    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-after: always;
      }
    }

    .report-container {
      max-width: 850px;
      margin: 0 auto;
    }

    .report-header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .badge-category {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #1d4ed8;
      display: block;
      margin-bottom: 4px;
    }

    h1 {
      font-size: 18px;
      font-weight: 900;
      color: #020617;
      text-transform: uppercase;
      letter-spacing: -0.02em;
    }

    .project-name {
      font-size: 12px;
      color: #475569;
      font-weight: 600;
      margin-top: 2px;
    }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-bottom: 20px;
      background: #f8fafc;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .kpi-box {
      display: flex;
      flex-direction: column;
    }

    .kpi-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }

    .kpi-val {
      font-size: 18px;
      font-weight: 900;
      color: #0f172a;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 11px;
    }

    th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #cbd5e1;
      font-size: 10.5px;
      text-transform: uppercase;
    }

    td {
      padding: 8px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    .status-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9.5px;
      font-weight: 800;
      text-transform: uppercase;
    }

    .status-blocked {
      background: #ffe4e6;
      color: #9f1239;
      border: 1px solid #fecdd3;
    }

    .status-pending {
      background: #fee2e2;
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    .status-gestion {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
    }

    .status-ready {
      background: #dcfce7;
      color: #166534;
      border: 1px solid #bbf7d0;
    }

    .signatures {
      margin-top: 36px;
      padding-top: 16px;
      border-top: 1px solid #cbd5e1;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      text-align: center;
    }

    .sig-line {
      border-bottom: 1px solid #64748b;
      margin-bottom: 8px;
      height: 40px;
    }

    .sig-name {
      font-weight: 700;
      font-size: 11px;
      color: #0f172a;
    }

    .sig-role {
      font-size: 9.5px;
      color: #64748b;
    }

    .print-actions {
      position: fixed;
      top: 16px;
      right: 16px;
      background: #ffffff;
      padding: 8px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border: 1px solid #cbd5e1;
      display: flex;
      gap: 8px;
      z-index: 9999;
    }

    .btn-print {
      background: #1d4ed8;
      color: #ffffff;
      border: none;
      padding: 8px 14px;
      font-weight: 700;
      font-size: 12px;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-close {
      background: #e2e8f0;
      color: #334155;
      border: none;
      padding: 8px 12px;
      font-weight: 600;
      font-size: 12px;
      border-radius: 6px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="print-actions no-print">
    <button class="btn-print" onclick="window.print()">Imprimir / Guardar como PDF</button>
    <button class="btn-close" onclick="window.close()">Cerrar</button>
  </div>
  <div class="report-container">
    ${reportHtml}
  </div>
  <script>
    window.onload = function() {
      // Auto trigger print dialogue after rendering
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
`;

  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
  } else {
    // Fallback: If popup was blocked by browser, trigger direct download of HTML/PDF-ready doc
    downloadHtmlReport(title, reportHtml);
  }
}

export function downloadHtmlReport(title: string, reportHtml: string): void {
  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; color: #0f172a; padding: 30px; font-size: 12px; }
    .report-container { max-width: 850px; margin: 0 auto; }
    .report-header { border-bottom: 2px solid #0f172a; padding-bottom: 14px; margin-bottom: 16px; display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
    th { background: #f1f5f9; color: #334155; text-align: left; padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; }
    td { padding: 8px; border: 1px solid #e2e8f0; vertical-align: top; }
    .status-badge { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; text-transform: uppercase; }
    .status-blocked { background: #ffe4e6; color: #9f1239; }
    .status-pending { background: #fee2e2; color: #991b1b; }
    .status-gestion { background: #fef3c7; color: #92400e; }
    .status-ready { background: #dcfce7; color: #166534; }
    .signatures { margin-top: 36px; padding-top: 16px; border-top: 1px solid #cbd5e1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center; }
    .sig-line { border-bottom: 1px solid #64748b; height: 35px; margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="report-container">
    ${reportHtml}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().slice(0, 10)}.html`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
