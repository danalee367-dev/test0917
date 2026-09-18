"use client";

import { cn } from "@/lib/utils";

interface Choice {
  value: "yes" | "no";
  label: string;
  description: string;
}

export function FollowupQuestion({
  question,
  help,
  choices,
  value,
  verdict,
  onAnswer,
  missing = false,
}: {
  question: string;
  help: string;
  choices: Choice[];
  value: "yes" | "no" | null;
  verdict?: string;
  onAnswer: (value: "yes" | "no") => void;
  /** 답이 필요한데 아직 답하지 않은 상태를 강조할지 */
  missing?: boolean;
}) {
  return (
    <div
      className={cn(
        "mt-3 rounded-lg border p-4",
        missing ? "border-destructive bg-destructive/6" : "border-warning bg-warning/6",
      )}
    >
      <p className="mb-1 flex items-center gap-1.5 text-sm font-semibold">
        {question}
        {missing ? <span className="text-xs font-semibold text-destructive">답변 필요</span> : null}
      </p>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{help}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map((choice) => (
          <button
            key={choice.value}
            type="button"
            aria-pressed={value === choice.value}
            onClick={() => onAnswer(choice.value)}
            className={`flex-1 min-w-52 rounded-lg border p-3 text-left text-xs ${
              value === choice.value
                ? "border-warning shadow-[inset_0_0_0_1px_var(--warning)]"
                : "border-border bg-card"
            }`}
          >
            <b className="mb-0.5 block text-[13px]">{choice.label}</b>
            <span className="leading-normal text-muted-foreground">{choice.description}</span>
          </button>
        ))}
      </div>
      {missing ? (
        <p className="mt-3 border-t border-dashed pt-2.5 text-xs font-medium text-destructive">
          답을 고르기 전에는 다음 단계로 넘어갈 수 없습니다. 판단이 서지 않으면 위 설명을 참고하세요.
        </p>
      ) : verdict ? (
        <div
          className="mt-3 border-t border-dashed pt-2.5 text-xs leading-relaxed"
          dangerouslySetInnerHTML={{ __html: verdict }}
        />
      ) : null}
    </div>
  );
}
