import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

/**
 * Splits heading text into words for the "words rise" reveal, keeping inline
 * elements like <em> (and their styling) intact. Works on the server.
 * Each word is <span class="w"><span style="--i:n">word</span></span>; the
 * parent needs data-aos="words" (styles in globals.css).
 */
export function SplitWords({ children }: { children: ReactNode }) {
  let i = 0;
  const walk = (node: ReactNode): ReactNode =>
    Children.map(node, (child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child)
          .split(/(\s+)/)
          .map((part, k) => {
            if (!part) return null;
            if (/^\s+$/.test(part)) return " ";
            const n = i++;
            return (
              <span key={`${n}-${k}`} className="w">
                <span style={{ "--i": n } as React.CSSProperties}>{part}</span>
              </span>
            );
          });
      }
      if (isValidElement(child)) {
        const el = child as ReactElement<{ children?: ReactNode }>;
        if (el.props.children === undefined) return el;
        return cloneElement(el, undefined, walk(el.props.children));
      }
      return child;
    });
  return <>{walk(children)}</>;
}
