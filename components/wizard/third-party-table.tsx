"use client";

import { useState } from "react";
import { useWizard } from "./wizard-context";
import type { ThirdParty } from "@/lib/consent-policy/types";

function ThirdPartyRow({
  thirdParty,
  onRemove,
  onSave,
}: {
  thirdParty: ThirdParty;
  onRemove: () => void;
  onSave: (next: ThirdParty) => void;
}) {
  const { showToast } = useWizard();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(thirdParty);

  if (!editing) {
    return (
      <tr className="border-b text-sm last:border-b-0">
        <td className="p-2.5">{thirdParty.name}</td>
        <td className="p-2.5">{thirdParty.purpose}</td>
        <td className="p-2.5">{thirdParty.items}</td>
        <td className="p-2.5">{thirdParty.retention}</td>
        <td className="p-2.5 text-right whitespace-nowrap">
          <button
            type="button"
            onClick={() => {
              setDraft(thirdParty);
              setEditing(true);
            }}
            className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
          >
            수정
          </button>
          <button type="button" onClick={onRemove} className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted">
            삭제
          </button>
        </td>
      </tr>
    );
  }

  const fields: Array<{ key: keyof ThirdParty; label: string }> = [
    { key: "name", label: "제공받는 자" },
    { key: "purpose", label: "제공 목적" },
    { key: "items", label: "제공 항목" },
    { key: "retention", label: "보유 및 이용기간" },
  ];

  return (
    <tr className="border-b bg-primary/5 text-sm last:border-b-0">
      {fields.map((field) => (
        <td key={field.key} className="p-2.5">
          <input
            aria-label={field.label}
            value={draft[field.key]}
            onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
            className="h-8 w-full rounded-md border bg-card px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </td>
      ))}
      <td className="p-2.5 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => {
            if (!draft.name.trim() || !draft.purpose.trim() || !draft.items.trim() || !draft.retention.trim()) {
              showToast("제공받는 자, 목적, 항목, 보유기간을 모두 적어주세요");
              return;
            }
            onSave(draft);
            setEditing(false);
          }}
          className="rounded-lg bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground"
        >
          저장
        </button>
      </td>
    </tr>
  );
}

export function ThirdPartyTable({
  thirdParties,
  onRemove,
  onUpdate,
}: {
  thirdParties: ThirdParty[];
  onRemove: (name: string) => void;
  onUpdate: (index: number, thirdParty: ThirdParty) => void;
}) {
  if (thirdParties.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-7 text-center">
        <p className="mb-1.5 text-sm font-semibold">추가한 제3자 제공이 없습니다</p>
        <p className="text-xs text-muted-foreground">회사 대표 처리방침의 사례에서 고르거나 직접 입력하세요.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted text-left text-xs font-semibold whitespace-nowrap text-muted-foreground">
            <th className="p-2.5">제공받는 자</th>
            <th className="p-2.5">제공 목적</th>
            <th className="p-2.5">제공 항목</th>
            <th className="p-2.5">보유 및 이용기간</th>
            <th className="p-2.5" />
          </tr>
        </thead>
        <tbody>
          {thirdParties.map((thirdParty, index) => (
            <ThirdPartyRow
              key={thirdParty.name}
              thirdParty={thirdParty}
              onRemove={() => onRemove(thirdParty.name)}
              onSave={(next) => onUpdate(index, next)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
