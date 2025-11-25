import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PrivateRoute({ children }) {
  const auth = useAuth();
  if (!auth) return null; 

  const { user } = auth;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
