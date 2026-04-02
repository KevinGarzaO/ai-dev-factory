"use client";

import { BacklogProvider } from "@/context/BacklogContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <BacklogProvider>{children}</BacklogProvider>;
}
