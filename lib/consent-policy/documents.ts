import { COMPANY } from "./company";
import { defaultEffectiveDate, formatKoreanDate, resolveEffectiveDate } from "./date";
import { isGroupComplete, isSensitiveEffective, isUniqueEffective } from "./selectors";
import { purposeLabel } from "./types";
import type { LawReference, Processor, PurposeGroup, WizardState } from "./types";

export interface ConsentRow {
  purpose: string;
  items: string[];
  retention: string;
  /** 주민등록번호가 포함된 고유식별정보 행에만 붙는 수집 근거 법령 */
  rrnBasis?: string;
}

export type ConsentDocKind = "required" | "optional" | "sensitive" | "unique" | "child";

export interface ConsentDocument {
  kind: ConsentDocKind;
  title: string;
  rows: ConsentRow[];
}

export interface ThirdPartyRow {
  recipient: string;
  purpose: string;
  items: string;
  retention: string;
}

export interface ThirdPartyDocument {
  title: string;
  rows: ThirdPartyRow[];
}

export interface PolicyPurposeRow {
  tier: "필수" | "선택";
  purpose: string;
  items: string[];
  retention: string;
}

export interface PolicyDocument {
  serviceName: string;
  effectiveDateLabel: string;
  purposeRows: PolicyPurposeRow[];
  lawRows: LawReference[];
  thirdPartyRows: ThirdPartyRow[];
  processorRows: Processor[];
  department: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  /** 자동 수집 항목에 '쿠키'를 골랐는지. 9번 조항의 쿠키 사용/미사용 문구를 가른다. */
  usesCookies: boolean;
  /** 위치정보 카테고리 항목을 하나라도 골랐는지. 위치정보 조항을 추가할지 가른다. */
  usesLocation: boolean;
  /** 만 14세 미만 답을 예로 한 묶음이 있는지. 아동 개인정보 처리 조항을 추가할지 가른다. */
  hasChildData: boolean;
}

export interface DocumentSet {
  /** 서비스명이 비었을 때의 대체 문구까지 적용된, 문서 전체가 공유하는 값 */
  serviceName: string;
  consents: ConsentDocument[];
  thirdParty: ThirdPartyDocument | null;
  policy: PolicyDocument;
}

/** 서비스명이 비어 있으면 모든 문서·화면이 같은 대체 문구를 쓰도록 fallback을 한 곳에 모은다. */
export function resolveServiceName(name: string): string {
  return name.trim() || "(서비스명 미입력)";
}

/** 필수 동의서 한 종류를 제외하면 모두 제목 끝에 "(선택)"을 붙여, 거부해도 서비스 이용에
 * 지장이 없는 동의라는 것을 제목만 보고도 알 수 있게 한다. */
const DOC_TITLES: Record<ConsentDocKind, string> = {
  required: "개인정보 수집 및 이용 동의서",
  optional: "개인정보 수집 및 이용 동의서 (선택)",
  sensitive: "민감정보 수집 및 이용 동의서 (선택)",
  unique: "고유식별정보 수집 및 이용 동의서 (선택)",
  child: "개인정보 수집 및 이용 동의서(만 14세 미만) (선택)",
};

function generalRows(groups: PurposeGroup[], tier: "required" | "optional"): ConsentRow[] {
  return groups
    .filter(isGroupComplete)
    .map((group) => ({
      purpose: purposeLabel(group),
      items: group.selectedItems
        .filter((item) => item.tier === tier && !isSensitiveEffective(item, group) && !isUniqueEffective(item))
        .map((item) => item.name),
      retention: group.retention,
    }))
    .filter((row) => row.items.length > 0);
}

function sensitiveRows(groups: PurposeGroup[]): ConsentRow[] {
  return groups
    .filter(isGroupComplete)
    .map((group) => ({
      purpose: purposeLabel(group),
      items: group.selectedItems
        .filter((item) => isSensitiveEffective(item, group))
        .map((item) => item.name),
      retention: group.retention,
    }))
    .filter((row) => row.items.length > 0);
}

function uniqueRows(groups: PurposeGroup[]): ConsentRow[] {
  return groups
    .filter(isGroupComplete)
    .map((group) => {
      const items = group.selectedItems.filter(isUniqueEffective).map((item) => item.name);
      const hasRrn = group.selectedItems.some((item) => item.kind === "rrn");
      return {
        purpose: purposeLabel(group),
        items,
        retention: group.retention,
        ...(hasRrn && group.rrnBasis ? { rrnBasis: group.rrnBasis } : {}),
      };
    })
    .filter((row) => row.items.length > 0);
}

function childRows(groups: PurposeGroup[]): ConsentRow[] {
  return groups
    .filter((group) => isGroupComplete(group) && group.ageAnswer === "yes")
    .map((group) => ({
      purpose: purposeLabel(group),
      items: group.selectedItems.map((item) => item.name),
      retention: group.retention,
    }));
}

function buildConsentDocuments(groups: PurposeGroup[]): ConsentDocument[] {
  const byKind: Array<{ kind: ConsentDocKind; rows: ConsentRow[] }> = [
    { kind: "required", rows: generalRows(groups, "required") },
    { kind: "optional", rows: generalRows(groups, "optional") },
    { kind: "sensitive", rows: sensitiveRows(groups) },
    { kind: "unique", rows: uniqueRows(groups) },
    { kind: "child", rows: childRows(groups) },
  ];

  return byKind
    .filter((doc) => doc.rows.length > 0)
    .map((doc) => ({ kind: doc.kind, title: DOC_TITLES[doc.kind], rows: doc.rows }));
}

function buildThirdPartyDocument(state: WizardState): ThirdPartyDocument | null {
  const { noThirdParties, thirdParties } = state.sharing;
  if (noThirdParties || thirdParties.length === 0) return null;
  return {
    title: "개인정보 제3자 제공 동의서 (선택)",
    rows: thirdParties.map((tp): ThirdPartyRow => ({
      recipient: tp.name,
      purpose: tp.purpose,
      items: tp.items,
      retention: tp.retention,
    })),
  };
}

function dedupeLaws(groups: PurposeGroup[]): LawReference[] {
  const seen = new Map<string, LawReference>();
  for (const group of groups) {
    if (!isGroupComplete(group) || !group.purpose) continue;
    for (const law of group.purpose.laws) {
      seen.set(`${law.what}__${law.law}`, law);
    }
  }
  return [...seen.values()];
}

function buildPolicyDocument(state: WizardState, today: Date, serviceName: string): PolicyDocument {
  const groups = state.purposeGroups.filter(isGroupComplete);
  const effectiveDate = resolveEffectiveDate(state.serviceInfo.effectiveDate, today);
  const allSelectedItems = groups.flatMap((group) => group.selectedItems);
  const usesCookies = allSelectedItems.some((item) => item.name === "쿠키");
  const usesLocation = allSelectedItems.some((item) => item.kind === "location");
  const hasChildData = groups.some((group) => group.ageAnswer === "yes");

  return {
    serviceName,
    effectiveDateLabel: formatKoreanDate(effectiveDate),
    // 같은 목적 안에도 필수 항목과 선택 항목이 섞일 수 있어, 목적 하나가 필수 행과 선택 행으로
    // 나뉠 수 있다(둘 다 있으면 두 줄, 한쪽만 있으면 한 줄).
    purposeRows: groups.flatMap((group): PolicyPurposeRow[] => {
      const requiredItems = group.selectedItems.filter((item) => item.tier === "required").map((item) => item.name);
      const optionalItems = group.selectedItems.filter((item) => item.tier === "optional").map((item) => item.name);
      const rows: PolicyPurposeRow[] = [];
      if (requiredItems.length > 0) {
        rows.push({ tier: "필수", purpose: purposeLabel(group), items: requiredItems, retention: group.retention });
      }
      if (optionalItems.length > 0) {
        rows.push({ tier: "선택", purpose: purposeLabel(group), items: optionalItems, retention: group.retention });
      }
      return rows;
    }),
    lawRows: dedupeLaws(groups),
    thirdPartyRows:
      state.sharing.noThirdParties || state.sharing.thirdParties.length === 0
        ? []
        : state.sharing.thirdParties.map((tp) => ({
            recipient: tp.name,
            purpose: tp.purpose,
            items: tp.items,
            retention: tp.retention,
          })),
    processorRows:
      state.sharing.noProcessors || state.sharing.processors.length === 0
        ? []
        : state.sharing.processors,
    department: state.serviceInfo.department,
    ownerName: state.serviceInfo.ownerName,
    ownerPhone: state.serviceInfo.ownerPhone || COMPANY.defaultPhone,
    ownerEmail: state.serviceInfo.ownerEmail,
    usesCookies,
    usesLocation,
    hasChildData,
  };
}

export function buildDocuments(state: WizardState, today: Date = new Date()): DocumentSet {
  const serviceName = resolveServiceName(state.serviceInfo.name);
  return {
    serviceName,
    consents: buildConsentDocuments(state.purposeGroups),
    thirdParty: buildThirdPartyDocument(state),
    policy: buildPolicyDocument(state, today, serviceName),
  };
}

export { defaultEffectiveDate };
