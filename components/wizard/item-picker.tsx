"use client";

import { useState } from "react";
import {
  ALWAYS_SHOWN_CATEGORY_KEYS,
  CATALOG,
  SUGGESTIBLE_CATEGORY_KEYS,
} from "@/lib/consent-policy/catalog";
import type { SelectedItem } from "@/lib/consent-policy/types";
import { cn } from "@/lib/utils";

const KIND_BADGE_CLASS: Record<string, string> = {
  login: "bg-info/14 text-info",
  location: "bg-warning/14 text-warning",
  sensitive: "bg-warning/14 text-warning",
  biometric: "bg-info/14 text-info",
  unique: "bg-warning/14 text-warning",
};

function OptionButton({
  name,
  kind,
  selected,
  suggested,
  onToggle,
}: {
  name: string;
  kind: string;
  selected: boolean;
  suggested: boolean;
  onToggle: () => void;
}) {
  const warn = kind === "sensitive" || kind === "unique" || kind === "rrn";
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.75 py-1.25 text-xs",
        selected
          ? warn
            ? "border-warning/55 bg-warning/13 font-semibold text-warning"
            : "border-primary/55 bg-primary/11 font-semibold text-primary"
          : cn("border-border", warn && "border-warning/45"),
      )}
    >
      {selected ? <span className="text-[10px]">✓</span> : null}
      {name}
      {!selected && suggested ? <span className="text-[9px] opacity-75">●</span> : null}
    </button>
  );
}

function CategorySection({
  categoryKey,
  suggestedNames,
  selectedNames,
  onToggle,
}: {
  categoryKey: (typeof SUGGESTIBLE_CATEGORY_KEYS)[number];
  suggestedNames: string[];
  selectedNames: Set<string>;
  onToggle: (name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const category = CATALOG[categoryKey]!;
  const restNames = category.items.filter((name) => !suggestedNames.includes(name));
  const hiddenRest = restNames.filter((name) => !selectedNames.has(name));
  const visibleRest = expanded ? restNames : restNames.filter((name) => selectedNames.has(name));
  const isSuggested = suggestedNames.length > 0;
  const sectionHidden = !isSuggested && !expanded && visibleRest.length === 0;

  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-center gap-2 bg-muted px-3 py-2.25 text-xs font-semibold">
        <span>{category.label}</span>
        <span className="font-normal text-muted-foreground">
          {isSuggested ? "이 목적에 흔히 쓰는 항목" : "이 목적에는 잘 쓰지 않는 항목"}
        </span>
      </div>
      {sectionHidden ? null : (
        <div className="flex flex-wrap gap-1.5 p-3">
          {suggestedNames.map((name) => (
            <OptionButton
              key={name}
              name={name}
              kind="normal"
              selected={selectedNames.has(name)}
              suggested
              onToggle={() => onToggle(name)}
            />
          ))}
          {visibleRest.map((name) => (
            <OptionButton
              key={name}
              name={name}
              kind="normal"
              selected={selectedNames.has(name)}
              suggested={false}
              onToggle={() => onToggle(name)}
            />
          ))}
        </div>
      )}
      {hiddenRest.length > 0 ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full border-t px-2.5 py-2 text-center text-xs text-muted-foreground hover:bg-muted hover:text-primary"
        >
          {expanded
            ? `${category.label} 접기`
            : `${category.label} 전체 보기 (${hiddenRest.length}개 더)`}
        </button>
      ) : null}
    </div>
  );
}

export function ItemPicker({
  suggest,
  selectedItems,
  onToggle,
  onAddCustom,
}: {
  suggest: Record<string, string[]>;
  selectedItems: SelectedItem[];
  onToggle: (name: string) => void;
  onAddCustom: (name: string) => void;
}) {
  const selectedNames = new Set(selectedItems.map((item) => item.name));

  return (
    <div className="mt-3 rounded-lg border">
      {SUGGESTIBLE_CATEGORY_KEYS.map((key) => (
        <CategorySection
          key={key}
          categoryKey={key}
          suggestedNames={suggest[key] ?? []}
          selectedNames={selectedNames}
          onToggle={onToggle}
        />
      ))}

      {ALWAYS_SHOWN_CATEGORY_KEYS.map((key) => {
        const category = CATALOG[key]!;
        return (
          <div key={key} className="border-b last:border-b-0">
            <div className="flex items-center gap-2 bg-muted px-3 py-2.25 text-xs font-semibold">
              <span>{category.label}</span>
              {category.note ? (
                <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", KIND_BADGE_CLASS[key])}>
                  {category.note}
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1.5 p-3">
              {category.items.map((name) => (
                <OptionButton
                  key={name}
                  name={name}
                  kind={category.kind ?? "normal"}
                  selected={selectedNames.has(name)}
                  suggested={false}
                  onToggle={() => onToggle(name)}
                />
              ))}
            </div>
          </div>
        );
      })}

      <CustomItemForm onAddCustom={onAddCustom} />
    </div>
  );
}

function CustomItemForm({ onAddCustom }: { onAddCustom: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");

  if (!open) {
    return (
      <div className="p-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border px-2.75 py-1.25 text-xs hover:border-primary hover:text-primary"
        >
          ＋ 목록에 없는 항목 직접 입력
        </button>
      </div>
    );
  }

  const submit = () => {
    const name = draft.trim();
    if (!name) return;
    onAddCustom(name);
    setDraft("");
    setOpen(false);
  };

  return (
    <div className="border-t p-3">
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
        수집하는 항목의 이름을 적어주세요. 이용자가 무엇을 주는지 알 수 있게 구체적으로 적습니다.
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
            if (e.key === "Escape") {
              setDraft("");
              setOpen(false);
            }
          }}
          placeholder="예: 반려동물 종류"
          className="h-8 flex-1 rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="button"
          onClick={submit}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          추가
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft("");
            setOpen(false);
          }}
          className="rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted"
        >
          취소
        </button>
      </div>
    </div>
  );
}
