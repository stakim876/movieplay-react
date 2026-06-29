import { Navigate } from "react-router-dom";
import { useAuth } from "@/stores/authStore";

// [면접] PrivateRoute + "관리자인지" 추가 확인
// → 동작: 로그인했어도 role이 admin이 아니면 /home으로 보냄
// → 말하기: "클라이언트 가드는 UX용이고, 진짜 보안은 서버에서 권한을 검증해야 합니다."
export default function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user || (user as any).role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return children;
}
