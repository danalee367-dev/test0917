"use client";

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
}: {
  question: string;
  help: string;
  choices: Choice[];
  value: "yes" | "no" | null;
  verdict?: string;
  onAnswer: (value: "yes" | "no") => void;
}) {
  return (
    <div className="mt-3 rounded-lg border border-warning bg-warning/6 p-4">
      <p className="mb-1 text-sm font-semibold">{question}</p>
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
      {verdict ? (
        <div
          className="mt-3 border-t border-dashed pt-2.5 text-xs leading-relaxed"
          dangerouslySetInnerHTML={{ __html: verdict }}
        />
      ) : null}
    </div>
  );
}
