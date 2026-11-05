import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function ArrowLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href} className={cn("link-arrow", className)}>
      <span className="link-u">{children}</span>
      <ArrowRight aria-hidden className="size-4" />
    </Link>
  );
}
