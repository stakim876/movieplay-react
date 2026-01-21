import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/services/firebase";  

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      console.error("Firebase auth가 초기화되지 않았습니다. .env 파일의 Firebase 설정을 확인해주세요.");
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      }, (error) => {
        console.error("Firebase 인증 상태 변경 오류:", error);
        setUser(null);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Firebase 인증 초기화 오류:", error);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = (email, password) => {
    if (!auth) {
      return Promise.reject(new Error("Firebase auth가 초기화되지 않았습니다."));
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signup = (email, password) => {
    if (!auth) {
      return Promise.reject(new Error("Firebase auth가 초기화되지 않았습니다."));
    }
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    if (!auth) {
      return Promise.reject(new Error("Firebase auth가 초기화되지 않았습니다."));
    }
    return signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn("useAuth must be used within AuthProvider");
    return { user: null, login: null, signup: null, logout: null };
  }
  return context;
}
