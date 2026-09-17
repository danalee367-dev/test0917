import { escapeHtml, markdownToHtml } from "./markdown-to-html";

export type DownloadFormat = "md" | "html" | "doc";

export const DOWNLOAD_FORMAT_LABEL: Record<DownloadFormat, string> = {
  md: "Markdown (.md)",
  html: "웹 문서 (.html)",
  doc: "워드 문서 (.doc)",
};

const DOCUMENT_STYLE = `
  body { font-family: "Malgun Gothic", "맑은 고딕", sans-serif; line-height: 1.7; color: #1a1a1a; padding: 24px; }
  h1 { font-size: 20px; }
  h2 { font-size: 16px; margin-top: 28px; }
  h3 { font-size: 14px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #999; padding: 6px 10px; font-size: 13px; text-align: left; }
  th { background: #f2f2f2; }
  blockquote { color: #555; border-left: 3px solid #ccc; margin: 0; padding-left: 10px; }
`;

function htmlShell(title: string, bodyHtml: string): string {
  return [
    "<!DOCTYPE html>",
    '<html lang="ko">',
    "<head>",
    '<meta charset="utf-8">',
    `<title>${escapeHtml(title)}</title>`,
    `<style>${DOCUMENT_STYLE}</style>`,
    "</head>",
    "<body>",
    bodyHtml,
    "</body>",
    "</html>",
  ].join("\n");
}

/**
 * Word가 열 수 있는 HTML 기반 .doc. 실제 OOXML(.docx)이 아니라, MS Office가 예전부터
 * 지원해 온 "Word HTML" 포맷이다. xmlns:w/xmlns:o 선언과 mso 전용 meta를 붙이면
 * Word가 이 파일을 자기 문서로 인식해서 그대로 열어 편집할 수 있다.
 */
function wordShell(title: string, bodyHtml: string): string {
  return [
    "<!DOCTYPE html>",
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">',
    "<head>",
    '<meta charset="utf-8">',
    `<title>${escapeHtml(title)}</title>`,
    "<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->",
    `<style>${DOCUMENT_STYLE}</style>`,
    "</head>",
    "<body>",
    bodyHtml,
    "</body>",
    "</html>",
  ].join("\n");
}

const MIME_TYPE: Record<DownloadFormat, string> = {
  md: "text/markdown;charset=utf-8",
  html: "text/html;charset=utf-8",
  doc: "application/msword;charset=utf-8",
};

function contentFor(format: DownloadFormat, title: string, markdown: string): string {
  if (format === "md") return markdown;
  const bodyHtml = markdownToHtml(markdown);
  return format === "html" ? htmlShell(title, bodyHtml) : wordShell(title, bodyHtml);
}

function triggerDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** filename은 확장자 없는 파일명(예: "LG홈케어멤버십_개인정보_처리방침")을 받는다. */
export function downloadDocument(format: DownloadFormat, filename: string, title: string, markdown: string): void {
  triggerDownload(`${filename}.${format}`, contentFor(format, title, markdown), MIME_TYPE[format]);
}
