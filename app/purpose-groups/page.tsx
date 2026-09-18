"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/wizard/app-header";
import { WizardStepper } from "@/components/wizard/wizard-stepper";
import { PurposeGroupCard } from "@/components/wizard/purpose-group-card";
import { useWizard } from "@/components/wizard/wizard-context";
import { countSelectedItems, summarizeGroups } from "@/lib/consent-policy/selectors";
import { purposeGroupErrors } from "@/lib/consent-policy/validation";

export default function PurposeGroupsPage() {
  const { state, dispatch, showToast } = useWizard();
  const router = useRouter();
  const summary = summarizeGroups(state.purposeGroups);
  const itemCount = countSelectedItems(state.purposeGroups);
  const [showErrors, setShowErrors] = useState(false);

  const parts: string[] = [];
  if (summary.requiredCount) parts.push("필수 1건");
  if (summary.optionalCount) parts.push("선택 1건");
  if (summary.hasSensitive) parts.push("민감정보 1건");
  if (summary.hasUnique) parts.push("고유식별정보 1건");
  if (summary.hasChild) parts.push("법정대리인 1건");

  return (
    <main className="mx-auto w-full min-w-0 max-w-3xl px-4 pb-16">
      <AppHeader />
      <WizardStepper />

      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">수집 항목과 처리 목적</h1>
        <div className="text-right text-xs leading-relaxed text-muted-foreground">
          <div>
            처리 목적 <b className="font-semibold text-foreground">{state.purposeGroups.length}</b>개 · 수집 항목{" "}
            <b className="font-semibold text-foreground">{itemCount}</b>개
          </div>
          <div>
            만들어질 동의서{" "}
            <b className="font-semibold text-foreground">{parts.length ? parts.join(", ") : "없음"}</b>
          </div>
        </div>
      </div>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        먼저 개인정보를 왜 받는지 고르면, 그 목적에 흔히 쓰이는 항목이 아래에 나타납니다. 목적 하나에 항목과 보유
        기간이 딸리고, 목적이 여러 개라면 아래에서 추가하세요.
      </p>

      {state.purposeGroups.map((group) => (
        <PurposeGroupCard
          key={group.id}
          group={group}
          canRemove={state.purposeGroups.length > 1}
          showErrors={showErrors}
        />
      ))}

      <button
        type="button"
        onClick={() => dispatch({ type: "group/add" })}
        className="w-full rounded-lg border border-dashed p-3 text-sm text-muted-foreground hover:border-primary hover:text-primary"
      >
        ＋ 처리 목적 추가
      </button>

      <div className="mt-6 flex items-center gap-2.5 border-t pt-5">
        <Link href="/service-info" className="rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted">
          ← 서비스 정보
        </Link>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => {
            const firstError = state.purposeGroups.flatMap((group) => purposeGroupErrors(group))[0];
            if (firstError) {
              setShowErrors(true);
              showToast(firstError);
              return;
            }
            dispatch({ type: "step/mark-saved", step: "purpose-groups" });
            showToast("수집 항목과 처리 목적을 저장했습니다");
            router.push("/sharing");
          }}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/85"
        >
          저장하고 다음으로 →
        </button>
      </div>
    </main>
  );
}
