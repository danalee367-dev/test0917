"use client";

import { useWizard } from "./wizard-context";

export function AppHeader() {
  const { state } = useWizard();

  return (
    <div className="flex items-center gap-2.5 py-3.5">
      <span className="flex size-6.5 items-center justify-center rounded-md bg-primary text-[13px] font-bold text-primary-foreground">
        개
      </span>
      <span className="text-sm font-semibold tracking-tight">개인정보 문서 작성 도우미</span>
      {state.serviceInfo.name ? (
        <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
          <strong className="font-semibold text-foreground">{state.serviceInfo.name}</strong>
        </span>
      ) : null}
    </div>
  );
}
