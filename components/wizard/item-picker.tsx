"use client";

import { useState } from "react";
import {
  ALWAYS_SHOWN_CATEGORY_KEYS,
  CATALOG,
  SUGGESTIBLE_CATEGORY_KEYS,
} from "@/lib/consent-policy/catalog";
import type { ConsentTier, SelectedItem } from "@/lib/consent-policy/types";
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
  tier,
  suggested,
  onToggle,
}: {
  name: string;
  kind: string;
  /** 이 항목이 이미 담겨 있다면 그 tier. 아직 안 담겼으면 undefined. */
  tier: ConsentTier | undefined;
  suggested: boolean;
  onToggle: () => void;
}) {
  const warn = kind === "sensitive" || kind === "unique" || kind === "rrn";
  const selected = tier !== undefined;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.75 py-1.25 text-xs",
        selected
          ? warn
            ? "border-warning bg-warning/15 font-semibold text-warning"
            : tier === "optional"
              ? "border-optional bg-optional font-semibold text-optional-foreground"
              : "border-primary bg-primary font-semibold text-primary-foreground"
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
  tierByName,
  onToggle,
  onAddAllSuggested,
}: {
  categoryKey: (typeof SUGGESTIBLE_CATEGORY_KEYS)[number];
  suggestedNames: string[];
  tierByName: Map<string, ConsentTier>;
  onToggle: (name: string) => void;
  onAddAllSuggested: (names: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const category = CATALOG[categoryKey]!;
  const restNames = category.items.filter((name) => !suggestedNames.includes(name));
  const hiddenRest = restNames.filter((name) => !tierByName.has(name));
  const visibleRest = expanded ? restNames : restNames.filter((name) => tierByName.has(name));
  const isSuggested = suggestedNames.length > 0;
  const sectionHidden = !isSuggested && !expanded && visibleRest.length === 0;
  const unselectedSuggested = suggestedNames.filter((name) => !tierByName.has(name));

  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-center gap-2 bg-muted px-3 py-2.25 text-xs font-semibold">
        <span>{category.label}</span>
        <span className="font-normal text-muted-foreground">
          {isSuggested ? "이 목적에 흔히 쓰는 항목" : "이 목적에는 잘 쓰지 않는 항목"}
        </span>
        {unselectedSuggested.length > 1 ? (
          <button
            type="button"
            onClick={() => onAddAllSuggested(unselectedSuggested)}
            className="ml-auto rounded-full border border-primary/40 px-2 py-0.5 text-[11px] font-semibold text-primary hover:bg-primary/8"
          >
            추천 항목 모두 담기
          </button>
        ) : null}
      </div>
      {categoryKey === "auto" ? (
        <p className="border-b bg-info/6 px-3 py-1.5 text-[11px] text-info">
          웹이나 앱 서비스라면 쿠키 사용 여부를 확인하세요.
        </p>
      ) : null}
      {sectionHidden ? null : (
        <div className="flex flex-wrap gap-1.5 p-3">
          {suggestedNames.map((name) => (
            <OptionButton
              key={name}
              name={name}
              kind="normal"
              tier={tierByName.get(name)}
              suggested
              onToggle={() => onToggle(name)}
            />
          ))}
          {visibleRest.map((name) => (
            <OptionButton
              key={name}
              name={name}
              kind="normal"
              tier={tierByName.get(name)}
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

/**
 * 위치정보·간편인증·민감정보·생체정보·고유식별정보는 목적과 무관하게 늘 같은 분량이 노출되어
 * 목적을 몇 개 만들든 화면이 똑같이 길어졌다. 대부분의 목적에서는 쓰지 않는 항목들이므로
 * 기본은 접어 두고, 이미 고른 항목이 있는 카테고리만 요약으로 보여준다.
 */
function SpecialCategoriesSection({
  tierByName,
  onToggle,
}: {
  tierByName: Map<string, ConsentTier>;
  onToggle: (name: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const categoriesWithSelection = ALWAYS_SHOWN_CATEGORY_KEYS.filter((key) =>
    CATALOG[key]!.items.some((name) => tierByName.has(name)),
  );

  if (!expanded) {
    return (
      <div className="border-b p-3 last:border-b-0">
        {categoriesWithSelection.map((key) => {
          const category = CATALOG[key]!;
          return (
            <div key={key} className="mb-2 flex flex-wrap items-center gap-1.5 last:mb-0">
              <span className="text-[11px] font-semibold text-muted-foreground">{category.label}</span>
              {category.items
                .filter((name) => tierByName.has(name))
                .map((name) => (
                  <OptionButton
                    key={name}
                    name={name}
                    kind={category.kind ?? "normal"}
                    tier={tierByName.get(name)}
                    suggested={false}
                    onToggle={() => onToggle(name)}
                  />
                ))}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="rounded-full border px-2.75 py-1.25 text-xs text-muted-foreground hover:border-primary hover:text-primary"
        >
          ＋ 위치정보·민감정보·생체정보 등 특수한 개인정보 추가하기
        </button>
      </div>
    );
  }

  return (
    <div className="border-b last:border-b-0">
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
                  tier={tierByName.get(name)}
                  suggested={false}
                  onToggle={() => onToggle(name)}
                />
              ))}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => setExpanded(false)}
        className="w-full border-t px-2.5 py-2 text-center text-xs text-muted-foreground hover:bg-muted hover:text-primary"
      >
        특수한 개인정보 접기
      </button>
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
  const tierByName = new Map(selectedItems.map((item) => [item.name, item.tier] as const));
  const addAllSuggested = (names: string[]) => names.forEach((name) => onToggle(name));

  return (
    <div className="mt-3 rounded-lg border">
      {SUGGESTIBLE_CATEGORY_KEYS.map((key) => (
        <CategorySection
          key={key}
          categoryKey={key}
          suggestedNames={suggest[key] ?? []}
          tierByName={tierByName}
          onToggle={onToggle}
          onAddAllSuggested={addAllSuggested}
        />
      ))}

      <SpecialCategoriesSection tierByName={tierByName} onToggle={onToggle} />

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
