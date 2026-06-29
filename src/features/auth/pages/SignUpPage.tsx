import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/stores/authStore";
import { db } from "@/core/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import "@/styles/common/common.css";

function getSignUpErrorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code;
  if (code === "auth/email-already-in-use") {
    return "이미 가입된 이메일입니다. 로그인을 시도해주세요.";
  }
  if (code === "auth/invalid-email") {
    return "올바른 이메일 형식이 아닙니다.";
  }
  if (code === "auth/weak-password") {
    return "비밀번호는 6자 이상이어야 합니다.";
  }
  if (code === "auth/operation-not-allowed") {
    return "Firebase 콘솔에서 이메일/비밀번호 로그인을 활성화해주세요.";
  }
  if (code === "auth/network-request-failed") {
    return "네트워크 오류입니다. 인터넷 연결을 확인해주세요.";
  }
  if (code === "permission-denied") {
    return "Firestore 권한 오류입니다. Firebase 규칙을 확인해주세요.";
  }
  return (err as Error)?.message || "회원가입에 실패했습니다.";
}

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (form.password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signup(form.email.trim(), form.password);

      if (db) {
        try {
          await setDoc(doc(db, "users", userCredential.user.uid), {
            name: form.name,
            email: form.email.trim(),
            profileName: form.name,
            createdAt: serverTimestamp(),
          });
        } catch (firestoreErr) {
          console.warn("Firestore 프로필 저장 실패 (로그인은 성공):", firestoreErr);
        }
      }

      navigate("/who", { replace: true });
    } catch (err) {
      console.error("회원가입 실패:", err);
      setError(getSignUpErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-box" onSubmit={handleSubmit}>
        <h2>회원가입</h2>

        <input
          type="text"
          name="name"
          placeholder="이름"
          value={form.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="이메일"
          value={form.email}
          onChange={handleChange}
          required
          autoComplete="email"
        />

        <input
          type="password"
          name="password"
          placeholder="비밀번호 (6자 이상)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="비밀번호 확인"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
          autoComplete="new-password"
        />

        {error && <p className="error">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "가입 중..." : "가입하기"}
        </button>

        <p className="login-link">
          이미 계정이 있나요? <Link to="/login">로그인</Link>
        </p>
      </form>
    </div>
  );
}
