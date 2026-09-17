"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWizard } from "./wizard-context";
import { cn } from "@/lib/utils";
import type { WizardStep } from "@/lib/consent-policy/types";

const STEPS: { slug: WizardStep; label: string }[] = [
  { slug: "service-info", label: "서비스 정보" },
  { slug: "purpose-groups", label: "수집 항목과 목적" },
  { slug: "sharing", label: "위탁과 제3자 제공" },
  { slug: "result", label: "문서 확인" },
];

export function WizardStepper() {
  const pathname = usePathname();
  const { state } = useWizard();
  const current = pathname.replace(/^\//, "");

  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto border-b">
      {STEPS.map((step, index) => {
        const isCurrent = step.slug === current;
        const isDone = state.savedSteps.includes(step.slug);
        return (
          <Link
            key={step.slug}
            href={`/${step.slug}`}
            aria-current={isCurrent ? "step" : undefined}
            className={cn(
              "-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 border-transparent px-3.5 pb-2.5 text-sm text-muted-foreground",
              isCurrent && "border-primary font-semibold text-primary",
              isDone && !isCurrent && "text-foreground",
            )}
          >
            <span
              className={cn(
                "grid size-[19px] shrink-0 place-items-center rounded-full border text-[11px] font-semibold text-muted-foreground",
                isCurrent && "border-primary bg-primary text-primary-foreground",
                isDone && !isCurrent && "border-foreground bg-foreground text-background",
              )}
            >
              {isDone && !isCurrent ? "✓" : index + 1}
            </span>
            {step.label}
          </Link>
        );
      })}
    </nav>
  );
}
