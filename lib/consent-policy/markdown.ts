import { COMPANY } from "./company";
import { buildPolicySections, type PolicyBlock } from "./policy-sections";
import type {
  ConsentDocument,
  PolicyDocument,
  ThirdPartyDocument,
} from "./documents";

function table(headers: string[], rows: string[][]): string {
  const head = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");
  return [head, divider, body, ""].join("\n");
}

/** 조항 본문 조각 하나를 markdown 줄 배열로 바꾼다. */
function blockToMarkdownLines(block: PolicyBlock): string[] {
  switch (block.kind) {
    case "p":
      return [block.text, ""];
    case "sub-heading":
      return [`### ${block.text}`, ""];
    case "table":
      return [table(block.headers, block.rows)];
    case "list":
      return [...block.items.map((item) => `- ${item}`), ""];
    case "fields":
      return block.items.flatMap((item) => [item, ""]);
  }
}

const CONSENT_INTRO: Record<ConsentDocument["kind"], (service: string) => string> = {
  required: (service) =>
    `${COMPANY.name}(이하 "당사")는 ${service} 서비스를 이용하는 경우 아래와 같이 개인정보를 수집 및 이용하고자 합니다. "이용자"는 ${service} 서비스에 게시된 "개인정보 처리방침"에서 보다 상세한 내용을 확인하실 수 있습니다.`,
  optional: (service) =>
    `${COMPANY.name}(이하 "당사")는 ${service} 서비스와 관련하여 아래와 같이 개인정보를 수집 및 이용하고자 합니다. 본 동의는 서비스 이용에 필수적인 동의가 아니므로, 동의를 거부하시더라도 서비스 이용이 가능합니다.`,
  sensitive: (service) =>
    `${COMPANY.name}(이하 "당사")는 ${service} 서비스를 이용하는 경우 아래와 같이 민감정보를 수집 및 이용하고자 합니다. "이용자"는 ${service} 서비스에 게시된 "개인정보 처리방침"에서 보다 상세한 내용을 확인하실 수 있습니다.`,
  unique: (service) =>
    `${COMPANY.name}(이하 "당사")는 ${service} 서비스를 이용하는 경우 아래와 같이 고유식별정보를 수집 및 이용하고자 합니다. "이용자"는 ${service} 서비스에 게시된 "개인정보 처리방침"에서 보다 상세한 내용을 확인하실 수 있습니다.`,
  child: (service) =>
    `${COMPANY.name}(이하 "당사")는 ${service} 서비스를 이용하는 만 14세 미만 이용자의 경우 아래와 같이 개인정보를 수집 및 이용하고자 합니다. 법정대리인의 동의를 받아야 처리할 수 있습니다.`,
};

const CONSENT_REFUSAL: Record<ConsentDocument["kind"], (service: string) => string> = {
  required: (service) =>
    `위의 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 그러나 동의를 거부할 경우 ${service} 서비스 이용에 제한을 받을 수 있습니다.`,
  optional: () =>
    "귀하는 위 정보에 대한 수집·이용 동의를 거부할 수 있는 권리가 있으나, 이에 동의하지 않을 경우 관련 혜택이 제한될 수 있습니다.",
  sensitive: (service) =>
    `위의 민감정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 그러나 동의를 거부할 경우 ${service} 서비스 이용에 제한을 받을 수 있습니다.`,
  unique: (service) =>
    `위의 고유식별정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 그러나 동의를 거부할 경우 ${service} 서비스 이용에 제한을 받을 수 있습니다.`,
  child: (service) =>
    `법정대리인은 위의 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 그러나 동의를 거부할 경우 ${service} 서비스 이용에 제한을 받을 수 있습니다.`,
};

export function consentIntro(kind: ConsentDocument["kind"], serviceName: string): string {
  return CONSENT_INTRO[kind](serviceName);
}

export function consentRefusal(kind: ConsentDocument["kind"], serviceName: string): string {
  return CONSENT_REFUSAL[kind](serviceName);
}

function consentQuestionBlock(): string {
  return ["위와 같이 개인정보를 수집 및 이용하는데 동의하십니까?", "", "- [ ] 동의함", "- [ ] 동의하지 않음", ""].join(
    "\n",
  );
}

export function consentDocumentToMarkdown(doc: ConsentDocument, serviceName: string): string {
  const lines: string[] = [`# ${doc.title}`, "", CONSENT_INTRO[doc.kind](serviceName), ""];

  lines.push("## 개인정보 수집 및 이용 내역", "");
  lines.push(
    table(
      ["수집 및 이용 목적", "수집 항목", "보유 및 이용 기간"],
      doc.rows.map((row) => [row.purpose, row.items.join(", "), row.retention]),
    ),
  );

  if (doc.kind === "unique") {
    const withBasis = doc.rows.filter((row) => row.rrnBasis);
    if (withBasis.length > 0) {
      lines.push("## 주민등록번호 수집의 근거 법령", "");
      withBasis.forEach((row) => lines.push(`- ${row.purpose}: ${row.rrnBasis}`));
      lines.push("");
    }
  }

  if (doc.kind === "child") {
    lines.push(
      "## 법정대리인",
      "",
      "동의 시 아래 항목을 법정대리인으로부터 직접 수집합니다.",
      "",
      "- 법정대리인 성명: _________________",
      "- 법정대리인 연락처: _________________",
      "",
    );
  }

  lines.push(CONSENT_REFUSAL[doc.kind](serviceName), "");
  lines.push(consentQuestionBlock());

  return lines.join("\n");
}

export function thirdPartyDocumentToMarkdown(doc: ThirdPartyDocument, serviceName: string): string {
  const lines: string[] = [
    `# ${doc.title}`,
    "",
    `${COMPANY.name}(이하 "당사")는 ${serviceName} 서비스를 이용하는 경우 아래와 같이 개인정보를 제3자에게 제공하고자 합니다.`,
    "",
    "## 개인정보 제3자 제공 내역",
    "",
    table(
      ["제공받는 자", "제공 목적", "제공 항목", "보유 및 이용기간"],
      doc.rows.map((row) => [row.recipient, row.purpose, row.items, row.retention]),
    ),
  ];

  lines.push(
    `위와 같이 개인정보를 제공하는 데 동의를 거부할 권리가 있습니다. 그러나 동의를 거부할 경우 ${serviceName} 서비스 이용에 제한을 받을 수 있습니다.`,
    "",
  );
  lines.push(consentQuestionBlock());

  return lines.join("\n");
}

export function policyDocumentToMarkdown(doc: PolicyDocument): string {
  const sections = buildPolicySections(doc);

  const lines: string[] = [
    "# 개인정보 처리방침",
    "",
    `${COMPANY.name}(이하 "회사")는 회사가 제공하는 ${doc.serviceName} 서비스(이하 "서비스")를 이용하는 이용자님의 개인정보를 보호하기 위하여 「개인정보 보호법」 등 관련 법령상의 개인정보 보호 규정을 준수하고 있으며, 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.`,
    "",
    `> 시행일: ${doc.effectiveDateLabel}`,
    "",
    "## 목차",
    "",
    ...sections.map((section, i) => `${i + 1}. ${section.title}`),
    "",
  ];

  sections.forEach((section, i) => {
    lines.push(`## ${i + 1}. ${section.title}`, "");
    section.body.forEach((block) => lines.push(...blockToMarkdownLines(block)));
  });

  return lines.join("\n");
}

const CONSENT_FILE_LABEL: Record<ConsentDocument["kind"], string> = {
  required: "개인정보_수집이용_동의서_필수",
  optional: "개인정보_수집이용_동의서_선택",
  sensitive: "민감정보_수집이용_동의서",
  unique: "고유식별정보_수집이용_동의서",
  child: "개인정보_수집이용_동의서_만14세미만",
};

/** 확장자 없는 base 파일명. 다운로드 형식(md/html/doc)에 따라 확장자를 붙이는 쪽에서 쓴다. */
export function fileNameFor(serviceName: string, label: string): string {
  const slug = (serviceName || "서비스").replace(/\s+/g, "");
  return `${slug}_${label}`;
}

export function consentFileName(doc: ConsentDocument, serviceName: string): string {
  return `${fileNameFor(serviceName, CONSENT_FILE_LABEL[doc.kind])}.md`;
}

export function thirdPartyFileName(serviceName: string): string {
  return `${fileNameFor(serviceName, "개인정보_제3자제공_동의서")}.md`;
}

export function policyFileName(serviceName: string): string {
  return `${fileNameFor(serviceName, "개인정보_처리방침")}.md`;
}
