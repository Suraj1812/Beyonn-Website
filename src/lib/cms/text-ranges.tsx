import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { pageOverrideKey, textFormatProps, type TextRange } from "./visual";

type TextElement = ReactElement<{ children?: ReactNode }>;

function textOf(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  return Children.toArray(node).map((child) =>
    isValidElement(child) ? textOf((child as TextElement).props.children) : String(child ?? ""),
  ).join("");
}

export function textRangesFor(
  ranges: Record<string, TextRange[]> | undefined,
  path: string,
  source: string,
) {
  const local = ranges?.[pageOverrideKey(path, "text", source)] ?? [];
  const shared = ranges?.[`text:${source}`] ?? [];
  return [...shared.filter((item) =>
    !local.some((specific) => specific.start < item.end && specific.end > item.start)),
    ...local,
  ];
}

export function replaceSelectedWords(text: string, ranges: TextRange[]) {
  return [...ranges].sort((a, b) => b.start - a.start).reduce(
    (result, { start, end, original, text: replacement }) =>
      replacement !== undefined && text.slice(start, end) === original
        ? result.slice(0, start) + replacement + result.slice(end)
        : result,
    text,
  );
}

/** Map normalized text offsets back to the React text nodes without removing existing markup. */
export function renderTextRanges(children: ReactNode, ranges: TextRange[], editing: boolean): ReactNode {
  if (!ranges.length) return children;
  const raw = textOf(children);
  const offsets: number[] = [];
  for (const match of raw.matchAll(/\S+|\s+/g)) {
    const start = match.index;
    if (/^\s/.test(match[0])) {
      if (offsets.length && start + match[0].length < raw.length) offsets.push(start);
    } else {
      for (let index = 0; index < match[0].length; index++) offsets.push(start + index);
    }
  }
  const canonical = raw.replace(/\s+/g, " ").trim();
  const runs = ranges
    .filter(({ start, end, original }) => canonical.slice(start, end) === original && end <= offsets.length)
    .sort((a, b) => a.start - b.start)
    .map((range) => ({ range, start: offsets[range.start], end: offsets[range.end - 1] + 1 }));
  if (!runs.length) return children;

  let cursor = 0;
  function decorate(node: ReactNode): ReactNode {
    if (Array.isArray(node)) return Children.map(node, decorate);
    if (isValidElement(node)) {
      const element = node as TextElement;
      return element.props.children === undefined ? node : cloneElement(element, {}, decorate(element.props.children));
    }
    if (typeof node !== "string" && typeof node !== "number") return node;
    const value = String(node);
    const start = cursor;
    const end = start + value.length;
    cursor = end;
    const pieces: ReactNode[] = [];
    let used = start;
    for (const { range, start: from, end: to } of runs) {
      if (to <= used || from >= end) continue;
      const first = Math.max(from, used);
      const last = Math.min(to, end);
      if (first > used) pieces.push(value.slice(used - start, first - start));
      const display = range.text === undefined ? value.slice(first - start, last - start) : first === from ? range.text : "";
      if (display) {
        pieces.push(
          <span key={`${from}:${first}`} data-cms-inline-range=""
            data-cms-selected-range={editing ? JSON.stringify(range) : undefined}
            {...textFormatProps(range)}>
            {display}
          </span>,
        );
      }
      used = last;
    }
    if (!pieces.length && used === start) return node;
    if (used < end) pieces.push(value.slice(used - start));
    return pieces;
  }
  return decorate(children);
}
