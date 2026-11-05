import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "dark" | "dawn" | "light" | "ghost" | "ghost-light";

const variantClass: Record<Variant, string> = {
  dark: "",
  dawn: "btn--dawn",
  light: "btn--light",
  ghost: "btn--ghost",
  "ghost-light": "btn--ghost-light",
};

type Props = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: "md" | "sm";
  icon?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

export function Button({ href, children, variant = "dark", size = "md", icon = true, className, ...rest }: Props) {
  const external = /^(https?:|mailto:|tel:)/.test(href);
  const cls = cn("btn", variantClass[variant], size === "sm" && "btn--sm", className);
  const magnetic = variant === "dawn" || variant === "light" ? { "data-magnetic": "" } : {};
  const inner = (
    <>
      <span>{children}</span>
      {icon && <ArrowUpRight aria-hidden />}
    </>
  );
  if (external) {
    return (
      <a href={href} className={cls} {...magnetic} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...magnetic} {...rest}>
      {inner}
    </Link>
  );
}

export function ButtonRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>;
}
