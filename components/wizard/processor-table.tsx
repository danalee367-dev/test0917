"use client";

import { useState } from "react";
import { useWizard } from "./wizard-context";
import type { Processor } from "@/lib/consent-policy/types";

function ProcessorRow({
  processor,
  onRemove,
  onSave,
}: {
  processor: Processor;
  onRemove: () => void;
  onSave: (next: Processor) => void;
}) {
  const { showToast } = useWizard();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(processor);

  if (!editing) {
    return (
      <tr className="border-b text-sm last:border-b-0">
        <td className="p-2.5">{processor.name}</td>
        <td className="p-2.5">{processor.work}</td>
        <td className="p-2.5 text-right whitespace-nowrap">
          <button
            type="button"
            onClick={() => {
              setDraft(processor);
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

  return (
    <tr className="border-b bg-primary/5 text-sm last:border-b-0">
      <td className="p-2.5">
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          className="h-8 w-full rounded-md border bg-card px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </td>
      <td className="p-2.5">
        <input
          value={draft.work}
          onChange={(e) => setDraft({ ...draft, work: e.target.value })}
          className="h-8 w-full rounded-md border bg-card px-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </td>
      <td className="p-2.5 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={() => {
            if (!draft.name.trim() || !draft.work.trim()) {
              showToast("빈 칸이 있습니다. 모두 채워주세요");
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

export function ProcessorTable({
  processors,
  onRemove,
  onUpdate,
}: {
  processors: Processor[];
  onRemove: (name: string) => void;
  onUpdate: (index: number, processor: Processor) => void;
}) {
  if (processors.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-7 text-center">
        <p className="mb-1.5 text-sm font-semibold">추가한 수탁사가 없습니다</p>
        <p className="text-xs text-muted-foreground">아래 목록에서 고르거나 직접 입력하세요.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted text-left text-xs font-semibold text-muted-foreground">
            <th className="p-2.5">위탁받는 자 (수탁사)</th>
            <th className="p-2.5">위탁하는 업무의 내용</th>
            <th className="p-2.5" />
          </tr>
        </thead>
        <tbody>
          {processors.map((processor, index) => (
            <ProcessorRow
              key={processor.name}
              processor={processor}
              onRemove={() => onRemove(processor.name)}
              onSave={(next) => onUpdate(index, next)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
