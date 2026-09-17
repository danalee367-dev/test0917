import { describe, expect, test } from "vitest";
import { markdownToHtml } from "./markdown-to-html";

describe("markdownToHtml", () => {
  test("헤딩 레벨 1~3을 그대로 변환한다", () => {
    const html = markdownToHtml("# 제목1\n\n## 제목2\n\n### 제목3");
    expect(html).toContain("<h1>제목1</h1>");
    expect(html).toContain("<h2>제목2</h2>");
    expect(html).toContain("<h3>제목3</h3>");
  });

  test("파이프 테이블을 thead/tbody 구조로 바꾼다", () => {
    const html = markdownToHtml("| 목적 | 항목 |\n| --- | --- |\n| 회원가입 | 이름 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<th>목적</th>");
    expect(html).toContain("<td>회원가입</td>");
  });

  test("체크박스 목록은 유니코드 체크박스 문자로 바뀐다", () => {
    const html = markdownToHtml("- [ ] 동의함\n- [ ] 동의하지 않음");
    expect(html).toContain("☐ 동의함");
    expect(html).toContain("<ul>");
  });

  test("HTML 특수문자를 이스케이프한다", () => {
    const html = markdownToHtml("이용자 < 회사 & 제3자 > 위탁");
    expect(html).toContain("이용자 &lt; 회사 &amp; 제3자 &gt; 위탁");
  });

  test("숫자로 시작하는 목차 줄은 순서 목록으로 바뀐다", () => {
    const html = markdownToHtml("1. 처리목적\n2. 위탁");
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>처리목적</li>");
  });
});
