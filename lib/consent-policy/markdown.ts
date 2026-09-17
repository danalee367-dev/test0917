import { COMPANY, REDRESS_CONTACTS } from "./company";
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

/**
 * 쿠키를 쓸 때의 9번 조항 문구. 개인정보 처리방침 작성지침과 사내 템플릿의 문구를 따르며,
 * 웹 브라우저 기준 허용/차단 방법만 안내한다(모바일 브라우저는 범위 밖).
 */
const COOKIE_SECTION_LINES: string[] = [
  "회사는 서비스를 운영하는 과정에서 이용자의 서비스 이용에 필요한 항목을 자동으로 수집하기 위하여, 이용자의 정보를 수시로 저장하고 찾아내는 '쿠키(cookie)' 등 개인정보를 자동으로 수집하는 장치를 설치·운용합니다.",
  "",
  "쿠키란 웹사이트를 운영하는 데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로서 이용자의 컴퓨터 하드디스크에 저장됩니다.",
  "",
  "이용자는 웹 브라우저의 옵션을 설정함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다. 단, 쿠키 설치를 거부할 경우 서비스 제공에 어려움이 있을 수 있습니다.",
  "",
  "웹 브라우저에서 쿠키를 허용하거나 차단하는 방법은 다음과 같습니다.",
  "",
  "- 크롬(Chrome): 웹 브라우저 설정 > 개인정보 보호 및 보안 > 인터넷 사용 기록 삭제",
  "- 엣지(Edge): 웹 브라우저 설정 > 쿠키 및 사이트 권한 > 쿠키 및 사이트 데이터 관리 및 삭제",
];

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

/** 처리방침의 조항 하나. 번호는 이 배열의 순서로 자동 매겨지므로, 여기서는 번호를 쓰지 않는다. */
interface PolicySection {
  title: string;
  body: string[];
}

/**
 * "개인정보 처리방침의 변경에 관한 사항"은 어떤 조항이 조건부로 추가되더라도 항상 마지막 번호여야 한다.
 * 그래서 번호를 문자열에 박아두지 않고, 조항을 배열로 구성해 마지막에 변경 조항을 붙인 뒤 인덱스로 번호를 매긴다.
 */
function buildPolicySections(doc: PolicyDocument): PolicySection[] {
  const sections: PolicySection[] = [
    {
      title: "개인정보의 처리목적, 처리 항목, 보유 및 이용 기간",
      body: [
        "회사는 다음의 개인정보 항목을 개인정보 보호법 제15조 제1항 제1호, 제22조 제1항 제1호에 따라 정보주체의 동의를 받아 처리하고 있습니다.",
        "",
        table(
          ["필수/선택", "목적", "수집하는 개인정보 항목", "보유 및 이용기간"],
          doc.purposeRows.map((row) => [row.tier, row.purpose, row.items.join(", "), row.retention]),
        ),
        ...(doc.lawRows.length > 0
          ? [
              "### 1-1) 관계 법령에 따른 보유 및 이용 기간",
              "",
              "회사는 관계 법령의 규정에 해당하는 경우 아래와 같이 개인정보를 보존합니다.",
              "",
              table(
                ["보존 대상", "보존 기간 및 근거"],
                doc.lawRows.map((law) => [law.what, `${law.term} (${law.law})`]),
              ),
            ]
          : []),
      ],
    },
    ...(doc.hasChildData
      ? [
          {
            title: "14세 미만 아동의 개인정보 처리에 관한 사항",
            body: [
              "회사는 만 14세 미만 아동의 개인정보를 처리하기 위하여 동의가 필요한 경우, 법정대리인의 동의를 받은 후에만 처리합니다.",
              "",
              "법정대리인의 동의를 받을 때에는 법정대리인 확인에 필요한 최소한의 정보만 수집하며, 그 목적 외로 이용하지 않습니다.",
              "",
              "법정대리인은 아동의 개인정보에 대한 열람, 정정·삭제, 처리정지 및 동의 철회를 요구할 수 있고, 아동 본인이 요청하는 경우에도 법정대리인의 동의 여부를 확인한 후 처리합니다.",
            ],
          },
        ]
      : []),
    {
      title: "개인정보의 제3자 제공에 관한 사항",
      body: [
        doc.thirdPartyRows.length === 0
          ? "회사는 정보주체의 개인정보를 개인정보의 처리 목적에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공하고 그 이외에는 정보주체의 개인정보를 제3자에게 제공하지 않습니다."
          : "회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 보호법 제17조 제1항 제1호에 따라 정보주체의 동의를 얻어 필요 최소한의 범위로만 제공합니다.",
        "",
        ...(doc.thirdPartyRows.length > 0
          ? [
              table(
                ["제공받는 자", "제공 목적", "제공 항목", "보유 및 이용기간"],
                doc.thirdPartyRows.map((row) => [row.recipient, row.purpose, row.items, row.retention]),
              ),
            ]
          : []),
      ],
    },
    {
      title: "개인정보 처리 업무의 위탁에 관한 사항",
      body: [
        doc.processorRows.length === 0
          ? "회사는 개인정보 처리와 관련한 별도의 위탁 사항이 없습니다."
          : "회사는 보다 나은 서비스 제공과 이용자 편의 제공 등 업무 수행을 원활하게 하기 위하여 이용자의 개인정보 처리를 제3자에게 위탁할 수 있습니다. 회사는 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.",
        "",
        ...(doc.processorRows.length > 0
          ? [
              table(
                ["위탁 받는 자 (수탁자)", "위탁 업무 내용"],
                doc.processorRows.map((row) => [row.name, row.work]),
              ),
            ]
          : []),
      ],
    },
    {
      title: "개인정보의 추가적인 이용·제공 판단 기준",
      body: [
        "회사는 개인정보 보호법 제15조 제3항 및 제17조 제4항에 따라, 당초 수집 목적과의 관련성, 처리 관행에 비춘 예측 가능성, 정보주체의 이익 침해 여부, 가명처리 또는 암호화 등 안전성 확보 조치 여부를 고려한 후에만 정보주체의 동의 없이 개인정보를 추가적으로 이용·제공합니다.",
      ],
    },
    { title: "개인정보의 국외이전", body: ["회사는 이용자의 정보를 국외로 이전하지 않습니다."] },
    {
      title: "개인정보 파기 절차 및 방법에 관한 사항",
      body: [
        "회사는 이용자의 개인정보를 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기하고, 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.",
      ],
    },
    {
      title: "개인정보의 안전성 확보 조치에 관한 사항",
      body: [
        "회사는 개인정보처리시스템의 접근 권한 관리와 접근 통제, 접속 기록 보관, 개인정보의 암호화 등 기술적 조치와, 내부관리계획 수립·시행 및 취급 직원 정기 교육 등 관리적 조치, 전산실과 자료 보관실의 출입통제 등 물리적 조치를 시행하고 있습니다.",
      ],
    },
    {
      title: "정보주체와 법정대리인의 권리·의무 및 행사 방법",
      body: [
        "이용자 및 법정대리인은 언제든지 자신의 개인정보를 열람하거나 정정할 수 있고 삭제 및 처리 정지를 요구할 수 있으며, 수집·이용·제공에 대한 동의를 철회할 수 있습니다. 아래 개인정보 보호책임자 조항의 연락처로 서면 또는 전자우편으로 요청하시면 지체 없이 조치하겠습니다.",
      ],
    },
    {
      title: "개인정보 자동 수집의 목적 및 거부에 관한 사항",
      body: doc.usesCookies
        ? COOKIE_SECTION_LINES
        : ["회사는 이용자의 이용 정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용하지 않습니다."],
    },
    {
      title: "개인정보 보호책임자 및 열람 청구 접수·처리 부서",
      body: [
        `개인정보 보호책임자: ${COMPANY.privacyOfficer} ${COMPANY.privacyOfficerName}`,
        "",
        `개인정보 운영책임자: ${doc.department}`,
        "",
        `전화번호: ${doc.ownerPhone}`,
        "",
        `이메일 주소: ${doc.ownerEmail}`,
      ],
    },
    {
      title: "권익침해 구제 방법",
      body: REDRESS_CONTACTS.map((contact) => `- ${contact.name}: ${contact.phone} (${contact.url})`),
    },
  ];

  if (doc.usesLocation) {
    sections.push({
      title: "위치정보의 처리에 관한 사항",
      body: [
        "회사는 위치기반서비스의 제공을 위하여 이용자의 개인위치정보를 수집·이용하며, 이 경우 「위치정보의 보호 및 이용 등에 관한 법률」이 개인정보 보호법과 함께 적용됩니다.",
        "",
        "회사는 개인위치정보를 이용자가 지정한 제3자에게 제공하는 경우에는 개인위치정보를 수집한 해당 통신단말장치로 매회 이용자에게 제공받는 자, 제공 일시 및 제공 목적을 즉시 통보합니다.",
        "",
        "이용자는 언제든지 개인위치정보의 수집·이용·제공에 대한 동의의 전부 또는 일부를 철회할 수 있고, 일시적으로 위치정보의 수집·이용·제공을 중지할 것을 요구할 수 있습니다. 이 경우 회사는 정당한 사유 없이 요구를 거절하지 않으며 이를 위한 기술적 수단을 갖추고 있습니다.",
        "",
        "이용자는 개인위치정보의 수집·이용·제공사실 확인자료의 열람 또는 고지를 요구할 수 있으며, 자신의 개인위치정보와 관련하여 오류가 있는 경우 정정을 요구할 수 있습니다.",
      ],
    });
  }

  // "변경에 관한 사항"은 어떤 조항이 앞에 더 붙어도 항상 마지막 번호를 받도록 맨 뒤에 둔다.
  sections.push({
    title: "개인정보 처리방침의 변경에 관한 사항",
    body: [`본 개인정보 처리방침은 ${doc.effectiveDateLabel}부터 시행합니다.`],
  });

  return sections;
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
    lines.push(`## ${i + 1}. ${section.title}`, "", ...section.body, "");
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
