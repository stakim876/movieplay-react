import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { auth } from "@/services/firebase";
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
  loading: true,

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

let authUnsubscribe: (() => void) | null = null;

export function initAuthStore() {
  if (authUnsubscribe) return;

  if (!auth) {
    console.error("Firebase auth가 초기화되지 않았습니다. .env 파일의 Firebase 설정을 확인해주세요.");
    useAuthStore.setState({ user: null, loading: false });
    return;
  }

  try {
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
