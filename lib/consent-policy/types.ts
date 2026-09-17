export type ItemKind =
  | "normal"
  | "sensitive"
  | "biometric"
  | "unique"
  | "rrn"
  | "location"
  | "login";

export interface CatalogCategory {
  key: string;
  label: string;
  note?: string;
  /** 항상 이 kind로 분류되는 카테고리. 없으면 개별 항목에 kind가 없다는 뜻이며 normal로 취급한다. */
  kind?: ItemKind;
  items: string[];
}

export interface LawReference {
  /** 보존 대상이 되는 기록 */
  what: string;
  /** 보존 기간 */
  term: string;
  /** 근거 법령 */
  law: string;
}

export interface Purpose {
  label: string;
  /** 카테고리 key -> 그 목적에 흔히 쓰이는 항목 이름 목록 */
  suggest: Record<string, string[]>;
  retention: string;
  laws: LawReference[];
}

export type ConsentTier = "required" | "optional";

export interface SelectedItem {
  name: string;
  kind: ItemKind;
}

export interface PurposeGroup {
  id: string;
  /** 목록에서 고른 목적. 직접 입력이면 null이고 customPurpose를 쓴다. */
  purpose: Purpose | null;
  customPurpose: string;
  isCustomPurpose: boolean;
  selectedItems: SelectedItem[];
  retention: string;
  /** 목적 선택으로 자동 채워진 값인지, 사용자가 직접 고친 값인지 */
  retentionAuto: boolean;
  consent: ConsentTier;
  biometricAnswer: "yes" | "no" | null;
  ageAnswer: "yes" | "no" | null;
  rrnBasis: string;
}

export function purposeLabel(group: PurposeGroup): string {
  if (group.isCustomPurpose) return group.customPurpose;
  return group.purpose?.label ?? "";
}

export interface Processor {
  name: string;
  work: string;
}

export interface ThirdParty {
  name: string;
  purpose: string;
  items: string;
  retention: string;
}

export interface SharingState {
  noProcessors: boolean;
  processors: Processor[];
  noThirdParties: boolean;
  thirdParties: ThirdParty[];
}

export interface ServiceInfo {
  name: string;
  description: string;
  /** YYYY-MM-DD, 비우면 기본값(오늘부터 2주 뒤)이 쓰인다 */
  effectiveDate: string;
  department: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
}

export const WIZARD_STEPS = [
  "service-info",
  "purpose-groups",
  "sharing",
  "result",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export interface WizardState {
  serviceInfo: ServiceInfo;
  purposeGroups: PurposeGroup[];
  sharing: SharingState;
  savedSteps: WizardStep[];
}
