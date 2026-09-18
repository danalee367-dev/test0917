import type { PurposeGroup, SelectedItem } from "./types";
import { purposeLabel } from "./types";

/**
 * 생체정보는 그 자체로는 민감정보가 아니다. 특정 개인을 알아보기 위해 기술적으로
 * 처리해 저장한다고 답한 경우에만(=biometricAnswer 'yes') 민감정보로 취급한다.
 */
export function isSensitiveEffective(item: SelectedItem, group: PurposeGroup): boolean {
  if (item.kind === "sensitive") return true;
  if (item.kind === "biometric") return group.biometricAnswer === "yes";
  return false;
}

export function isUniqueEffective(item: SelectedItem): boolean {
  return item.kind === "unique" || item.kind === "rrn";
}

export function hasSensitiveItem(group: PurposeGroup): boolean {
  return group.selectedItems.some((item) => isSensitiveEffective(item, group));
}

export function hasUniqueItem(group: PurposeGroup): boolean {
  return group.selectedItems.some(isUniqueEffective);
}

export function hasRrnItem(group: PurposeGroup): boolean {
  return group.selectedItems.some((item) => item.kind === "rrn");
}

export function hasBiometricItem(group: PurposeGroup): boolean {
  return group.selectedItems.some((item) => item.kind === "biometric");
}

export function hasBirthDate(group: PurposeGroup): boolean {
  return group.selectedItems.some((item) => item.name === "생년월일");
}

/** 목적과 항목이 모두 채워져 문서에 반영될 수 있는 묶음인지 */
export function isGroupComplete(group: PurposeGroup): boolean {
  return purposeLabel(group).trim().length > 0 && group.selectedItems.length > 0;
}

export interface GroupConsentSummary {
  requiredCount: number;
  optionalCount: number;
  hasSensitive: boolean;
  hasUnique: boolean;
  hasChild: boolean;
}

export function summarizeGroups(groups: PurposeGroup[]): GroupConsentSummary {
  let requiredCount = 0;
  let optionalCount = 0;
  let hasSensitive = false;
  let hasUnique = false;
  let hasChild = false;

  for (const group of groups) {
    if (group.selectedItems.some((item) => item.tier === "required")) requiredCount += 1;
    if (group.selectedItems.some((item) => item.tier === "optional")) optionalCount += 1;
    if (hasSensitiveItem(group)) hasSensitive = true;
    if (hasUniqueItem(group)) hasUnique = true;
    if (group.ageAnswer === "yes") hasChild = true;
  }

  return { requiredCount, optionalCount, hasSensitive, hasUnique, hasChild };
}

export function countSelectedItems(groups: PurposeGroup[]): number {
  return groups.reduce((sum, group) => sum + group.selectedItems.length, 0);
}
