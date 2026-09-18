import { createId } from "./id";
import type { PurposeGroup, ServiceInfo, SharingState, WizardState } from "./types";

export function createEmptyPurposeGroup(): PurposeGroup {
  return {
    id: createId(),
    purpose: null,
    customPurpose: "",
    isCustomPurpose: false,
    selectedItems: [],
    retention: "",
    retentionAuto: true,
    pendingTier: "required",
    biometricAnswer: null,
    ageAnswer: null,
    rrnBasis: "",
  };
}

export function createInitialServiceInfo(): ServiceInfo {
  return {
    name: "",
    description: "",
    effectiveDate: "",
    department: "",
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
  };
}

export function createInitialSharing(): SharingState {
  return {
    noProcessors: false,
    processors: [],
    noThirdParties: false,
    thirdParties: [],
  };
}

export function createInitialWizardState(): WizardState {
  return {
    serviceInfo: createInitialServiceInfo(),
    purposeGroups: [createEmptyPurposeGroup()],
    sharing: createInitialSharing(),
    savedSteps: [],
  };
}
