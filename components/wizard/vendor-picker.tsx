"use client";

import { cn } from "@/lib/utils";

export function VendorPicker<T extends { name: string }>({
  vendors,
  selectedNames,
  onToggle,
  renderWork,
}: {
  vendors: T[];
  selectedNames: Set<string>;
  onToggle: (vendor: T) => void;
  renderWork: (vendor: T) => string;
}) {
  return (
    <div className="max-h-75 overflow-y-auto rounded-lg border">
      {vendors.map((vendor) => {
        const selected = selectedNames.has(vendor.name);
        return (
          <button
            key={vendor.name}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(vendor)}
            className={cn(
              "flex w-full items-start gap-3 border-b p-3 text-left text-sm last:border-b-0 hover:bg-muted",
              selected && "bg-primary/7",
            )}
          >
            <span className="w-47.5 shrink-0 text-[13px] font-semibold">{vendor.name}</span>
            <span className="text-xs leading-relaxed text-muted-foreground">{renderWork(vendor)}</span>
            <span className={cn("ml-auto shrink-0 text-[13px] font-bold text-primary", !selected && "opacity-0")}>
              ✓
            </span>
          </button>
        );
      })}
    </div>
  );
}
