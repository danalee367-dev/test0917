import { COMPANY, REDRESS_CONTACTS } from "./company";
import type { PolicyDocument } from "./documents";

/**
 * 처리방침 조항 하나의 본문을 이루는 조각. markdown.ts(다운로드)와
 * policy-document-view.tsx(화면)가 이 구조를 각자의 방식으로만 렌더링하고,
 * 조항의 구성·순서·문구는 이 파일 하나에서만 결정한다.
 */
export type PolicyBlock =
  | { kind: "p"; text: string }
  | { kind: "sub-heading"; text: string }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "list"; items: string[] }
  /** "라벨: 값" 형태의 필드를 줄 단위로 나열한다(연락처 블록 등). */
  | { kind: "fields"; items: string[] };

export interface PolicySection {
  title: string;
  body: PolicyBlock[];
}

const COOKIE_USED_BLOCKS: PolicyBlock[] = [
  {
    kind: "p",
    text:
      "회사는 서비스를 운영하는 과정에서 이용자의 서비스 이용에 필요한 항목을 자동으로 수집하기 위하여, 이용자의 정보를 수시로 저장하고 찾아내는 '쿠키(cookie)' 등 개인정보를 자동으로 수집하는 장치를 설치·운용합니다.",
  },
  {
    kind: "p",
    text: "쿠키란 웹사이트를 운영하는 데 이용되는 서버가 이용자의 브라우저에 보내는 아주 작은 텍스트 파일로서 이용자의 컴퓨터 하드디스크에 저장됩니다.",
  },
  {
    kind: "p",
    text:
      "이용자는 웹 브라우저의 옵션을 설정함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다. 단, 쿠키 설치를 거부할 경우 서비스 제공에 어려움이 있을 수 있습니다.",
  },
  { kind: "p", text: "웹 브라우저에서 쿠키를 허용하거나 차단하는 방법은 다음과 같습니다." },
  {
    kind: "list",
    items: [
      "크롬(Chrome): 웹 브라우저 설정 > 개인정보 보호 및 보안 > 인터넷 사용 기록 삭제",
      "엣지(Edge): 웹 브라우저 설정 > 쿠키 및 사이트 권한 > 쿠키 및 사이트 데이터 관리 및 삭제",
    ],
  },
];

/**
 * "개인정보 처리방침의 변경에 관한 사항"은 어떤 조항이 조건부로 추가되더라도 항상 마지막
 * 번호여야 한다. 그래서 번호를 각 섹션에 직접 쓰지 않고, 이 배열의 순서로만 매긴다.
 */
export function buildPolicySections(doc: PolicyDocument): PolicySection[] {
  const sections: PolicySection[] = [
    {
      title: "개인정보의 처리목적, 처리 항목, 보유 및 이용 기간",
      body: [
        {
          kind: "p",
          text: "회사는 다음의 개인정보 항목을 개인정보 보호법 제15조 제1항 제1호, 제22조 제1항 제1호에 따라 정보주체의 동의를 받아 처리하고 있습니다.",
        },
        {
          kind: "table",
          headers: ["필수/선택", "목적", "수집하는 개인정보 항목", "보유 및 이용기간"],
          rows: doc.purposeRows.map((row) => [row.tier, row.purpose, row.items.join(", "), row.retention]),
        },
        ...(doc.lawRows.length > 0
          ? ([
              { kind: "sub-heading", text: "1-1) 관계 법령에 따른 보유 및 이용 기간" },
              { kind: "p", text: "회사는 관계 법령의 규정에 해당하는 경우 아래와 같이 개인정보를 보존합니다." },
              {
                kind: "table",
                headers: ["보존 대상", "보존 기간 및 근거"],
                rows: doc.lawRows.map((law) => [law.what, `${law.term} (${law.law})`]),
              },
            ] satisfies PolicyBlock[])
          : []),
      ],
    },
    ...(doc.hasChildData
      ? [
          {
            title: "14세 미만 아동의 개인정보 처리에 관한 사항",
            body: [
              {
                kind: "p",
                text: "회사는 만 14세 미만 아동의 개인정보를 처리하기 위하여 동의가 필요한 경우, 법정대리인의 동의를 받은 후에만 처리합니다.",
              },
              {
                kind: "p",
                text: "법정대리인의 동의를 받을 때에는 법정대리인 확인에 필요한 최소한의 정보만 수집하며, 그 목적 외로 이용하지 않습니다.",
              },
              {
                kind: "p",
                text: "법정대리인은 아동의 개인정보에 대한 열람, 정정·삭제, 처리정지 및 동의 철회를 요구할 수 있고, 아동 본인이 요청하는 경우에도 법정대리인의 동의 여부를 확인한 후 처리합니다.",
              },
            ] satisfies PolicyBlock[],
          },
        ]
      : []),
    {
      title: "개인정보의 제3자 제공에 관한 사항",
      body: [
        {
          kind: "p",
          text:
            doc.thirdPartyRows.length === 0
              ? "회사는 정보주체의 개인정보를 개인정보의 처리 목적에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공하고 그 이외에는 정보주체의 개인정보를 제3자에게 제공하지 않습니다."
              : "회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 보호법 제17조 제1항 제1호에 따라 정보주체의 동의를 얻어 필요 최소한의 범위로만 제공합니다.",
        },
        ...(doc.thirdPartyRows.length > 0
          ? ([
              {
                kind: "table",
                headers: ["제공받는 자", "제공 목적", "제공 항목", "보유 및 이용기간"],
                rows: doc.thirdPartyRows.map((row) => [row.recipient, row.purpose, row.items, row.retention]),
              },
            ] satisfies PolicyBlock[])
          : []),
      ],
    },
    {
      title: "개인정보 처리 업무의 위탁에 관한 사항",
      body: [
        {
          kind: "p",
          text:
            doc.processorRows.length === 0
              ? "회사는 개인정보 처리와 관련한 별도의 위탁 사항이 없습니다."
              : "회사는 보다 나은 서비스 제공과 이용자 편의 제공 등 업무 수행을 원활하게 하기 위하여 이용자의 개인정보 처리를 제3자에게 위탁할 수 있습니다. 회사는 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.",
        },
        ...(doc.processorRows.length > 0
          ? ([
              {
                kind: "table",
                headers: ["위탁 받는 자 (수탁자)", "위탁 업무 내용"],
                rows: doc.processorRows.map((row) => [row.name, row.work]),
              },
            ] satisfies PolicyBlock[])
          : []),
      ],
    },
    {
      title: "개인정보의 추가적인 이용·제공 판단 기준",
      body: [
        {
          kind: "p",
          text: "회사는 개인정보 보호법 제15조 제3항 및 제17조 제4항에 따라, 당초 수집 목적과의 관련성, 처리 관행에 비춘 예측 가능성, 정보주체의 이익 침해 여부, 가명처리 또는 암호화 등 안전성 확보 조치 여부를 고려한 후에만 정보주체의 동의 없이 개인정보를 추가적으로 이용·제공합니다.",
        },
      ],
    },
    {
      title: "개인정보의 국외이전",
      body: [{ kind: "p", text: "회사는 이용자의 정보를 국외로 이전하지 않습니다." }],
    },
    {
      title: "개인정보 파기 절차 및 방법에 관한 사항",
      body: [
        {
          kind: "p",
          text: "회사는 이용자의 개인정보를 수집 및 이용목적이 달성되면 지체 없이 파기합니다. 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기하고, 전자적 파일형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.",
        },
      ],
    },
    {
      title: "개인정보의 안전성 확보 조치에 관한 사항",
      body: [
        {
          kind: "p",
          text: "회사는 개인정보처리시스템의 접근 권한 관리와 접근 통제, 접속 기록 보관, 개인정보의 암호화 등 기술적 조치와, 내부관리계획 수립·시행 및 취급 직원 정기 교육 등 관리적 조치, 전산실과 자료 보관실의 출입통제 등 물리적 조치를 시행하고 있습니다.",
        },
      ],
    },
    {
      title: "정보주체와 법정대리인의 권리·의무 및 행사 방법",
      body: [
        {
          kind: "p",
          text: "이용자 및 법정대리인은 언제든지 자신의 개인정보를 열람하거나 정정할 수 있고 삭제 및 처리 정지를 요구할 수 있으며, 수집·이용·제공에 대한 동의를 철회할 수 있습니다. 아래 개인정보 보호책임자 조항의 연락처로 서면 또는 전자우편으로 요청하시면 지체 없이 조치하겠습니다.",
        },
      ],
    },
    {
      title: "개인정보 자동 수집의 목적 및 거부에 관한 사항",
      body: doc.usesCookies
        ? COOKIE_USED_BLOCKS
        : [
            {
              kind: "p",
              text: "회사는 이용자의 이용 정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용하지 않습니다.",
            },
          ],
    },
    {
      title: "개인정보 보호책임자 및 열람 청구 접수·처리 부서",
      body: [
        {
          kind: "fields",
          items: [
            `개인정보 보호책임자: ${COMPANY.privacyOfficer}`,
            `개인정보 운영책임자: ${doc.department || "(미입력)"}`,
            `전화번호: ${doc.ownerPhone}`,
            `이메일 주소: ${doc.ownerEmail || "(미입력)"}`,
          ],
        },
      ],
    },
    {
      title: "권익침해 구제 방법",
      body: [
        {
          kind: "list",
          items: REDRESS_CONTACTS.map((contact) => `${contact.name}: ${contact.phone} (${contact.url})`),
        },
      ],
    },
  ];

  if (doc.usesLocation) {
    sections.push({
      title: "위치정보의 처리에 관한 사항",
      body: [
        {
          kind: "p",
          text: "회사는 위치기반서비스의 제공을 위하여 이용자의 개인위치정보를 수집·이용하며, 이 경우 「위치정보의 보호 및 이용 등에 관한 법률」이 개인정보 보호법과 함께 적용됩니다.",
        },
        {
          kind: "p",
          text: "회사는 개인위치정보를 이용자가 지정한 제3자에게 제공하는 경우에는 개인위치정보를 수집한 해당 통신단말장치로 매회 이용자에게 제공받는 자, 제공 일시 및 제공 목적을 즉시 통보합니다.",
        },
        {
          kind: "p",
          text: "이용자는 언제든지 개인위치정보의 수집·이용·제공에 대한 동의의 전부 또는 일부를 철회할 수 있고, 일시적으로 위치정보의 수집·이용·제공을 중지할 것을 요구할 수 있습니다. 이 경우 회사는 정당한 사유 없이 요구를 거절하지 않으며 이를 위한 기술적 수단을 갖추고 있습니다.",
        },
        {
          kind: "p",
          text: "이용자는 개인위치정보의 수집·이용·제공사실 확인자료의 열람 또는 고지를 요구할 수 있으며, 자신의 개인위치정보와 관련하여 오류가 있는 경우 정정을 요구할 수 있습니다.",
        },
      ],
    });
  }

  // "변경에 관한 사항"은 어떤 조항이 앞에 더 붙어도 항상 마지막 번호를 받도록 맨 뒤에 둔다.
  sections.push({
    title: "개인정보 처리방침의 변경에 관한 사항",
    body: [{ kind: "p", text: `본 개인정보 처리방침은 ${doc.effectiveDateLabel}부터 시행합니다.` }],
  });

  return sections;
}
