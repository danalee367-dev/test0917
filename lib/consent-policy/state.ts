import { createEmptyPurposeGroup } from "./factories";
import { kindOf } from "./catalog";
import type {
  ConsentTier,
  Processor,
  PurposeGroup,
  Purpose,
  ServiceInfo,
  ThirdParty,
  WizardState,
  WizardStep,
} from "./types";

export type WizardAction =
  | { type: "service-info/update"; patch: Partial<ServiceInfo> }
  | { type: "group/add" }
  | { type: "group/remove"; id: string }
  | { type: "group/select-purpose"; id: string; purpose: Purpose }
  | { type: "group/select-custom-purpose"; id: string }
  | { type: "group/set-custom-purpose-label"; id: string; label: string }
  | { type: "group/toggle-item"; id: string; name: string }
  | { type: "group/add-custom-item"; id: string; name: string }
  | { type: "group/remove-item"; id: string; name: string }
  | { type: "group/set-retention"; id: string; value: string; auto?: boolean }
  | { type: "group/set-consent"; id: string; consent: ConsentTier }
  | { type: "group/set-biometric-answer"; id: string; answer: "yes" | "no" }
  | { type: "group/set-age-answer"; id: string; answer: "yes" | "no" }
  | { type: "group/set-rrn-basis"; id: string; value: string }
  | { type: "sharing/set-no-processors"; value: boolean }
  | { type: "sharing/add-processor"; processor: Processor }
  | { type: "sharing/remove-processor"; name: string }
  | { type: "sharing/update-processor"; index: number; processor: Processor }
  | { type: "sharing/set-no-third-parties"; value: boolean }
  | { type: "sharing/add-third-party"; thirdParty: ThirdParty }
  | { type: "sharing/remove-third-party"; name: string }
  | { type: "sharing/update-third-party"; index: number; thirdParty: ThirdParty }
  | { type: "step/mark-saved"; step: WizardStep };

function mapGroup(
  state: WizardState,
  id: string,
  fn: (group: PurposeGroup) => PurposeGroup,
): WizardState {
  return {
    ...state,
    purposeGroups: state.purposeGroups.map((group) => (group.id === id ? fn(group) : group)),
  };
}

/**
 * 항목 구성이 바뀐 뒤 파생 값을 정리한다.
 * 해당 항목이 더는 없으면 후속 질문 답이나 관련 입력을 남겨두지 않는다.
 */
function reconcileDerivedFields(group: PurposeGroup): PurposeGroup {
  const hasBiometric = group.selectedItems.some((item) => item.kind === "biometric");
  const hasBirthDate = group.selectedItems.some((item) => item.name === "생년월일");
  const hasRrn = group.selectedItems.some((item) => item.kind === "rrn");

  return {
    ...group,
    biometricAnswer: hasBiometric ? group.biometricAnswer : null,
    ageAnswer: hasBirthDate ? group.ageAnswer : null,
    rrnBasis: hasRrn ? group.rrnBasis : "",
  };
}

function upsertByName<T extends { name: string }>(list: T[], entry: T): T[] {
  if (list.some((item) => item.name === entry.name)) return list;
  return [...list, entry];
}

export function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "service-info/update":
      return { ...state, serviceInfo: { ...state.serviceInfo, ...action.patch } };

    case "group/add":
      return { ...state, purposeGroups: [...state.purposeGroups, createEmptyPurposeGroup()] };

    case "group/remove": {
      if (state.purposeGroups.length <= 1) return state;
      return {
        ...state,
        purposeGroups: state.purposeGroups.filter((group) => group.id !== action.id),
      };
    }

    case "group/select-purpose":
      return mapGroup(state, action.id, (group) => ({
        ...group,
        purpose: action.purpose,
        isCustomPurpose: false,
        customPurpose: "",
        retention: group.retentionAuto || !group.retention ? action.purpose.retention : group.retention,
        retentionAuto: group.retentionAuto || !group.retention,
      }));

    case "group/select-custom-purpose":
      return mapGroup(state, action.id, (group) => ({
        ...group,
        purpose: null,
        isCustomPurpose: true,
      }));

    case "group/set-custom-purpose-label":
      return mapGroup(state, action.id, (group) => ({ ...group, customPurpose: action.label }));

    case "group/toggle-item":
      return mapGroup(state, action.id, (group) => {
        const exists = group.selectedItems.some((item) => item.name === action.name);
        const selectedItems = exists
          ? group.selectedItems.filter((item) => item.name !== action.name)
          : [...group.selectedItems, { name: action.name, kind: kindOf(action.name) }];
        return reconcileDerivedFields({ ...group, selectedItems });
      });

    case "group/add-custom-item":
      return mapGroup(state, action.id, (group) => {
        const name = action.name.trim();
        if (!name || group.selectedItems.some((item) => item.name === name)) return group;
        return {
          ...group,
          selectedItems: [...group.selectedItems, { name, kind: "normal" }],
        };
      });

    case "group/remove-item":
      return mapGroup(state, action.id, (group) =>
        reconcileDerivedFields({
          ...group,
          selectedItems: group.selectedItems.filter((item) => item.name !== action.name),
        }),
      );

    case "group/set-retention":
      return mapGroup(state, action.id, (group) => ({
        ...group,
        retention: action.value,
        retentionAuto: action.auto ?? false,
      }));

    case "group/set-consent":
      return mapGroup(state, action.id, (group) => ({ ...group, consent: action.consent }));

    case "group/set-biometric-answer":
      return mapGroup(state, action.id, (group) => ({ ...group, biometricAnswer: action.answer }));

    case "group/set-age-answer":
      return mapGroup(state, action.id, (group) => ({ ...group, ageAnswer: action.answer }));

    case "group/set-rrn-basis":
      return mapGroup(state, action.id, (group) => ({ ...group, rrnBasis: action.value }));

    case "sharing/set-no-processors":
      return { ...state, sharing: { ...state.sharing, noProcessors: action.value } };

    case "sharing/add-processor":
      return {
        ...state,
        sharing: {
          ...state.sharing,
          processors: upsertByName(state.sharing.processors, action.processor),
        },
      };

    case "sharing/remove-processor":
      return {
        ...state,
        sharing: {
          ...state.sharing,
          processors: state.sharing.processors.filter((p) => p.name !== action.name),
        },
      };

    case "sharing/update-processor":
      return {
        ...state,
        sharing: {
          ...state.sharing,
          processors: state.sharing.processors.map((p, i) => (i === action.index ? action.processor : p)),
        },
      };

    case "sharing/set-no-third-parties":
      return { ...state, sharing: { ...state.sharing, noThirdParties: action.value } };

    case "sharing/add-third-party":
      return {
        ...state,
        sharing: {
          ...state.sharing,
          thirdParties: upsertByName(state.sharing.thirdParties, action.thirdParty),
        },
      };

    case "sharing/remove-third-party":
      return {
        ...state,
        sharing: {
          ...state.sharing,
          thirdParties: state.sharing.thirdParties.filter((p) => p.name !== action.name),
        },
      };

    case "sharing/update-third-party":
      return {
        ...state,
        sharing: {
          ...state.sharing,
          thirdParties: state.sharing.thirdParties.map((p, i) =>
            i === action.index ? action.thirdParty : p,
          ),
        },
      };

    case "step/mark-saved":
      return state.savedSteps.includes(action.step)
        ? state
        : { ...state, savedSteps: [...state.savedSteps, action.step] };

    default:
      return state;
  }
}
