"use client";

import { useState } from "react";
import { COMPANY } from "@/lib/consent-policy/company";
import type { PolicyDocument } from "@/lib/consent-policy/documents";
import { buildPolicySections, type PolicyBlock } from "@/lib/consent-policy/policy-sections";
import { cn } from "@/lib/utils";

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <table className="mb-3.5 w-full border border-foreground text-xs">
      <thead>
        <tr className="bg-muted">
          {headers.map((h) => (
            <th key={h} className="border border-foreground p-2 text-left">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="border border-foreground p-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** 조항 본문 조각 하나를 화면에 그린다. 조항의 구성·순서·문구는 policy-sections.ts에서만 결정한다. */
function BlockView({ block }: { block: PolicyBlock }) {
  switch (block.kind) {
    case "p":
      return <p className="mb-3">{block.text}</p>;
    case "sub-heading":
      return <h5 className="mb-2 text-sm font-bold">{block.text}</h5>;
    case "table":
      return <Table headers={block.headers} rows={block.rows} />;
    case "list":
      return (
        <p className="mb-3">
          {block.items.map((item, i) => (
            <span key={item}>
              {item}
              {i < block.items.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      );
    case "fields":
      return (
        <p className="mb-3">
          {block.items.map((item, i) => (
            <span key={item}>
              {item}
              {i < block.items.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      );
  }
}

export function PolicyDocumentView({ doc }: { doc: PolicyDocument }) {
  const [flashedId, setFlashedId] = useState<string | null>(null);
  const sections = buildPolicySections(doc);

  const goto = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ block: "start", behavior: "smooth" });
    setFlashedId(id);
    setTimeout(() => setFlashedId((current) => (current === id ? null : current)), 1600);
  };

  return (
    <div className="rounded-xl border bg-card p-10 text-sm leading-[1.8]">
      <p className="mb-5.5 text-center text-[17px] font-bold">개인정보 처리방침</p>
      <p className="mb-3">
        {COMPANY.name}(이하 &quot;회사&quot;)는 회사가 제공하는{" "}
        <span className="font-semibold text-primary">{doc.serviceName}</span> 서비스(이하
        &quot;서비스&quot;)를 이용하는 이용자님의 개인정보를 보호하기 위하여 「개인정보 보호법」 등 관련 법령상의
        개인정보 보호 규정을 준수하고 있으며, 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한
        절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이
        개인정보 처리방침을 수립·공개합니다.
      </p>
      <p className="mb-5.5 text-right text-xs text-muted-foreground">시행일: {doc.effectiveDateLabel}</p>

      <div className="mb-6 rounded-lg bg-muted p-4 text-xs">
        <ol className="columns-1 list-decimal space-y-1 pl-4.5 sm:columns-2">
          {sections.map((section, i) => (
            <li key={section.title}>
              <a
                href={`#sec-${i + 1}`}
                onClick={goto(`sec-${i + 1}`)}
                className="border-b border-transparent hover:border-primary hover:text-primary"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </div>

      {sections.map((section, i) => {
        const id = `sec-${i + 1}`;
        return (
          <div key={section.title}>
            <h4
              id={id}
              className={cn(
                "mt-6.5 mb-2 -ml-1.75 scroll-mt-4 rounded px-1.75 text-sm font-bold transition-colors",
                flashedId === id && "bg-primary/12",
              )}
            >
              {i + 1}. {section.title}
            </h4>
            {section.body.map((block, j) => (
              <BlockView key={j} block={block} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
