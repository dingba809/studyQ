"use client";

import { useState } from "react";
import type { Framework, FrameworkNode, KeyPoint } from "@/lib/types";

type Props = {
  framework: Framework | null;
  keyPoints: KeyPoint[];
};

function NodeView({
  node,
  depth,
  keyPoints,
}: {
  node: FrameworkNode;
  depth: number;
  keyPoints: KeyPoint[];
}) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = Boolean(node.children?.length);
  const linked = (node.keyPointIds ?? [])
    .map((id) => keyPoints.find((k) => k.id === id)?.text)
    .filter(Boolean) as string[];

  return (
    <li className="list-none">
      <div
        className="flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? "Collapse" : "Expand"}
            onClick={() => setOpen((v) => !v)}
            className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border border-zinc-300 text-[10px] dark:border-zinc-600"
          >
            {open ? "−" : "+"}
          </button>
        ) : (
          <span className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{node.label}</p>
          {linked.length > 0 && depth > 0 && (
            <p className="mt-0.5 text-xs text-zinc-500">{linked[0]}</p>
          )}
        </div>
      </div>
      {hasChildren && open && (
        <ul className="space-y-0.5 border-l border-zinc-200 dark:border-zinc-700 ml-4">
          {node.children!.map((child) => (
            <NodeView key={child.id} node={child} depth={depth + 1} keyPoints={keyPoints} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function FrameworkTab({ framework, keyPoints }: Props) {
  if (!framework) {
    return (
      <Empty
        title="No framework yet"
        body="Generate a study pack from the Notes tab to see your knowledge framework."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Knowledge framework</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          A concept map of how ideas in your notes connect. Expand branches to explore.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <ul>
          <NodeView node={framework.root} depth={0} keyPoints={keyPoints} />
        </ul>
      </div>

      {keyPoints.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Key points ({keyPoints.length})
          </h3>
          <ol className="space-y-2">
            {keyPoints.map((kp, i) => (
              <li
                key={kp.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800/50"
              >
                <span className="mr-2 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                  {i + 1}.
                </span>
                {kp.text}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
      <p className="font-medium text-zinc-800 dark:text-zinc-100">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{body}</p>
    </div>
  );
}
