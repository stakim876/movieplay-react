// [면접] Zustand = 가벼운 전역 상태 라이브러리
// → Redux보다 코드가 적고, 컴포넌트 밖에서도 getState()로 값을 읽을 수 있습니다.
import { create } from "zustand";
// [면접] useShallow = 객체 여러 개를 한꺼번에 꺼낼 때, 값이 안 바뀌었으면 리렌더 안 함
// → 왜? { user, loading }처럼 객체를 매번 새로 만들면 참조가 달라져서 불필요 리렌더가 납니다.
import { useShallow } from "zustand/react/shallow";
import { auth } from "@/core/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
  type UserCredential,
} from "firebase/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  signup: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true, // 처음엔 "아직 모름" → Firebase가 알려줄 때까지 true

  login: async (email, password) => {
    if (!auth) {
      return Promise.reject(new Error("Firebase auth가 초기화되지 않았습니다."));
    }
    const credential = await signInWithEmailAndPassword(auth, email, password);
    set({ user: credential.user, loading: false });
    return credential;
  },

  signup: async (email, password) => {
    if (!auth) {
      return Promise.reject(new Error("Firebase auth가 초기화되지 않았습니다."));
    }
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    set({ user: credential.user, loading: false });
    return credential;
  },

  logout: async () => {
    if (!auth) {
      return Promise.reject(new Error("Firebase auth가 초기화되지 않았습니다."));
    }
    await signOut(auth);
    set({ user: null, loading: false });
  },
}));

// [면접] 구독 해제 함수를 저장해 두면, init이 또 불려도 리스너가 1개만 유지됩니다.
let authUnsubscribe: (() => void) | null = null;

export function initAuthStore() {
  if (authUnsubscribe) return;

  if (!auth) {
    console.error("Firebase auth가 초기화되지 않았습니다. .env 파일의 Firebase 설정을 확인해주세요.");
    useAuthStore.setState({ user: null, loading: false });
    return;
  }

  try {
    // [면접] onAuthStateChanged = Firebase가 로그인 상태를 알려주는 이벤트
    // → 새로고침 후 세션 복원, 로그인, 로그아웃 모두 이 콜백 하나로 처리
    // → useEffect가 아니라 init에서 등록: 앱 전체에서 user 정보의 기준점이 하나뿐이 되게
    // → 말하기: "인증은 단일 소스 of truth로 스토어에서 관리합니다."
    authUnsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        useAuthStore.setState({ user: currentUser, loading: false });
      },
      (error) => {
        console.error("Firebase 인증 상태 변경 오류:", error);
        useAuthStore.setState({ user: null, loading: false });
      }
    );
  } catch (error) {
    console.error("Firebase 인증 초기화 오류:", error);
    useAuthStore.setState({ user: null, loading: false });
  }
}

// [면접] useAuth() = 컴포넌트가 쓰기 편한 래퍼 훅
// → 컴포넌트는 useAuthStore를 직접 안 쓰고 useAuth()만 씁니다.
// → 나중에 스토어 구조가 바뀌어도 이 파일만 고치면 됩니다.
export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      loading: s.loading,
      login: s.login,
      signup: s.signup,
      logout: s.logout,
    }))
  );
}
