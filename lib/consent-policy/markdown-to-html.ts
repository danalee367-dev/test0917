/**
 * 이 프로젝트가 만드는 문서 markdown은 딱 이 서브셋만 쓴다: h1~h3 헤딩, 파이프 테이블,
 * 순서/비순서 리스트(체크박스 포함), 인용 한 줄, 빈 줄로 구분된 문단. 범용 markdown
 * 파서를 들이는 대신 이 서브셋만 이해하는 변환기를 직접 둔다.
 */

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isTableRow(line: string): boolean {
  return /^\|.*\|$/.test(line.trim());
}

function isTableDivider(line: string): boolean {
  return /^\|(\s*:?-+:?\s*\|)+$/.test(line.trim());
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(lines: string[]): string {
  const header = splitTableRow(lines[0]!);
  const bodyRows = lines.slice(2).map(splitTableRow);
  const head = `<thead><tr>${header.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>`;
  const body = `<tbody>${bodyRows
    .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
    .join("")}</tbody>`;
  return `<table>${head}${body}</table>`;
}

function renderListItemText(text: string): string {
  const checkbox = text.match(/^\[([ xX])\]\s*(.*)$/);
  if (checkbox) {
    const mark = checkbox[1] === " " ? "☐" : "☑";
    return `${mark} ${escapeHtml(checkbox[2]!)}`;
  }
  return escapeHtml(text);
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i]!;

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    if (isTableRow(line) && isTableDivider(lines[i + 1] ?? "")) {
      const tableLines: string[] = [line, lines[i + 1]!];
      let j = i + 2;
      while (j < lines.length && isTableRow(lines[j]!)) {
        tableLines.push(lines[j]!);
        j += 1;
      }
      html.push(renderTable(tableLines));
      i = j;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const level = heading[1]!.length;
      html.push(`<h${level}>${escapeHtml(heading[2]!)}</h${level}>`);
      i += 1;
      continue;
    }

    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      html.push(`<blockquote>${escapeHtml(quote[1]!)}</blockquote>`);
      i += 1;
      continue;
    }

    if (/^-\s+/.test(line)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^-\s+/.test(lines[j]!)) {
        items.push(lines[j]!.replace(/^-\s+/, ""));
        j += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${renderListItemText(item)}</li>`).join("")}</ul>`);
      i = j;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^\d+\.\s+/.test(lines[j]!)) {
        items.push(lines[j]!.replace(/^\d+\.\s+/, ""));
        j += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`);
      i = j;
      continue;
    }

    html.push(`<p>${escapeHtml(line)}</p>`);
    i += 1;
  }

  return html.join("\n");
}
