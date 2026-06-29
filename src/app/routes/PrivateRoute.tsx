import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/authStore";
import PageLoader from "@/shared/ui/PageLoader";

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
