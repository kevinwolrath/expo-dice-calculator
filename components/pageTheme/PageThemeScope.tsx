import { createContext, type ReactNode } from "react";

import type { PageThemeId } from "@/constants/pageTheme";

export const PageThemeContext = createContext<PageThemeId | null>(null);

export function PageThemeScope({
  pageId,
  children,
}: {
  pageId: PageThemeId | null;
  children: ReactNode;
}) {
  return (
    <PageThemeContext.Provider value={pageId}>
      {children}
    </PageThemeContext.Provider>
  );
}
