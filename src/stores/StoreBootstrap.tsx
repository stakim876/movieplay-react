import { type ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";

export function StoreBootstrap({ children }: { children: ReactNode }) {
  const authLoading = useAuthStore((s) => s.loading);

  if (authLoading) return null;

  return children;
}
