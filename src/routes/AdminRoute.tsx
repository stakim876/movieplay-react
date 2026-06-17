import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/authStore";

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || (user as any).role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
}
