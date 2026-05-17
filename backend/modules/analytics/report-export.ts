import "server-only";

export type ReportCell = number | string | null;

export type ReportTable = {
  columns: string[];
  rows: ReportCell[][];
  title: string;
};

function xmlEscape(value: ReportCell) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pdfEscape(value: ReportCell) {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll(/\s+/g, " ")
    .slice(0, 80);
}

export function renderExcelXmlReport(table: ReportTable) {
  const rows = [table.columns, ...table.rows]
    .map(
      (row) =>
        `<Row>${row
          .map((cell) => `<Cell><Data ss:Type="String">${xmlEscape(cell)}</Data></Cell>`)
          .join("")}</Row>`,
    )
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Report">
    <Table>${rows}</Table>
  </Worksheet>
</Workbook>`;
}

function makePageContent(table: ReportTable, rows: ReportCell[][], page: number) {
  const title = `${table.title} - Page ${page}`;
  const header = table.columns.slice(0, 6);
  const lines = [
    `BT /F1 16 Tf 40 555 Td (${pdfEscape(title)}) Tj ET`,
    ...header.map(
      (column, index) =>
        `BT /F1 8 Tf ${40 + index * 125} 530 Td (${pdfEscape(column)}) Tj ET`,
    ),
    ...rows.flatMap((row, rowIndex) => {
      const y = 512 - rowIndex * 14;

      return row.slice(0, 6).map(
        (cell, columnIndex) =>
          `BT /F1 7 Tf ${40 + columnIndex * 125} ${y} Td (${pdfEscape(
            cell,
          )}) Tj ET`,
      );
    }),
  ];

  return lines.join("\n");
}

export function renderPdfReport(table: ReportTable) {
  const rowsPerPage = 30;
  const pages = Math.max(1, Math.ceil(table.rows.length / rowsPerPage));
  const fontObjectId = 3 + pages * 2;
  const objects: string[] = [];

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Kids [${Array.from(
    { length: pages },
    (_, index) => `${3 + index * 2} 0 R`,
  )
    .join(" ")}] /Count ${pages} >>`;

  for (let index = 0; index < pages; index += 1) {
    const pageObjectId = 3 + index * 2;
    const contentObjectId = pageObjectId + 1;
    const pageRows = table.rows.slice(index * rowsPerPage, (index + 1) * rowsPerPage);
    const content = makePageContent(table, pageRows, index + 1);

    objects[pageObjectId - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId - 1] =
      `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`;
  }

  objects[fontObjectId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let body = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body, "utf8"));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(body, "utf8");
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  body += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`)
    .join("");
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(body, "utf8");
}
