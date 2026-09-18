"use client";

import { useState } from "react";
import { useWizard } from "./wizard-context";
import { ItemPicker } from "./item-picker";
import { FollowupQuestion } from "./followup-question";
import { PURPOSES } from "@/lib/consent-policy/purposes";
import { RETENTION_SAMPLES, topicParticle } from "@/lib/consent-policy/korean";
import {
  hasBiometricItem,
  hasBirthDate,
  hasRrnItem,
  isSensitiveEffective,
  isUniqueEffective,
} from "@/lib/consent-policy/selectors";
import { purposeLabel } from "@/lib/consent-policy/types";
import type { PurposeGroup } from "@/lib/consent-policy/types";
import { cn } from "@/lib/utils";

export function PurposeGroupCard({
  group,
  canRemove,
  showErrors = false,
}: {
  group: PurposeGroup;
  canRemove: boolean;
  showErrors?: boolean;
}) {
  const { dispatch, showToast } = useWizard();
  const [customDraft, setCustomDraft] = useState(group.customPurpose);
  const label = purposeLabel(group);
  const isOptional = group.consent === "optional";
  const missingPurpose = showErrors && !label.trim();
  const missingItems = showErrors && group.selectedItems.length === 0;
  const missingRetention = showErrors && !group.retention.trim();
  const missingRrnBasis = showErrors && hasRrnItem(group) && !group.rrnBasis.trim();
  const missingAgeAnswer = showErrors && hasBirthDate(group) && group.ageAnswer === null;
  const missingBiometricAnswer = showErrors && hasBiometricItem(group) && group.biometricAnswer === null;

  const effectiveSensitiveNames = group.selectedItems
    .filter((item) => isSensitiveEffective(item, group))
    .map((item) => item.name);
  const uniqueNames = group.selectedItems.filter(isUniqueEffective).map((item) => item.name);
  const locationNames = group.selectedItems
    .filter((item) => item.kind === "location")
    .map((item) => item.name);
  const loginNames = group.selectedItems.filter((item) => item.kind === "login").map((item) => item.name);

  return (
    <div
      className={cn(
        "mb-3.5 rounded-xl border bg-card p-5",
        isOptional && "ring-1 ring-optional/30",
      )}
    >
      <div className="mb-4.5 flex flex-wrap items-center gap-2.5 border-b pb-4">
        <span className={cn("text-lg font-bold tracking-tight", !label && "text-base font-medium text-muted-foreground")}>
          {label || "새 처리 목적"}
        </span>
        <div className="inline-flex overflow-hidden rounded-full border">
          <button
            type="button"
            aria-pressed={!isOptional}
            onClick={() => dispatch({ type: "group/set-consent", id: group.id, consent: "required" })}
            className={cn(
              "px-3.5 py-1 text-xs font-medium text-muted-foreground",
              !isOptional && "bg-primary text-primary-foreground",
            )}
          >
            필수 동의
          </button>
          <button
            type="button"
            aria-pressed={isOptional}
            onClick={() => dispatch({ type: "group/set-consent", id: group.id, consent: "optional" })}
            className={cn(
              "px-3.5 py-1 text-xs font-medium text-muted-foreground",
              isOptional && "bg-optional text-optional-foreground",
            )}
          >
            선택 동의
          </button>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => {
              if (!canRemove) {
                showToast("처리 목적은 최소 하나가 필요합니다.");
                return;
              }
              dispatch({ type: "group/remove", id: group.id });
            }}
            className="rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 처리 목적 */}
      <div className="mb-7">
        <label className="mb-2.75 flex items-center gap-1.5 text-[15px] font-bold">
          처리 목적 <span className="text-xs font-semibold text-primary">필수</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PURPOSES.map((purpose) => (
            <button
              key={purpose.label}
              type="button"
              aria-pressed={!group.isCustomPurpose && group.purpose?.label === purpose.label}
              onClick={() => dispatch({ type: "group/select-purpose", id: group.id, purpose })}
              className={cn(
                "rounded-full border px-2.75 py-1.25 text-xs",
                !group.isCustomPurpose && group.purpose?.label === purpose.label
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              {purpose.label}
            </button>
          ))}
          <button
            type="button"
            aria-pressed={group.isCustomPurpose}
            onClick={() => dispatch({ type: "group/select-custom-purpose", id: group.id })}
            className={cn(
              "rounded-full border px-2.75 py-1.25 text-xs",
              group.isCustomPurpose ? "border-primary bg-primary text-primary-foreground" : "border-border",
            )}
          >
            ＋ 직접 입력
          </button>
        </div>
        {group.isCustomPurpose ? (
          <input
            type="text"
            value={customDraft}
            onChange={(e) => {
              setCustomDraft(e.target.value);
              dispatch({ type: "group/set-custom-purpose-label", id: group.id, label: e.target.value });
            }}
            placeholder="이 서비스가 개인정보를 받는 이유를 적으세요"
            aria-invalid={missingPurpose}
            className={cn(
              "mt-2.5 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              missingPurpose && "border-destructive",
            )}
          />
        ) : null}
        {missingPurpose ? (
          <p className="mt-1.5 text-xs text-destructive">처리 목적을 고르거나 직접 입력하세요.</p>
        ) : null}
      </div>

      {/* 수집 항목 */}
      <div className="mb-7">
        <label className="mb-2.75 flex items-center gap-1.5 text-[15px] font-bold">
          수집 항목 <span className="text-xs font-semibold text-primary">필수</span>
        </label>
        <div
          className={cn(
            "flex min-h-10.5 flex-wrap items-center gap-1.5 rounded-lg border bg-muted p-2.5",
            missingItems && "border-destructive",
          )}
        >
          {group.selectedItems.length === 0 ? (
            <span className={cn("text-sm", missingItems ? "text-destructive" : "text-muted-foreground")}>
              {missingItems ? "수집 항목을 하나 이상 고르세요" : "아래에서 항목을 선택하세요"}
            </span>
          ) : (
            group.selectedItems.map((item) => (
              <span
                key={item.name}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border bg-card py-0.75 pr-1 pl-2.25 text-xs",
                  (item.kind === "sensitive" || item.kind === "unique") && "border-warning text-warning",
                  item.kind === "rrn" && "border-destructive text-destructive",
                )}
              >
                {item.name}
                <button
                  type="button"
                  aria-label={`${item.name} 제거`}
                  onClick={() => dispatch({ type: "group/remove-item", id: group.id, name: item.name })}
                  className="rounded-full px-1 opacity-60 hover:bg-muted hover:opacity-100"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <ItemPicker
          suggest={group.purpose?.suggest ?? {}}
          selectedItems={group.selectedItems}
          onToggle={(name) => dispatch({ type: "group/toggle-item", id: group.id, name })}
          onAddCustom={(name) => dispatch({ type: "group/add-custom-item", id: group.id, name })}
        />
      </div>

      {/* 만 14세 확인 */}
      {hasBirthDate(group) ? (
        <FollowupQuestion
          question="만 14세 미만 아동도 이 서비스를 이용할 수 있나요?"
          help="생년월일을 받으면 가입자의 나이를 알 수 있습니다. 만 14세 미만 아동의 개인정보를 처리하려면 법정대리인의 동의를 받아야 하고, 동의서와 처리방침에 들어가는 내용이 달라집니다."
          choices={[
            {
              value: "yes",
              label: "예, 아동도 이용합니다",
              description: "법정대리인 동의서가 별도로 만들어지고, 법정대리인의 이름과 연락처를 받는 항목이 추가됩니다.",
            },
            {
              value: "no",
              label: "아니오, 만 14세 이상만 이용합니다",
              description: "가입 단계에서 만 14세 미만을 걸러내야 하며, 이용약관에도 그 기준을 적어야 합니다.",
            },
          ]}
          value={group.ageAnswer}
          onAnswer={(answer) => dispatch({ type: "group/set-age-answer", id: group.id, answer })}
          missing={missingAgeAnswer}
          verdict={
            group.ageAnswer === "yes"
              ? "<strong>만 14세 미만 아동용 동의서가 추가됩니다.</strong> 동의서에는 법정대리인 성명·연락처를 받는 기재란이 빈 칸으로 들어가며, 실제 값은 서비스에서 법정대리인에게 직접 받습니다."
              : group.ageAnswer === "no"
                ? "<strong>만 14세 이상만 가입할 수 있다는 내용이 문서에 들어갑니다.</strong> 가입 화면에서 나이를 확인해 걸러내는 절차가 실제로 있어야 합니다."
                : undefined
          }
        />
      ) : null}

      {/* 생체정보 후속 질문 */}
      {hasBiometricItem(group) ? (
        <FollowupQuestion
          question={`‘${group.selectedItems
            .filter((i) => i.kind === "biometric")
            .map((i) => i.name)
            .join("’, ‘")}’를 특정 개인을 알아보기 위해 기술적으로 처리해서 저장하나요?`}
          help="같은 얼굴 이미지라도 사진 그대로 보관하면 일반 개인정보이고, 특정 개인을 알아볼 목적으로 특징값을 뽑아 저장하면 생체인식정보가 되어 민감정보로 다뤄집니다."
          choices={[
            {
              value: "yes",
              label: "예, 특징값을 만들어 저장합니다",
              description: "얼굴 인식으로 본인을 확인하거나, 지문을 등록해 두고 대조하는 경우입니다.",
            },
            {
              value: "no",
              label: "아니오, 원본만 보관합니다",
              description: "상담 기록용 사진이나 녹음처럼 알아보기 위한 처리 없이 그대로 두는 경우입니다.",
            },
          ]}
          value={group.biometricAnswer}
          onAnswer={(answer) => dispatch({ type: "group/set-biometric-answer", id: group.id, answer })}
          missing={missingBiometricAnswer}
          verdict={
            group.biometricAnswer === "yes"
              ? "<strong>생체인식정보로 처리됩니다.</strong> 민감정보 수집·이용 동의서가 별도로 만들어집니다."
              : group.biometricAnswer === "no"
                ? "<strong>일반 개인정보로 처리됩니다.</strong> 별도 동의서 없이 일반 수집·이용 동의서에 들어갑니다."
                : undefined
          }
        />
      ) : null}

      {/* 민감정보/고유식별정보 안내 */}
      {effectiveSensitiveNames.length > 0 || uniqueNames.length > 0 ? (
        <div className="mt-3.5 rounded-lg border border-warning bg-warning/8 p-3">
          <p className="mb-0.5 text-sm font-semibold text-warning">별도 동의서가 추가됩니다</p>
          <p className="text-xs leading-relaxed">
            {effectiveSensitiveNames.length > 0 && (
              <>
                ‘{effectiveSensitiveNames.join("’, ‘")}’{topicParticle(effectiveSensitiveNames.at(-1)!)} 민감정보입니다.
                민감정보 수집·이용 동의서가 별도로 만들어집니다.{" "}
              </>
            )}
            {uniqueNames.length > 0 && (
              <>
                ‘{uniqueNames.join("’, ‘")}’{topicParticle(uniqueNames.at(-1)!)} 고유식별정보입니다. 고유식별정보
                수집·이용 동의서가 별도로 만들어집니다.
              </>
            )}
          </p>
        </div>
      ) : null}

      {/* 위치정보 안내 */}
      {locationNames.length > 0 ? (
        <div className="mt-3.5 rounded-lg border border-warning bg-warning/8 p-3">
          <p className="mb-0.5 text-sm font-semibold text-warning">위치정보에는 위치정보법이 함께 적용됩니다</p>
          <p className="text-xs leading-relaxed">
            ‘{locationNames.join("’, ‘")}’처럼 개인의 위치를 추적할 수 있는 정보는 개인정보이면서 동시에 개인위치정보입니다.
            개인정보 보호법뿐 아니라 「위치정보의 보호 및 이용 등에 관한 법률」이 함께 적용되어, 위치기반서비스사업 신고와
            별도의 위치정보 이용약관이 필요할 수 있습니다. 이 항목을 넣으려면 법무 검토를 받으세요.
          </p>
        </div>
      ) : null}

      {/* 간편인증 안내 */}
      {loginNames.length > 0 ? (
        <div className="mt-3.5 rounded-lg border border-info bg-info/7 p-3">
          <p className="mb-0.5 text-sm font-semibold text-info">연동 사업자에게서 받는 정보를 확인하세요</p>
          <p className="text-xs leading-relaxed">
            ‘{loginNames.join("’, ‘")}’을(를) 쓰면 그 사업자에게서 이름, 이메일, 연락처 같은 정보를 넘겨받게 됩니다. 넘겨받는
            항목이 사업자마다 다르므로 실제로 무엇을 받는지 확인해서 적어야 하고, 처리방침의 &quot;제3자로부터 수집하는
            개인정보&quot;에 사업자 이름과 함께 들어갑니다.
          </p>
        </div>
      ) : null}

      {/* 주민등록번호 경고 + 근거 법령 */}
      {hasRrnItem(group) ? (
        <>
          <div className="mt-3.5 rounded-lg border border-destructive bg-destructive/7 p-3">
            <p className="mb-0.5 text-sm font-semibold text-destructive">
              주민등록번호는 법무 검토를 완료해야 사용할 수 있습니다
            </p>
            <p className="text-xs leading-relaxed">
              「개인정보 보호법」 제24조의2에 따라 주민등록번호는 법령에 구체적인 근거가 있는 경우에만 수집할 수
              있습니다. 정보주체에게 동의를 받았다는 것만으로는 수집할 수 없습니다. 근거 법령을 아래에 적고, 이 문서를
              사용하기 전에 반드시 법무 검토를 받으세요. 근거가 없다면 이 항목을 빼야 합니다.
            </p>
          </div>
          <div className="mt-3.5">
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
              주민등록번호 수집의 근거 법령 <span className="text-xs font-semibold text-primary">필수</span>
            </label>
            <input
              type="text"
              value={group.rrnBasis}
              onChange={(e) => dispatch({ type: "group/set-rrn-basis", id: group.id, value: e.target.value })}
              placeholder="예: 「소득세법」 제145조에 따른 원천징수영수증 발급"
              aria-invalid={missingRrnBasis}
              className={cn(
                "h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                missingRrnBasis && "border-destructive",
              )}
            />
            <p className={cn("mt-1.5 text-xs", missingRrnBasis ? "text-destructive" : "text-muted-foreground")}>
              {missingRrnBasis
                ? "주민등록번호 수집의 근거 법령을 입력하세요."
                : "법령의 이름과 조항을 함께 적으세요. 이 내용이 동의서와 처리방침에 그대로 들어가고, 법무 검토에서 가장 먼저 확인하는 부분입니다."}
            </p>
          </div>
        </>
      ) : null}

      {/* 보유 및 이용 기간 */}
      <div className="mt-4.5">
        <label className="mb-2.75 flex items-center gap-1.5 text-[15px] font-bold">
          보유 및 이용 기간 <span className="text-xs font-semibold text-primary">필수</span>
        </label>
        <input
          type="text"
          value={group.retention}
          onChange={(e) =>
            dispatch({ type: "group/set-retention", id: group.id, value: e.target.value, auto: false })
          }
          placeholder="예: 회원 탈퇴 시까지"
          aria-invalid={missingRetention}
          className={cn(
            "h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            missingRetention && "border-destructive",
          )}
        />
        {missingRetention ? (
          <p className="mt-1.5 text-xs text-destructive">보유 및 이용 기간을 입력하세요.</p>
        ) : null}
        <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
          <span className="text-[11px] text-muted-foreground">예시</span>
          {RETENTION_SAMPLES.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => dispatch({ type: "group/set-retention", id: group.id, value: sample, auto: false })}
              className="rounded-full bg-secondary px-2.5 py-0.75 text-xs text-secondary-foreground hover:text-primary"
            >
              {sample}
            </button>
          ))}
        </div>

        {group.purpose && group.purpose.laws.length > 0 ? (
          <div className="mt-3 rounded-lg border bg-muted p-3.5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
              이 목적에는 법으로 정해진 보관 의무가 있습니다
            </p>
            <ul className="list-disc space-y-1 pl-4 text-xs leading-relaxed text-muted-foreground">
              {group.purpose.laws.map((law) => (
                <li key={law.law}>
                  {law.what}: <strong className="font-semibold text-foreground">{law.term}</strong> ({law.law})
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              위에 적은 보유 기간과 별개로 문서의 &quot;관계 법령에 따른 보유 및 이용 기간&quot;에 자동으로 들어갑니다.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
