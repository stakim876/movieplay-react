import { type ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";
import PageLoader from "@/shared/ui/PageLoader";

export function StoreBootstrap({ children }: { children: ReactNode }) {
  const authLoading = useAuthStore((s) => s.loading);

  if (authLoading) return <PageLoader label="MoviePlay 준비 중..." />;

  return children;
}
