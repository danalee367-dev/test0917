"use client";

import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createInitialWizardState } from "@/lib/consent-policy/factories";
import { wizardReducer, type WizardAction } from "@/lib/consent-policy/state";
import type { WizardState } from "@/lib/consent-policy/types";
import { cn } from "@/lib/utils";

interface WizardContextValue {
  state: WizardState;
  dispatch: (action: WizardAction) => void;
  showToast: (message: string) => void;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(wizardReducer, undefined, createInitialWizardState);
  const [toast, setToast] = useState<{ message: string; key: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, key: Date.now() });
    timerRef.current = setTimeout(() => setToast(null), 2200);
  }, []);

  return (
    <WizardContext.Provider value={{ state, dispatch, showToast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-7 z-50 flex justify-center transition-opacity duration-200",
          toast ? "opacity-100" : "opacity-0",
        )}
      >
        {toast ? (
          <span
            key={toast.key}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background shadow-lg"
          >
            {toast.message}
          </span>
        ) : null}
      </div>
    </WizardContext.Provider>
  );
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard는 WizardProvider 안에서만 쓸 수 있습니다.");
  return ctx;
}
