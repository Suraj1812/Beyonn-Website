"use client";

import type { ReactNode } from "react";
import { useLinkStatus } from "next/link";
import { useCms, useCmsText } from "@/components/control/CmsProvider";
import { Localized } from "@/components/i18n/Localized";
import { normalize } from "@/lib/cms/model";
import { loadingTextSource } from "@/lib/cms/visual";

export function NavigationButtonLabel({ children, className }: {
  children: ReactNode;
  className?: string;
}) {
  const { pending } = useLinkStatus();
  const { editing } = useCms();
  const resolve = useCmsText();
  const source = typeof children === "string" ? normalize(children) : "";
  const key = source && loadingTextSource(source);
  const loading = key ? resolve(key) : "";
  const showLoading = pending && loading && loading !== key;

  return (
    <Localized>
      <span className={className} aria-live={loading !== key ? "polite" : undefined}
        data-cms-loading-label={editing && source ? source : undefined}>
        {showLoading ? loading : children}
      </span>
    </Localized>
  );
}

NavigationButtonLabel.cmsLocalizedBoundary = true;
