// src/components/providers/SessionProviderWrapper.tsx
// NextAuth a besoin de son propre Provider pour que useSession() fonctionne côté client.
"use client";

import { SessionProvider } from "next-auth/react";

export function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}