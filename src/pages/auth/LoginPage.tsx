import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "@/stores/authStore";
import { auth } from "@/services/firebase";
import "@/styles/common/common.css";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/who", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const trimmedEmail = email.trim();

    if (!auth) {
      setError("Firebase가 설정되지 않았습니다. .env 파일을 확인한 뒤 개발 서버를 재시작해주세요.");
      return;
    }

    if (!trimmedEmail) {
      setError("이메일을 입력해주세요.");
      return;
    }

    try {
      setSubmitting(true);
      await login(trimmedEmail, password);
      navigate("/who", { replace: true });
    } catch (err: any) {
      console.error("로그인 실패:", err);
      const code = err?.code as string | undefined;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError(
          "이메일 또는 비밀번호가 올바르지 않습니다. Firebase 프로젝트(react-video-streaming-8cc30)에 가입한 계정인지 확인해주세요."
        );
      } else if (code === "auth/invalid-email") {
        setError("올바른 이메일 형식이 아닙니다.");
      } else if (code === "auth/too-many-requests") {
        setError("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.");
      } else if (code === "auth/network-request-failed") {
        setError("네트워크 오류입니다. 인터넷 연결을 확인해주세요.");
      } else {
        setError(err?.message || "로그인에 실패했습니다.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setError(null);
    setInfo(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("비밀번호 재설정을 위해 이메일을 먼저 입력해주세요.");
      return;
    }
    if (!auth) {
      setError("Firebase가 설정되지 않았습니다.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      setInfo("비밀번호 재설정 메일을 보냈습니다. 받은편지함을 확인해주세요.");
    } catch (err: any) {
      const code = err?.code as string | undefined;
      if (code === "auth/user-not-found") {
        setError("이 이메일로 가입된 계정이 없습니다. 회원가입을 먼저 진행해주세요.");
      } else {
        setError(err?.message || "비밀번호 재설정 메일 전송에 실패했습니다.");
      }
    }
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-box">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">로그인</h1>

        <form onSubmit={handleLogin}>
          {error && <p className="error">{error}</p>}
          {info && <p className="info" style={{ color: "#4ade80", marginBottom: "0.75rem" }}>{info}</p>}

          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <button type="submit" className="login-btn" disabled={submitting}>
            {submitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="signup-link">
          <button type="button" className="link-btn" onClick={handlePasswordReset} style={{ background: "none", border: "none", color: "#93c5fd", cursor: "pointer", padding: 0 }}>
            비밀번호를 잊으셨나요?
          </button>
        </p>

        <p className="signup-link">
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
}
